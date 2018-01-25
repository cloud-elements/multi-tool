'use strict';

const {resolve} = require('path');
const diff = require('date-fns/difference_in_milliseconds');
const sleep = require('es7-sleep');
const {isEmpty} = require('ramda');
const {isNotEmpty} = require('ramda-adjunct');
const {create, env} = require('sanctuary');
const {clean, lock, stat, swap, unlock} = require('./fs');
const {install: pack} = require('./package');

const {Left, Right} = create({checkTypes: false, env});
const delay = 10000;
const timeout = 60000;

const install = async (path, name, version, delayed) => {
	if (delayed >= timeout) {
		return Left(new Error('Delayed exceeds timeout'));
	}

	const date = new Date();
	const lockedPath = resolve(path, `${name.replace('/', '_')}@${version}.lock`);
	const lockedStat = stat(lockedPath);
	const lockedAge = isEmpty(lockedStat) ? Number.MAX_SAFE_INTEGER : diff(date, lockedStat.mtime);
	const locked = lockedAge <= timeout;

	if (!locked) {
		const installedPath = resolve(path, `${name}@${version}`);
		const installingPath = resolve(path, `${name}@${version}.install`);
		const installedStat = stat(installedPath);
		const installed = isNotEmpty(installedStat);

		if (installed) {
			return Right({delayed, installed: false, name, version});
		}

		try {
			lock(lockedPath);
			await clean(installingPath); // In case of previous mid-install failure
			await pack(installingPath, name, version);
			await swap(installingPath, installedPath);
			await unlock(lockedPath);

			return Right({delayed, installed: true, name, version});
		} catch (err) {
			await clean(installingPath);
			await unlock(lockedPath);

			return Left(err);
		}
	} else {
		await sleep(delay);

		return install(path, name, version, (delayed + delay));
	}
};

module.exports = {install: (path, name, version) => install(path, name, version, 0)};

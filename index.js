'use strict';

const {resolve} = require('path');
const diff = require('date-fns/difference_in_milliseconds');
const sleep = require('es7-sleep');
const shell = require('execa');
const fse = require('fs-extra');
const fs = require('graceful-fs');
const pify = require('pify');
const {T, always, isEmpty, tryCatch} = require('ramda');
const {create, env} = require('sanctuary');

const {Left, Right} = create({checkTypes: false, env});
const mkdirp = pify(fse.mkdirs);
const rename = fs.renameSync;
const writeFile = pify(fs.writeFile);

const remove = async path => {
	try {
		await pify(fse.remove)(path);
	} catch (err) {}
};
const stat = tryCatch(fs.statSync, always({}));
const touch = path => fs.closeSync(fs.openSync(path, 'w', 0o644));

const lock = path => touch(path);
const install = async (path, name, version) => {
	const jsonPath = resolve(path, 'package.json');
	const jsonContents = JSON.stringify({
		name: `${name}-${version}`,
		version: '0.0.0',
		main: 'index.js',
		dependencies: {[name]: version}
	});
	const jsPath = resolve(path, 'index.js');
	const jsContents = `module.exports = require('${name}');`;

	await mkdirp(path, {mode: 0o755});
	await writeFile(jsonPath, jsonContents, {mode: 0o644});
	await writeFile(jsPath, jsContents, {mode: 0o644});
	await shell('npm', ['cache', 'clean', `${name}@${version}`], {cwd: path});
	await shell('npm', ['install'], {cwd: path});
};
const swap = (from, to) => rename(from, to);
const clean = path => remove(path);
const unlock = clean;

const attempt = async ({delay, invalidate, path, timeout}, name, version, delayed) => {
	if (delayed >= timeout) {
		return Left('Non-performant install');
	}

	const date = new Date();
	const lockedPath = resolve(path, `${name.replace('/', '_')}@${version}.lock`);
	const lockedStat = stat(lockedPath);
	const lockedAge = isEmpty(lockedStat) ? Number.MAX_SAFE_INTEGER : diff(date, lockedStat.mtime);
	const locked = lockedAge <= timeout;

	if (!locked) {
		const installedPath = resolve(path, `${name}@${version}`);
		const installingPath = resolve(path, `${name}@${version}.install`);
		const uninstallingPath = resolve(path, `${name}@${version}.uninstall`);
		const installedStat = stat(installedPath);
		const installedAge = isEmpty(installedStat) ? Number.MAX_SAFE_INTEGER : diff(date, installedStat.mtime);
		const installed = installedAge !== Number.MAX_SAFE_INTEGER;

		if (installed && !invalidate(name, version, installedAge)) {
			return Right({delayed: 0, installed: false, name, uninstalled: false, version});
		}

		try {
			lock(lockedPath);
			// The two clean statements handle for potential bad state if a node process somehow crashes mid-install.
			await clean(installingPath);
			await clean(uninstallingPath);
			await install(installingPath, name, version);

			if (installed) {
				swap(installedPath, uninstallingPath);
				swap(installingPath, installedPath);
				await clean(uninstallingPath);
			} else {
				swap(installingPath, installedPath);
			}

			await unlock(lockedPath);

			return Right({delayed, installed: true, name, uninstalled: installed, version});
		} catch (err) {
			await clean(uninstallingPath);
			await clean(installingPath);
			await unlock(lockedPath);

			return Left(err.message);
		}
	} else {
		await sleep(delay);
		return attempt({delay, invalidate, path, timeout}, name, version, (delayed + delay));
	}
};

module.exports = ({delay = 5000, invalidate = T, path, timeout = 60000}) => (name, version) =>
	attempt({delay, invalidate, path, timeout}, name, version, 0);

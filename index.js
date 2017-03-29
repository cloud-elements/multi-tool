'use strict';

const {resolve} = require('path');
const diff = require('date-fns/difference_in_milliseconds');
const sleep = require('es7-sleep');
const shell = require('execa');
const fse = require('fs-extra');
const fs = require('graceful-fs');
const pify = require('pify');
const {T, always, ifElse, isEmpty, tryCatch} = require('ramda');
const {create, env} = require('sanctuary');

const {Left, Right} = create({checkTypes: false, env});
const mkdirp = pify(fse.mkdirs);
const rename = fs.renameSync;
const writeFile = pify(fs.writeFile);

const exists = tryCatch(fs.existsSync, always({}));
const remove = async path => {
	try {
		await pify(fse.remove)(path);
	} catch (err) {}
};
const stat = tryCatch(fs.statSync, always({}));
const touch = fse.mkdirsSync;

const installer = ({delay, invalidate, path, timeout}) => async (name, version) => {
	const prefixInstalled = resolve(path, `${name}@${version}`);
	const prefixInstalling = resolve(path, `${name}@${version}.install`);
	const prefixUninstalling = resolve(path, `${name}@${version}.uninstall`);
	const prefixLock = resolve(path, `${name}@${version}.lock`);

	const attempt = async delayed => {
		if (delayed >= timeout) {
			return Left('Non-performant install');
		}

		const locked = exists(prefixLock);
		const stats = stat(prefixInstalled);

		const lock = () => touch(prefixLock, {mode: 0o755});
		const install = async () => {
			const jsonPath = resolve(prefixInstalling, 'package.json');
			const jsonContents = JSON.stringify({
				name: `${name}-${version}`,
				version: '0.0.0',
				main: 'index.js',
				dependencies: {[name]: version}
			});
			const jsPath = resolve(prefixInstalling, 'index.js');
			const jsContents = `module.exports = require('${name}');`;

			await mkdirp(prefixInstalling, {mode: 0o755});
			await writeFile(jsonPath, jsonContents, {mode: 0o644});
			await writeFile(jsPath, jsContents, {mode: 0o644});
			await shell('npm', ['install'], {cwd: prefixInstalling});
		};
		const swapUninstalling = () => rename(prefixInstalled, prefixUninstalling);
		const swapInstalling = () => rename(prefixInstalling, prefixInstalled);
		const cleanUninstalling = () => remove(prefixUninstalling);
		const cleanInstalling = () => remove(prefixInstalling);
		const unlock = () => remove(prefixLock);

		if (!locked) {
			const age = ifElse(isEmpty, always(Number.MAX_SAFE_INTEGER), u => diff(new Date(), u.ctime))(stats);
			const installed = age !== Number.MAX_SAFE_INTEGER;

			if (installed && !invalidate(name, version, age)) {
				return Right({delayed: 0, installed: false, name, uninstalled: false, version});
			}

			try {
				lock();
				await install();

				if (installed) {
					swapUninstalling();
					swapInstalling();
					await cleanUninstalling();
				} else {
					swapInstalling();
				}

				await unlock();

				return Right({delayed, installed: true, name, uninstalled: installed, version});
			} catch (err) {
				await cleanUninstalling();
				await cleanInstalling();
				await unlock();

				return Left(err.message);
			}
		} else {
			await sleep(delay);
			return attempt(delayed + delay);
		}
	};

	return attempt(0);
};

module.exports = ({delay = 5000, invalidate = T, path, timeout = 60000}) =>
	installer({delay, invalidate, path, timeout});

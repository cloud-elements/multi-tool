'use strict';

const {resolve} = require('path');
const diff = require('date-fns/difference_in_milliseconds');
const sleep = require('es7-sleep');
const shell = require('execa');
const fse = require('fs-extra');
const fs = require('graceful-fs');
const registry = require('package-json');
const pify = require('pify');
const {F, T, always, cond, equals, identity, ifElse, isEmpty} = require('ramda');
const {create, env} = require('sanctuary');

const {Left, Right} = create({checkTypes: false, env});
const mkdirp = pify(fse.mkdirp);
const rename = fs.renameSync;
const remove = pify(fse.remove);
const stat = pify(fs.stat);
const writeFile = pify(fs.writeFile);

const exists = (name, version) => registry(name, version).then(T).catch(F);
const stats = p => stat(p).then(identity).catch(always({}));

const installer = ({delay, invalidate, path, timeout}) => async (name, version) => {
	const prefixInstalled = resolve(path, `${name}@${version}`);
	const prefixInstalling = resolve(path, `${name}@${version}.install`);
	const prefixUninstalling = resolve(path, `${name}@${version}.uninstall`);
	const installing = await stats(prefixInstalling);
	const installed = await stats(prefixInstalled);

	const install = async (uninstall, delayed) => {
		if (!(await exists(name, version))) {
			return Left(new Error('Non-existent NPM package'));
		}

		const jsonPath = resolve(prefixInstalling, 'package.json');
		const jsonContents = JSON.stringify({
			name: `${name}-${version}`,
			version: '0.0.0',
			main: 'index.js',
			dependencies: {[name]: version}
		});
		const jsPath = resolve(prefixInstalling, 'index.js');
		const jsContents = `module.exports = require('${name}');`;

		try {
			await mkdirp(prefixInstalling, {mode: 0o755});
			await writeFile(jsonPath, jsonContents, {mode: 0o644});
			await writeFile(jsPath, jsContents, {mode: 0o644});
			await shell('npm', ['install'], {cwd: prefixInstalling});

			ifElse(
				isEmpty,
				() => rename(prefixInstalling, prefixInstalled),
				() => {
					rename(prefixInstalled, prefixUninstalling);
					rename(prefixInstalling, prefixInstalled);
				}
			)(installed);

			await remove(prefixUninstalling);

			return Right({delayed, installed: true, name, uninstalled: uninstall, version});
		} catch (err) /* istanbul ignore next */ {
			try {
				await remove(prefixUninstalling);
			} catch (err) {}
			try {
				await remove(prefixInstalling);
			} catch (err) {}

			return Left(err);
		}
	};

	const attempt = async delayed => {
		if (delayed >= timeout) {
			return Left(new Error('Non-performant install'));
		} else if (isEmpty(installing)) {
			const age = ifElse(
				isEmpty,
				always(Number.MAX_SAFE_INTEGER),
				u => diff(new Date(), u.ctime)
			)(installed);

			return cond([
				[equals(Number.MAX_SAFE_INTEGER), () => install(false, delayed)],
				[age => invalidate(name, version, age), () => install(true, delayed)],
				[T, always(Right({delayed: 0, installed: false, name, uninstalled: false, version}))]
			])(age);
		} else {
			await sleep(delay);
			return attempt(delayed + delay);
		}
	};

	return attempt(0);
};

module.exports = ({delay = 5000, invalidate = T, path, timeout = 60000}) =>
	installer({delay, invalidate, path, timeout});

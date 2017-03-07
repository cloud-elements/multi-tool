'use strict';

const pth = require('path');
const diff = require('date-fns/difference_in_milliseconds');
const execa = require('execa');
const {mkdirp, outputFile, remove} = require('fs-extra');
const {stat} = require('graceful-fs');
const exists = require('package-json');
const pify = require('pify');
const {allPass, always, F, identity, is, isEmpty, T} = require('ramda');
const semver = require('semver');
const validNpm = require('validate-npm-package-name');
const validFilename = require('valid-filename');

const mkdir = pify(mkdirp);
const rmdir = pify(remove);
const shell = execa.shell;
const stats = path => pify(stat)(path).then(identity).catch(always({}));
const write = pify(outputFile);

const validExists = (name, version) => exists(name, version).then(T).catch(F);

const validName = allPass([
	is(String),
	name => {
		const check = validNpm(name);
		return check.validForNewPackages || check.validForOldPackages;
	}
]);

const validVersion = allPass([
	is(String),
	validFilename,
	ver => ver === 'latest' || semver.validRange(ver)
]);

const install = (path, invalidator) => async (name, version) => {
	if (isEmpty(await stats(path))) {
		return '';
	} else if (!validName(name) || !validVersion(version)) {
		return '';
	}

	const pkgName = `${name}@${version}`;
	const pkgPath = pth.join(path, pkgName);
	const pkgPathStats = await stats(pkgPath);
	const pkgJsonPath = pth.join(pkgPath, 'package.json');
	const pkgJsonContents = JSON.stringify({
		name: `${name}-${version}`,
		version: '0.0.0',
		main: 'index.js',
		dependencies: {[name]: version}
	});
	const pkgJsPath = pth.join(pkgPath, 'index.js');
	const pkgJsContents = `module.exports = require('${name}');`;

	const performInstall = async () => {
		try {
			await rmdir(pkgPath);
			await mkdir(pkgPath);
			await write(pkgJsonPath, pkgJsonContents);
			await write(pkgJsPath, pkgJsContents);
			await shell(`cd '${pkgPath}' && npm install`);

			return pkgName;
		} catch (err) /* istanbul ignore next */ {
			try {
				await rmdir(pkgPath);
			} catch (err) { }

			return '';
		}
	};

	const ago = isEmpty(pkgPathStats) ? Number.MAX_SAFE_INTEGER : diff(new Date(), pkgPathStats.ctime);

	if (ago === Number.MAX_SAFE_INTEGER || invalidator(name, version, ago)) {
		if (!(await validExists(name, version))) {
			return '';
		}

		return await performInstall();
	} else {
		return pkgName;
	}
};

module.exports = (path, invalidator = T) => {
	const exp = install(path, invalidator);
	exp.validExists = validExists;
	exp.validName = validName;
	exp.validVersion = validVersion;

	return exp;
};

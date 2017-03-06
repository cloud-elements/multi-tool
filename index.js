'use strict';

const pth = require('path');
const execa = require('execa');
const fs = require('fs-extra');
const exists = require('path-exists');
const pify = require('pify');
const {allPass, is} = require('ramda');
const semver = require('semver');
const validNpm = require('validate-npm-package-name');
const validFilename = require('valid-filename');

const mkdir = pify(fs.mkdirp);
const rmdir = pify(fs.remove);
const shell = execa.shell;
const write = pify(fs.outputFile);

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

const install = path => async (name, version) => {
	if (!validName(name) || !validVersion(version)) {
		return '';
	} else if (!(await exists(path))) {
		return '';
	}

	const dir = pth.join(path, `${name}@${version}`);
	const pkgPath = pth.join(dir, 'package.json');
	const pkgContents = JSON.stringify({
		name: `${name}-${version}`,
		version: '0.0.0',
		main: 'index.js',
		dependencies: {[name]: version}
	});
	const jsPath = pth.join(dir, 'index.js');
	const jsContents = `module.exports = require('${name}');`;

	try {
		await rmdir(dir);
		await mkdir(dir);
		await write(pkgPath, pkgContents);
		await write(jsPath, jsContents);
		await shell(`cd '${dir}' && npm install`);

		return `${name}@${version}`;
	} catch (err) {
		try {
			await rmdir(dir);
		} catch (err) { }

		return '';
	}
};

module.exports = path => {
	const exp = install(path);
	exp.validName = validName;
	exp.validVersion = validVersion;

	return exp;
};

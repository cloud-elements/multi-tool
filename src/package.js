'use strict';

const {resolve} = require('path');
const shell = require('execa');
const {mkdirp, write} = require('./fs');

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
	await write(jsonPath, jsonContents, {mode: 0o644});
	await write(jsPath, jsContents, {mode: 0o644});
	await shell('npm', ['install'], {cwd: path});
};

module.exports = {install};

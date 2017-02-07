'use strict';

const pth = require('path');
const execa = require('execa');
const findup = require('findup-sync');
const fs = require('fs-extra');
const exists = require('path-exists');
const pify = require('pify');
const {allPass, is, test} = require('ramda');
const semver = require('semver');
const validFilename = require('valid-filename');

const mkdir = pify(fs.mkdirp);
const rmdir = pify(fs.remove);
const shell = execa.shell;
const write = pify(fs.outputFile);

const lenUnder = n => str => str.length < n;

const validName = allPass([
  is(String),
  lenUnder(215),
  test(/^(?:@([^/]+?)[/])?([^/]+?)$/)
]);

const validVersion = allPass([
  is(String),
  validFilename,
  ver => semver.validRange(ver)
]);

const install = async (name, version, path) => {
  if (!validName(name) || !validVersion(version)) {
    return '';
  }

  if (!path) {
    path = findup('node_modules', {cwd: module.parent.filename});
  }

  if (!(await exists(path))) {
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

module.exports = install;
module.exports.validName = validName;
module.exports.validVersion = validVersion;

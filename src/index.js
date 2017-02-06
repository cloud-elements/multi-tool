'use strict';

const pth = require('path');
const execa = require('execa');
const fs = require('fs-extra');
const pify = require('pify');
const validFilename = require('valid-filename');

const mkdir = pify(fs.mkdirp);
const rmdir = pify(fs.remove);
const shell = execa.shell;
const write = pify(fs.outputFile);

const install = async (path, name, version) => {
  if (!validFilename(`${name}@${version}`)) {
    return null;
  }

  const dir = pth.join(path, `${name}@${version}`);
  const pkg = pth.join(dir, 'package.json');
  const js = pth.join(dir, 'index.js');
  const pkgContents = JSON.stringify({
    name: `${name}-${version}`,
    version: '0.0.0',
    main: 'index.js',
    dependencies: {[name]: version}
  });
  const jsContents = `module.exports = require('${name}');`;

  try {
    await rmdir(dir);
    await mkdir(dir);
    await write(pkg, pkgContents);
    await write(js, jsContents);
    await shell(`cd '${dir}' && npm install`);

    return `${name}@${version}`;
  } catch (err) {
    try {
      rmdir(dir);
    } catch (err) { }

    return null;
  }
};

module.exports = install;

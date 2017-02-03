'use strict';

const pth = require('path');
const execa = require('execa');
const mkdirp = require('mkdirp');
const pify = require('pify');
const writeFile = require('write-file-atomic');
const writePkg = require('write-pkg');

module.exports = async (path, name, version) => {
  const fullname = `${name}-${version}`;
  const dir = pth.join(path, fullname);
  const pkg = pth.join(dir, 'package.json');
  const idx = pth.join(dir, 'index.js');

  try {
    await pify(mkdirp)(dir);
    await writePkg(pkg, {
      name: fullname,
      version: '0.0.0',
      main: 'index.js',
      dependencies: {[name]: version}
    });
    await pify(writeFile)(idx, `module.exports = require('${name}');`);
    await execa.shell(`cd ${dir} && npm install`);

    return fullname;
  } catch (err) {
    return null;
  }
};

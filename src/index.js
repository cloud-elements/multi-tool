'use strict';

const pth = require('path');
const execa = require('execa');
const mkdirp = require('mkdirp');
const pify = require('pify');
const writeFile = require('write-file-atomic');
const writePkg = require('write-pkg');

module.exports = async (path, name, version) => {
  const concatted = `${name}@${version}`;
  const dir = pth.join(path, concatted);
  const pkg = pth.join(dir, 'package.json');
  const idx = pth.join(dir, 'index.js');
  const pkgContents = {
    name: concatted,
    version: '0.0.0',
    main: 'index.js',
    dependencies: {[name]: version}
  };
  const idxContents = `module.exports = require('${name}');`;

  try {
    await pify(mkdirp)(dir);
    await writePkg(pkg, pkgContents);
    await pify(writeFile)(idx, idxContents);
    await execa.shell(`cd ${dir} && npm install`);

    return concatted;
  } catch (err) {
    return null;
  }
};

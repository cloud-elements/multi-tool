'use strict';

const pth = require('path');
const execa = require('execa');
const mkdirp = require('mkdirp');
const pify = require('pify');
const writeFile = require('write-file-atomic');
const writePkg = require('write-pkg');

const install = async (path, name, version) => {
  const dir = pth.join(path, `${name}@${version}`);
  const pkg = pth.join(dir, 'package.json');
  const idx = pth.join(dir, 'index.js');
  const pkgContents = {
    name: `${name}-${version}`,
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

    return `${name}@${version}`;
  } catch (err) {
    return null;
  }
};

module.exports = install;

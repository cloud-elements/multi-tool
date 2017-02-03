'use strict';

const pth = require('path');
const execa = require('execa');
const mkdirp = require('mkdirp');
const pify = require('pify');
const writeFile = require('write-file-atomic');

const install = async (path, name, version) => {
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
    await pify(mkdirp)(dir);
    await pify(writeFile)(pkg, pkgContents);
    await pify(writeFile)(js, jsContents);
    await execa.shell(`cd ${dir} && npm install`);

    return `${name}@${version}`;
  } catch (err) {
    return null;
  }
};

module.exports = install;

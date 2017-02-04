'use strict';

const pth = require('path');
const execa = require('execa');
const mkdirp = require('mkdirp');
const pify = require('pify');
const validFilename = require('valid-filename');
const writeFile = require('write-file-atomic');

const install = (sync, mkdir, mkfile, shell) => (path, name, version) => {
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

  if (sync) {
    try {
      mkdirp(dir);
      mkfile(pkg, pkgContents);
      mkfile(js, jsContents);
      shell(`cd '${dir}' && npm install`);

      return `${name}@${version}`;
    } catch (err) {
      return null;
    }
  } else {
    return (async () => {
      try {
        await mkdirp(dir);
        await mkfile(pkg, pkgContents);
        await mkfile(js, jsContents);
        await shell(`cd '${dir}' && npm install`);

        return `${name}@${version}`;
      } catch (err) {
        return null;
      }
    })();
  }
};

module.exports = install(false, pify(mkdirp), pify(writeFile), execa.shell);
module.exports.sync = install(true, mkdirp.sync, writeFile.sync, execa.shellSync);

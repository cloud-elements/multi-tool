'use strict';

const pth = require('path');
const execa = require('execa');
const fs = require('fs-extra');
const pify = require('pify');
const validFilename = require('valid-filename');

const install = sync => (mkdir, mkfile, rmdir, shell) => (path, name, version) => {
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
      rmdir(dir);
      mkdir(dir);
      mkfile(pkg, pkgContents);
      mkfile(js, jsContents);
      shell(`cd '${dir}' && npm install`);

      return `${name}@${version}`;
    } catch (err) {
      try {
        rmdir(dir);
      } catch (err) { }

      return null;
    }
  } else {
    return (async () => {
      try {
        await rmdir(dir);
        await mkdir(dir);
        await mkfile(pkg, pkgContents);
        await mkfile(js, jsContents);
        await shell(`cd '${dir}' && npm install`);

        return `${name}@${version}`;
      } catch (err) {
        try {
          rmdir(dir);
        } catch (err) { }

        return null;
      }
    })();
  }
};

module.exports = install(false)(pify(fs.mkdirp), pify(fs.outputFile), pify(fs.remove), execa.shell);
module.exports.sync = install(true)(fs.mkdirpSync, fs.outputFileSync, fs.removeSync, execa.shellSync);

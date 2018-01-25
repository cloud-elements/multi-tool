'use strict';

const {promisify} = require('util');
const fse = require('fs-extra');
const fs = require('graceful-fs');
const {always, tryCatch} = require('ramda');

const mkdirp = promisify(fse.mkdirs);
const remove = async path => {
	try {
		await promisify(fse.remove)(path);
	} catch (err) {}
};
const rename = fs.renameSync;
const write = promisify(fs.writeFile);
const stat = tryCatch(fs.statSync, always({}));
const touch = path => fs.closeSync(fs.openSync(path, 'w', 0o644));
const lock = path => touch(path);
const swap = (from, to) => rename(from, to);
const clean = path => remove(path);
const unlock = clean;

module.exports = {clean, lock, mkdirp, remove, rename, stat, swap, touch, unlock, write};

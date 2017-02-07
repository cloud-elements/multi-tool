# multi-tool <sub><sup>| Install multiple versions of NPM packages via semver ranges<sup></sub>
[![version](http://img.shields.io/badge/version-0.1.0-blue.svg)](https://www.npmjs.com/package/@cloudelements/multi-tool)
[![versioning](http://img.shields.io/badge/versioning-semver-blue.svg)](http://semver.org/)
[![branching](http://img.shields.io/badge/branching-github%20flow-blue.svg)](https://guides.github.com/introduction/flow/)
[![styling](http://img.shields.io/badge/code%20styling-XO-blue.svg)](https://github.com/sindresorhus/xo)
[![build](https://circleci.com/gh/cloud-elements/multi-tool.svg?style=shield)](https://circleci.com/gh/cloud-elements/multi-tool)

## Install
```javascript
$ npm install --save multi-tool
```

## Usage
```javascript
const install = require('multi-tool');

const install0230 = await install('ramda', '0.23.0'); // 'ramda@0.23.0'
const ramda0230 = require('ramda@0.23.0');
ramda0230.identity(0);

const install023x = await install('ramda', '0.23.x'); // 'ramda@0.23.x'
const ramda023x = require('ramda@0.23.x');
ramda023x.identity(0);

const installLatest = await install('ramda', 'latest'); // 'ramda@latest'
const ramdaLatest = require('ramda@latest');
ramdaLatest.identity(0);

const installInvalidPackage = await install('does-not-exist', 'latest'); // ''

const installInvalidVersion = await install('ramda', '99.99.99'); // ''
```
> __PROTIP:__ Any valid semver range that is also a valid (Li|U)nix directory name is supported.

## Maintainers
* Rocky Madden ([@rockymadden](https://github.com/rockymadden))

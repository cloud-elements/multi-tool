# multi-tool <sub><sup>| Install multiple versions of NPM packages via semver ranges<sup></sub>
[![version](http://img.shields.io/badge/version-0.0.0-blue.svg)](https://www.npmjs.com/package/@cloudelements/multi-tool)
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

await install('ramda', '0.23.0');
await install('ramda', '0.23.x');
await install('ramda', 'latest');

const ramda_0230 = require('ramda@0.23.0');
const ramda_023x = require('ramda@0.23.x');
const ramda_latest = require('ramda@latest');
```
> __PROTIP:__ Any valid semver range that is also a valid \*nix directory name is supported.

## Maintainers
* Rocky Madden ([@rockymadden](https://github.com/rockymadden))

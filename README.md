# multi-tool <sub><sup>| Install and require multiple versions of NPM packages<sup></sub>
[![version](http://img.shields.io/badge/version-0.3.2-blue.svg)](https://www.npmjs.com/package/@cloudelements/multi-tool)
[![versioning](http://img.shields.io/badge/versioning-semver-blue.svg)](http://semver.org/)
[![branching](http://img.shields.io/badge/branching-github%20flow-blue.svg)](https://guides.github.com/introduction/flow/)
[![styling](http://img.shields.io/badge/styling-xo-blue.svg)](https://github.com/sindresorhus/xo)
[![paradigm](http://img.shields.io/badge/paradigm-functional-blue.svg)](https://en.wikipedia.org/wiki/Functional_programming)
[![build](https://circleci.com/gh/cloud-elements/multi-tool.svg?style=shield)](https://circleci.com/gh/cloud-elements/multi-tool)

Install multiple versions of NPM packages at runtime. Use any semver ranges which are also a valid (Li|U)nix directory
names as your versions and `require` them intuitively (e.g. `require('ramda@0.23.x')`, `require('ramda@~0.22.1')`,
`require('ramda@latest')`). Leverage custom invalidators to automatically keep installed packages up-to-date.

## Install
```bash
$ npm install --save multi-tool
```

## Usage
A path to the `node_modules` directory you wish to install against is required. You will be given a partially applied
set of functions upon `require` that will then act against said path.
```javascript
const install = require('multi-tool')(path);
```

### Install and use latest version:
```javascript
const installed = await install('ramda', 'latest'); // 'ramda@latest'
const R = require('ramda@latest');

R.identity(0);
```

### Install and use exact version:
```javascript
const installed = await install('ramda', '0.23.0'); // 'ramda@0.23.0'
const R = require('ramda@0.23.0');

R.identity(0);
```

### Install and use x-based version:
```javascript
const installed = await install('ramda', '0.23.x'); // 'ramda@0.23.x'
const R = require('ramda@0.23.x');

R.identity(0);
```

### Install and use tilde-based version:
```javascript
const installed = await install('ramda', '~0.22.1'); // 'ramda@~0.22.1'
const R = require('ramda@~0.22.1');

R.identity(0);
```

### Install invalid package:
```javascript
const installed = await install('package-doesnt-exist', 'latest'); // ''
```

### Install invalid version:
```javascript
const installed = await install('ramda', '99.99.99'); // ''
```

### Custom invalidators:
It is possible to use custom invalidators to customize when `multi-tool` should assume an already successfully
installed package should be reinstalled. This is accomplished via a higher-order function passed as an argument upon
`require`. The invalidator function is executed upon each `install`. The invalidator function is provided the package
`name`, the package `version`, and how many milliseconds `ago` the package at hand was last successfully installed.
The invalidator function should return a `Boolean` value which when true will invalidate the previously successfully
installed package and reinstall. The default invalidator behavior is to always invalidate.

#### Invalidate always:
```javascript
const invalidator = (name, version, ago) => ago >= 0;
const install = require('multi-tool')(path, invalidator);
```

#### Invalidate never:
```javascript
const invalidator = (name, version, ago) => ago >= Number.MAX_SAFE_INTEGER;
const install = require('multi-tool')(path, invalidator);
```

#### Invalidate only latest versions and only after 10 minutes:
```javascript
const invalidator = (name, version, ago) => version === 'latest' && ago >= 600000;
const install = require('multi-tool')(path, invalidator);
```

## Maintainers
* Rocky Madden ([@rockymadden](https://github.com/rockymadden))

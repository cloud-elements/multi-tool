# multi-tool <sub><sup>| Install multiple versions of NPM packages via semver ranges<sup></sub>
[![version](http://img.shields.io/badge/version-0.2.1-blue.svg)](https://www.npmjs.com/package/@cloudelements/multi-tool)
[![versioning](http://img.shields.io/badge/versioning-semver-blue.svg)](http://semver.org/)
[![branching](http://img.shields.io/badge/branching-github%20flow-blue.svg)](https://guides.github.com/introduction/flow/)
[![styling](http://img.shields.io/badge/styling-xo-blue.svg)](https://github.com/sindresorhus/xo)
[![paradigm](http://img.shields.io/badge/paradigm-functional-blue.svg)](https://en.wikipedia.org/wiki/Functional_programming)
[![build](https://circleci.com/gh/cloud-elements/multi-tool.svg?style=shield)](https://circleci.com/gh/cloud-elements/multi-tool)

Install multiple versions of NPM packages via semver ranges, at runtime, that are also a valid (Li|U)nix directory
names.

## Install
```javascript
$ npm install --save multi-tool
```

## Usage
### Requiring:
A path to the `node_modules` directory you wish to install against is required. You will be given a partially applied
set of functions upon `require` that will then act against said path.
```javascript
const install = require('multi-tool')(pathToNodeModules);
```

### Custom invalidators:
It is possible to use custom invalidators to customize when `multi-tool` should assume an already successfully
installed package should be updated. This is accomplished via a higher-order function passed as an argument upon
`require`. The function is provided the package `name`, the package `version`, and how many milliseconds `ago` it was
last successfully installed and is executed on your behalf upon each `install`. The function should return a `Boolean`
value, which when true will invalidate the previously installed package and reinstall.

#### Always invalidate:
```javascript
const alwaysInvalidator = (name, version, ago) => ago >= 0;
const install = require('multi-tool')(pathToNodeModules, alwaysInvalidator);
```

#### Never invalidate:
```javascript
const neverInvalidator = (name, version, ago) => ago >= Number.MAX_SAFE_INTEGER;
const install = require('multi-tool')(pathToNodeModules, neverInvalidator);
```

### Install and use exact version:
```javascript
const installed = await install('ramda', '0.23.0'); // 'ramda@0.23.0'
const R = require('ramda@0.23.0');
R.identity(0); // 0
```

### Install and use x-based version:
```javascript
const installed = await install('ramda', '0.23.x'); // 'ramda@0.23.x'
const R = require('ramda@0.23.x');
R.identity(0); // 0
```

### Install and use tilde-based version:
```javascript
const installed = await install('ramda', '~0.22.1'); // 'ramda@~0.22.1'
const R = require('ramda@~0.22.1');
R.identity(0); // 0
```

### Install and use latest version:
```javascript
const installed = await install('ramda', 'latest'); // 'ramda@latest'
const R = require('ramda@latest');
R.identity(0); // 0
```

### Install invalid package:
```javascript
const installed = await install('does-not-exist', 'latest'); // ''
```

### Install invalid version:
```javascript
const installed = await install('ramda', '99.99.99'); // ''
```

## Maintainers
* Rocky Madden ([@rockymadden](https://github.com/rockymadden))

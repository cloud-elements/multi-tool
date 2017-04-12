# multi-tool <sub><sup>| Install and require multiple simultaneous versions of any NPM package<sup></sub>
[![version](http://img.shields.io/badge/version-0.5.0-blue.svg)](https://www.npmjs.com/package/multi-tool)
[![versioning](http://img.shields.io/badge/versioning-semver-blue.svg)](http://semver.org/)
[![branching](http://img.shields.io/badge/branching-github%20flow-blue.svg)](https://guides.github.com/introduction/flow/)
[![styling](http://img.shields.io/badge/styling-xo-blue.svg)](https://github.com/sindresorhus/xo)
[![paradigm](http://img.shields.io/badge/paradigm-functional-blue.svg)](https://en.wikipedia.org/wiki/Functional_programming)
[![build](https://circleci.com/gh/cloud-elements/multi-tool.svg?style=shield)](https://circleci.com/gh/cloud-elements/multi-tool)

Install multiple versions of NPM packages at runtime. Use any semver ranges which are also a valid (Li|U)nix directory
names as your version and `require` them intuitively (e.g. `require('ramda@0.23.x')`, `require('ramda@~0.22.1')`,
`require('ramda@latest')`). Leverage custom invalidators to automatically keep installed packages up-to-date.

## Install
```bash
$ npm install --save multi-tool
$ # OR
$ yarn add multi-tool
```

## Usage
### Require:
An options object is required to configure before using, only `path` is required.
```javascript
const options = {
  // Path to install against
  path: 'node_modules',
  // Function used to determine if package should be invalidated and reinstalled when already installed
  invalidate: (name, version, age) => age >= Number.MAX_SAFE_INTEGER,
  // Milliseconds to delay when an install is already occurring before reattempting
  delay: 2500,
  // Milliseconds maximum to delay before an install is considered failed if an install is already occurring
  timeout: 60000
};
const install = require('multi-tool')(options);
```

### Install and use latest version:
```javascript
const installed = await install('ramda', 'latest');
const R = require('ramda@latest');

R.identity(0);
```

### Install and use exact version:
```javascript
const installed = await install('ramda', '0.23.0');
const R = require('ramda@0.23.0');

R.identity(0);
```

### Install and use x-based version:
```javascript
const installed = await install('ramda', '0.23.x');
const R = require('ramda@0.23.x');

R.identity(0);
```

### Install and use tilde-based version:
```javascript
const installed = await install('ramda', '~0.22.1');
const R = require('ramda@~0.22.1');

R.identity(0);
```

### Install and use caret-based version:
```javascript
const installed = await install('ramda', '^0.22.1');
const R = require('ramda@^0.22.1');

R.identity(0);
```

### Install invalid package:
```javascript
const installed = await install('package-doesnt-exist', 'latest');
```

### Install invalid version:
```javascript
const installed = await install('ramda', '99.99.99');
```

### Custom invalidators:
It is possible to use custom invalidators to customize when `multi-tool` should assume an already successfully
installed package should be reinstalled. This is accomplished via a higher-order function passed as an argument upon
`require`. The invalidator function is executed upon each `install`. The invalidator function is provided the package
`name`, the package `version`, and how many milliseconds ago the package at hand was last successfully installed.
The invalidator function should return a `Boolean` value which when true will invalidate the previously successfully
installed package and reinstall. The default invalidator behavior is to always invalidate.

#### Invalidate always:
```javascript
const invalidate = (name, version, age) => age >= 0;
const install = require('multi-tool')({path: 'node_modules', invalidate});
```

#### Invalidate never:
```javascript
const invalidate = (name, version, age) => age >= Number.MAX_SAFE_INTEGER;
const install = require('multi-tool')({path: 'node_modules', invalidate});
```

#### Invalidate only latest versions and only after 10 minutes:
```javascript
const invalidate = (name, version, age) => version === 'latest' && age >= 600000;
const install = require('multi-tool')({path: 'node_modules', invalidate});
```

## Maintainers
* Rocky Madden ([@rockymadden](https://github.com/rockymadden))

'use strict';

const test = require('ava');
const multitool = require('../src');

test('installing a valid package with an exact version should return new package name', async t => {
  const install = await multitool('node_modules', 'ramda', '0.23.0');

  t.is(install, 'ramda-0.23.0');
});

test('installing a valid package with an exact version should work', async t => {
  await multitool('node_modules', 'ramda', '0.23.0');
  const {identity} = require('ramda-0.23.0');

  t.is(identity('hello'), 'hello');
});

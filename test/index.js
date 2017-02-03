'use strict';

const test = require('ava');
const multitool = require('../src');

test('installing a valid package with an exact version should return new package name', async t => {
  const install0 = await multitool('node_modules', 'ramda', '0.23.0');
  const install1 = await multitool('node_modules', 'ramda-fantasy', '0.7.0');

  t.is(install0, 'ramda@0.23.0');
  t.is(install1, 'ramda-fantasy@0.7.0');
});

test('installing a valid package with an exact version should work', async t => {
  await multitool('node_modules', 'ramda', '0.23.0');
  await multitool('node_modules', 'ramda-fantasy', '0.7.0');
  const {identity} = require('ramda@0.23.0');
  const {Maybe} = require('ramda-fantasy@0.7.0');

  t.is(identity('hello'), 'hello');
  t.true(Maybe.isNothing(Maybe.Nothing()));
});

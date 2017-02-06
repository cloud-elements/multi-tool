'use strict';

const test = require('ava');
const multitool = require('../src');

test.serial('installing a valid package with an exact version should work', async t => {
  const installed0 = await multitool('ramda', '0.23.0');
  const installed1 = await multitool('ramda-fantasy', '0.7.0');
  const {identity} = require('ramda@0.23.0');
  const {Maybe} = require('ramda-fantasy@0.7.0');

  t.is(installed0, 'ramda@0.23.0');
  t.is(installed1, 'ramda-fantasy@0.7.0');
  t.is(identity('hello'), 'hello');
  t.true(Maybe.isNothing(Maybe.Nothing()));
});

test.serial('installing a valid package with an x-based query should work', async t => {
  const installed0 = await multitool('ramda', '0.23.x');
  const installed1 = await multitool('ramda-fantasy', '0.x');
  const {identity} = require('ramda@0.23.x');
  const {Maybe} = require('ramda-fantasy@0.x');

  t.is(installed0, 'ramda@0.23.x');
  t.is(installed1, 'ramda-fantasy@0.x');
  t.is(identity('hello'), 'hello');
  t.true(Maybe.isNothing(Maybe.Nothing()));
});

test.serial('installing with an explicit path should work', async t => {
  const installed = await multitool('ramda', '0.23.x', 'node_modules');
  const {identity} = require('ramda@0.23.x');

  t.is(installed, 'ramda@0.23.x');
  t.is(identity('hello'), 'hello');
});

test.serial('installing an non-existent package should return null', async t => {
  const installed = await multitool('doesnt-exist', '0.0.0');

  t.is(installed, null);
});

test.serial('installing an non-existent package version should return null', async t => {
  const installed = await multitool('ramda', '99.99.99');

  t.is(installed, null);
});

test.serial('installing an invalidly named package should return null', async t => {
  const installed = await multitool('ramda', '>=99.99.99');

  t.is(installed, null);
});

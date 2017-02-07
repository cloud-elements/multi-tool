'use strict';

const test = require('ava');
const install = require('../src');

test.serial('installing a valid package with an exact version should work', async t => {
  const installed0 = await install('ramda', '0.23.0');
  const installed1 = await install('ramda-fantasy', '0.7.0');
  const {identity} = require('ramda@0.23.0');
  const {Maybe} = require('ramda-fantasy@0.7.0');

  t.is(installed0, 'ramda@0.23.0');
  t.is(installed1, 'ramda-fantasy@0.7.0');
  t.is(identity('hello'), 'hello');
  t.true(Maybe.isNothing(Maybe.Nothing()));
});

test.serial('installing a valid package with an x-based query should work', async t => {
  const installed0 = await install('ramda', '0.23.x');
  const installed1 = await install('ramda-fantasy', '0.x');
  const {identity} = require('ramda@0.23.x');
  const {Maybe} = require('ramda-fantasy@0.x');

  t.is(installed0, 'ramda@0.23.x');
  t.is(installed1, 'ramda-fantasy@0.x');
  t.is(identity('hello'), 'hello');
  t.true(Maybe.isNothing(Maybe.Nothing()));
});

test.serial('installing with an explicit path should work', async t => {
  const installed = await install('ramda', '0.23.x', 'node_modules');
  const {identity} = require('ramda@0.23.x');

  t.is(installed, 'ramda@0.23.x');
  t.is(identity('hello'), 'hello');
});

test.serial('installing with an invalid explicit path should return an empty String', async t => {
  const installed = await install('ramda', '0.23.x', 'foo');

  t.is(installed, '');
});

test.serial('installing an non-existent package should return an empty String', async t => {
  const installed = await install('doesnt-exist', '0.0.0');

  t.is(installed, '');
});

test.serial('installing an non-existent package version should return an empty String', async t => {
  const installed = await install('ramda', '99.99.99');

  t.is(installed, '');
});

test.serial('installing an invalidly named package should return an empty String', async t => {
  const installed = await install('ramda', '>=99.99.99');

  t.is(installed, '');
});

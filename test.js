'use strict';

const test = require('ava');
const install = require('.')('node_modules');
const installInvalid = require('.')('invalid');

test.serial('installing with an invalid path should return an empty String', async t => {
	const installed = await installInvalid('ramda', '0.23.x');

	t.is(installed, '');
});

test.serial('installing a valid package with latest version should work', async t => {
	const installed = await install('ramda', 'latest');
	const {identity} = require('ramda@latest');

	t.is(installed, 'ramda@latest');
	t.is(identity('hello'), 'hello');
});

test.serial('installing a valid package with an exact version should work', async t => {
	const installed = await install('ramda', '0.23.0');
	const {identity} = require('ramda@0.23.0');

	t.is(installed, 'ramda@0.23.0');
	t.is(identity('hello'), 'hello');
});

test.serial('installing a valid package with an x-based range should work', async t => {
	const installed = await install('ramda', '0.23.x');
	const {identity} = require('ramda@0.23.x');

	t.is(installed, 'ramda@0.23.x');
	t.is(identity('hello'), 'hello');
});

test.serial('installing a valid package with an tilde-based range should work', async t => {
	const installed = await install('ramda', '~0.23.0');
	const {identity} = require('ramda@~0.23.0');

	t.is(installed, 'ramda@~0.23.0');
	t.is(identity('hello'), 'hello');
});

test.serial('installing a valid scoped package should work', async t => {
	const installed = await install('@rockymadden/now-go', 'latest');
	const req = require('@rockymadden/now-go@latest');

	t.is(installed, '@rockymadden/now-go@latest');
	t.truthy(req);
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

test('validName should return true with valid argument', async t => {
	t.true(install.validName('ramda'));
	t.true(install.validName('ramda-fantasy'));
	t.true(install.validName('@rockymadden/now-go'));
});

test('validName should return false with invalid argument', async t => {
	t.false(install.validName('.ramda'));
	t.false(install.validName('_ramda'));
	t.false(install.validName('ramda#fantasy'));
});

test('validVersion should return true with valid argument', async t => {
	t.true(install.validVersion('latest'));
	t.true(install.validVersion('0.23.0'));
	t.true(install.validVersion('0.23.x'));
});

test('validVersion should return false with invalid argument', async t => {
	t.false(install.validVersion('>=0.23.0'));
});

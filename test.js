'use strict';

const test = require('ava');
const {shell} = require('execa');
const multitool = require('.');

const install = multitool('node_modules');
const installAlwaysInvaliator = multitool('node_modules', (name, version, ago) => ago >= 0);
const installNeverInvaliator = multitool('node_modules', (name, version, ago) => ago >= Number.MAX_SAFE_INTEGER);
const installInvalidPath = multitool('invalid_modules');

test.before(async () => await shell('npm prune'));

test.serial('installing with an invalid path should return an empty String', async t => {
	const installed = await installInvalidPath('ramda', '0.23.0');

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

test.serial('installing a package with an invalidator which always invalidates should work', async t => {
	const installed = await installAlwaysInvaliator('ramda', '0.23.0');
	const {identity} = require('ramda@0.23.0');

	t.is(installed, 'ramda@0.23.0');
	t.is(identity('hello'), 'hello');
});

test.serial('installing a package with an invalidator which never invalidates should work', async t => {
	const installed = await installNeverInvaliator('ramda', '0.23.0');
	const {identity} = require('ramda@0.23.0');

	t.is(installed, 'ramda@0.23.0');
	t.is(identity('hello'), 'hello');
});

test.serial('installing an non-existent package with an invalidator which always invalidates should return an empty String', async t => {
	const installed = await installAlwaysInvaliator('package-doesnt-exist', '0.0.0');

	t.is(installed, '');
});

test.serial('installing an non-existent package version with an invalidator which always invalidates should return an empty String', async t => {
	const installed = await installAlwaysInvaliator('ramda', '99.99.99');

	t.is(installed, '');
});

test.serial('installing an invalidly named package with an invalidator which always invalidates should return an empty String', async t => {
	const installed = await installAlwaysInvaliator('ramda', '>=99.99.99');

	t.is(installed, '');
});

test.serial('installing an non-existent package with an invalidator which never invalidates should return an empty String', async t => {
	const installed = await installNeverInvaliator('package-doesnt-exist', '0.0.0');

	t.is(installed, '');
});

test.serial('installing an non-existent package version with an invalidator which never invalidates should return an empty String', async t => {
	const installed = await installNeverInvaliator('ramda', '99.99.99');

	t.is(installed, '');
});

test.serial('installing an invalidly named package with an invalidator which never invalidates should return an empty String', async t => {
	const installed = await installNeverInvaliator('ramda', '>=99.99.99');

	t.is(installed, '');
});

test('validExists should return true with valid arguments', async t => {
	t.true(await install.validExists('ramda', 'latest'));
	t.true(await install.validExists('ramda', '0.23.0'));
	t.true(await install.validExists('ramda', '0.23.x'));
	t.true(await install.validExists('ramda', '~0.23.0'));
});

test('validExists should return false with invalid arguments', async t => {
	t.false(await install.validExists('ramda', '99.99.99'));
	t.false(await install.validExists('package-doesnt-exist', '0.0.0'));
});

test('validName should return true with valid argument', t => {
	t.true(install.validName('ramda'));
	t.true(install.validName('ramda-fantasy'));
	t.true(install.validName('@rockymadden/now-go'));
});

test('validName should return false with invalid argument', t => {
	t.false(install.validName('.ramda'));
	t.false(install.validName('_ramda'));
	t.false(install.validName('ramda#fantasy'));
});

test('validVersion should return true with valid argument', t => {
	t.true(install.validVersion('latest'));
	t.true(install.validVersion('0.23.0'));
	t.true(install.validVersion('0.23.x'));
});

test('validVersion should return false with invalid argument', t => {
	t.false(install.validVersion('>=0.23.0'));
});

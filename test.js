'use strict';

const test = require('ava');
const {shell} = require('execa');
const {identity, is} = require('ramda');
const {create, env} = require('sanctuary');
const multi = require('.');

const {either, fromEither} = create({checkTypes: false, env});
const always = (name, version, ago) => ago >= 0;
const never = (name, version, ago) => ago >= Number.MAX_SAFE_INTEGER;

const installDefault = multi({path: 'node_modules'});
const installAlways = multi({path: 'node_modules', invalidate: always});
const installNever = multi({path: 'node_modules', invalidate: never});

test.before(() => shell('npm prune'));

test('installing a valid package with latest version should return Right', async t => {
	const install = fromEither({}, await installDefault('ramda', 'latest'));
	const {identity} = require('ramda@latest');

	t.is(install.installed, true);
	t.is(install.name, 'ramda');
	t.is(install.version, 'latest');
	t.is(identity('hello'), 'hello');
});

test('installing a valid package with an exact version should return Right', async t => {
	const install = fromEither({}, await installDefault('ramda', '0.23.0'));
	const {identity} = require('ramda@0.23.0');

	t.is(install.installed, true);
	t.is(install.name, 'ramda');
	t.is(install.version, '0.23.0');
	t.is(identity('hello'), 'hello');
});

test('installing a valid package with an x-based range should return Right', async t => {
	const install = fromEither({}, await installDefault('ramda', '0.23.x'));
	const {identity} = require('ramda@0.23.x');

	t.is(install.installed, true);
	t.is(install.name, 'ramda');
	t.is(install.version, '0.23.x');
	t.is(identity('hello'), 'hello');
});

test('installing a valid package with an tilde-based range should return Right', async t => {
	const install = fromEither({}, await installDefault('ramda', '~0.23.0'));
	const {identity} = require('ramda@~0.23.0');

	t.is(install.installed, true);
	t.is(install.name, 'ramda');
	t.is(install.version, '~0.23.0');
	t.is(identity('hello'), 'hello');
});

test('installing a valid package with an caret-based range should return Right', async t => {
	const install = fromEither({}, await installDefault('ramda', '^0.23.0'));
	const {identity} = require('ramda@^0.23.0');

	t.is(install.installed, true);
	t.is(install.name, 'ramda');
	t.is(install.version, '^0.23.0');
	t.is(identity('hello'), 'hello');
});

test('installing a valid scoped package should return Right', async t => {
	const install = fromEither({}, await installDefault('@rockymadden/now-go', 'latest'));
	const req = require('@rockymadden/now-go@latest');

	t.is(install.installed, true);
	t.is(install.name, '@rockymadden/now-go');
	t.is(install.version, 'latest');
	t.truthy(req);
});

test('installing a package with an invalidator which always invalidates should return Right', async t => {
	await installAlways('ramda', '0.23.0');
	const install = fromEither({}, await installAlways('ramda', '0.23.0'));
	const {identity} = require('ramda@0.23.0');

	t.is(install.uninstalled, true);
	t.is(install.installed, true);
	t.is(install.name, 'ramda');
	t.is(install.version, '0.23.0');
	t.is(identity('hello'), 'hello');
});

test('installing a package with an invalidator which never invalidates should return Right', async t => {
	await installNever('ramda', '0.22.0');
	const install = fromEither({}, await installNever('ramda', '0.22.0'));
	const {identity} = require('ramda@0.22.0');

	t.is(install.uninstalled, false);
	t.is(install.installed, false);
	t.is(install.name, 'ramda');
	t.is(install.version, '0.22.0');
	t.is(identity('hello'), 'hello');
});

test('installing an non-existent package with an invalidator which always invalidates should return Left', async t => {
	const install = either(identity, identity)(await installAlways('package-doesnt-exist', '0.0.0'));
	t.true(is(Error, install));
});

test('installing an non-existent package version with an invalidator which always invalidates should return Left', async t => {
	const install = either(identity, identity)(await installAlways('ramda', '99.99.99'));
	t.true(is(Error, install));
});

test('installing an non-existent package with an invalidator which never invalidates should return Left', async t => {
	const install = either(identity, identity)(await installNever('package-doesnt-exist', '0.0.0'));
	t.true(is(Error, install));
});

test('installing an non-existent package version with an invalidator which never invalidates should return Left', async t => {
	const install = either(identity, identity)(await installNever('ramda', '99.99.99'));
	t.true(is(Error, install));
});

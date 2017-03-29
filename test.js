'use strict';

const test = require('ava');
const {shell} = require('execa');
const {identity, is} = require('ramda');
const {create, env} = require('sanctuary');
const multi = require('.');

const {either, fromEither} = create({checkTypes: false, env});
const always = (name, version, ago) => ago >= 0;
const never = (name, version, ago) => ago >= Number.MAX_SAFE_INTEGER;

const install = multi({path: 'node_modules'});
const installAlways = multi({path: 'node_modules', invalidate: always});
const installNever = multi({path: 'node_modules', invalidate: never});

test.before(() => shell('npm prune'));

test('installing a valid package with latest version should return Right', async t => {
	const installation = fromEither({}, await install('ramda', 'latest'));
	const {identity} = require('ramda@latest');

	t.is(installation.installed, true);
	t.is(installation.name, 'ramda');
	t.is(installation.version, 'latest');
	t.is(identity('hello'), 'hello');
});

test('installing a valid package with an exact version should return Right', async t => {
	const installation = fromEither({}, await install('ramda', '0.23.0'));
	const {identity} = require('ramda@0.23.0');

	t.is(installation.installed, true);
	t.is(installation.name, 'ramda');
	t.is(installation.version, '0.23.0');
	t.is(identity('hello'), 'hello');
});

test('installing a valid package with an x-based range should return Right', async t => {
	const installation = fromEither({}, await install('ramda', '0.23.x'));
	const {identity} = require('ramda@0.23.x');

	t.is(installation.installed, true);
	t.is(installation.name, 'ramda');
	t.is(installation.version, '0.23.x');
	t.is(identity('hello'), 'hello');
});

test('installing a valid package with an tilde-based range should return Right', async t => {
	const installation = fromEither({}, await install('ramda', '~0.23.0'));
	const {identity} = require('ramda@~0.23.0');

	t.is(installation.installed, true);
	t.is(installation.name, 'ramda');
	t.is(installation.version, '~0.23.0');
	t.is(identity('hello'), 'hello');
});

test('installing a valid package with an caret-based range should return Right', async t => {
	const installation = fromEither({}, await install('ramda', '^0.23.0'));
	const {identity} = require('ramda@^0.23.0');

	t.is(installation.installed, true);
	t.is(installation.name, 'ramda');
	t.is(installation.version, '^0.23.0');
	t.is(identity('hello'), 'hello');
});

test('installing a valid scoped package should return Right', async t => {
	const installation = fromEither({}, await install('@rockymadden/now-go', 'latest'));
	const req = require('@rockymadden/now-go@latest');

	t.is(installation.installed, true);
	t.is(installation.name, '@rockymadden/now-go');
	t.is(installation.version, 'latest');
	t.truthy(req);
});

test('installing a package with an invalidator which always invalidates should return Right', async t => {
	await installAlways('ramda', '0.23.0');
	const installation = fromEither({}, await installAlways('ramda', '0.23.0'));
	const {identity} = require('ramda@0.23.0');

	t.is(installation.uninstalled, true);
	t.is(installation.installed, true);
	t.is(installation.name, 'ramda');
	t.is(installation.version, '0.23.0');
	t.is(identity('hello'), 'hello');
});

test('installing a package with an invalidator which never invalidates should return Right', async t => {
	await installNever('ramda', '0.22.0');
	const installation = fromEither({}, await installNever('ramda', '0.22.0'));
	const {identity} = require('ramda@0.22.0');

	t.is(installation.uninstalled, false);
	t.is(installation.installed, false);
	t.is(installation.name, 'ramda');
	t.is(installation.version, '0.22.0');
	t.is(identity('hello'), 'hello');
});

test('installing an non-existent package with an invalidator which always invalidates should return Left', async t => {
	const installation = either(identity, identity)(await installAlways('package-doesnt-exist', '0.0.0'));
	t.true(is(Error, installation));
});

test('installing an non-existent package version with an invalidator which always invalidates should return Left', async t => {
	const installation = either(identity, identity)(await installAlways('ramda', '99.99.99'));
	t.true(is(Error, installation));
});

test('installing an non-existent package with an invalidator which never invalidates should return Left', async t => {
	const installation = either(identity, identity)(await installNever('package-doesnt-exist', '0.0.0'));
	t.true(is(Error, installation));
});

test('installing an non-existent package version with an invalidator which never invalidates should return Left', async t => {
	const installation = either(identity, identity)(await installNever('ramda', '99.99.99'));
	t.true(is(Error, installation));
});

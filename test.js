'use strict';

const test = require('ava');
const {shell} = require('execa');
const {filter, identity, map} = require('ramda');
const {create, env} = require('sanctuary');
const multi = require('.');

const {either, fromEither, isLeft} = create({checkTypes: false, env});
const always = (name, version, ago) => ago >= 0;
const never = (name, version, ago) => ago >= Number.MAX_SAFE_INTEGER;

const installDefault = multi({path: 'node_modules'});
const installAlways = multi({delay: 2500, path: 'node_modules', invalidate: always, timeout: 10000});
const installNever = multi({delay: 2500, path: 'node_modules', invalidate: never, timeout: 10000});

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

test('installing a package with an always invalidator should return Right', async t => {
	await installAlways('ramda', '0.23.0');
	const install = fromEither({}, await installAlways('ramda', '0.23.0'));
	const {identity} = require('ramda@0.23.0');

	t.is(install.uninstalled, true);
	t.is(install.installed, true);
	t.is(install.name, 'ramda');
	t.is(install.version, '0.23.0');
	t.is(identity('hello'), 'hello');
});

test('installing a package with a never invalidator should return Right', async t => {
	await installNever('ramda', '0.22.0');
	const install = fromEither({}, await installNever('ramda', '0.22.0'));
	const {identity} = require('ramda@0.22.0');

	t.is(install.uninstalled, false);
	t.is(install.installed, false);
	t.is(install.name, 'ramda');
	t.is(install.version, '0.22.0');
	t.is(identity('hello'), 'hello');
});

test('installing an non-existent package with an always invalidator should return Left', async t => {
	const install = await installAlways('package-doesnt-exist', '0.0.0');
	t.true(isLeft(install));
});

test('installing an non-existent package version with an always invalidator should return Left', async t => {
	const install = await installAlways('ramda', '99.99.99');
	t.true(isLeft(install));
});

test('installing an non-existent package with a never invalidator should return Left', async t => {
	const install = await installNever('package-doesnt-exist', '0.0.0');
	t.true(isLeft(install));
});

test('installing an non-existent package version with a never invalidator should return Left', async t => {
	const install = await installNever('ramda', '99.99.99');
	t.true(isLeft(install));
});

test('installing a valid package numerous times concurrently less than timeout should return Right', async t => {
	const toInstall = [
		installAlways('ramda', '0.21.0'),
		installAlways('ramda', '0.21.0')
	];
	const installs = map(either(identity, identity), await Promise.all(toInstall));
	const delayed0 = filter(i => i.delayed === 0, installs)[0];
	const delayedGreaterThan0 = filter(i => i.delayed > 0, installs)[0];

	t.true(delayed0.installed);
	t.true(delayedGreaterThan0.installed);
});

test('installing a valid package numerous times concurrently greater than timeout should return Right', async t => {
	const toInstall = [
		installAlways('ramda', '0.20.0'),
		installAlways('ramda', '0.20.0'),
		installAlways('ramda', '0.20.0'),
		installAlways('ramda', '0.20.0'),
		installAlways('ramda', '0.20.0')
	];
	const installs = map(either(identity, identity), await Promise.all(toInstall));
	const delayedMaximum = filter(i => i === 'Non-performant install', installs)[0];

	t.truthy(delayedMaximum);
});

'use strict';

const test = require('ava');
const {shellSync: shell} = require('execa');
const {filter, identity, is, map} = require('ramda');
const {create, env} = require('sanctuary');
const {install} = require('../../src/modules');

const {either, fromEither} = create({checkTypes: false, env});
const extract = either(identity, identity);

const path = 'node_modules';
const prune = 'rm -rf ./node_modules/@rockymadden && find ./node_modules -maxdepth 1 -name "?*@*" -exec rm -r "{}" \\;';

test.before(() => shell(prune));
test.after(() => shell(prune));

test('installing a valid package with an exact version should return Right', async t => {
	const installed = fromEither({}, await install(path, 'ramda', '0.25.0'));
	const {identity} = require('ramda@0.25.0');

	t.is(installed.installed, true);
	t.is(installed.name, 'ramda');
	t.is(installed.version, '0.25.0');
	t.is(identity('hello'), 'hello');
});

test('installing a valid scoped package should return Right', async t => {
	const installed = fromEither({}, await install(path, '@rockymadden/now-go', '0.0.0'));
	const req = require('@rockymadden/now-go@0.0.0');

	t.is(installed.installed, true);
	t.is(installed.name, '@rockymadden/now-go');
	t.is(installed.version, '0.0.0');
	t.truthy(req);
});

test('installing a valid package numerous times concurrently less than timeout should return Right', async t => {
	const toInstall = [
		install(path, 'ramda', '0.24.0'),
		install(path, 'ramda', '0.24.0')
	];
	const installed = map(extract, await Promise.all(toInstall));
	const delayed0 = filter(i => i.delayed === 0, installed)[0];
	const delayedGreaterThan0 = filter(i => i.delayed > 0, installed)[0];

	t.true(delayed0.installed);
	t.false(delayedGreaterThan0.installed);
});

// Dunno how to get here anymore
test.skip('installing a valid package numerous times concurrently greater than timeout should return Left', async t => {
	const toInstall = [
		install(path, 'ramda', '0.23.0'),
		install(path, 'ramda', '0.23.0'),
		install(path, 'ramda', '0.23.0'),
		install(path, 'ramda', '0.23.0'),
		install(path, 'ramda', '0.23.0'),
		install(path, 'ramda', '0.23.0')
	];
	const installed = map(extract, await Promise.all(toInstall));
	const delayedMaximum = filter(i => is(Error, i) && i.message === 'Delayed exceeds timeout', installed)[0];

	t.truthy(delayedMaximum);
});

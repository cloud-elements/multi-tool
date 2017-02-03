'use strict';

const test = require('ava');
const multitool = require('../src');

test(async t => {
  const install = await multitool('node_modules', 'ramda', '0.23.0');

  t.is(install, 'ramda-0.23.0');
});

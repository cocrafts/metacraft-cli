#!/usr/bin/env node
global.nodeRequire = require;
global.engine = require('./wasm/pkg');
global.setEnv = function (key, val) {
	process.env[key] = val;
};
global.packageJson = require('./package.json');
require('./bundle');

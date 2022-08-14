#!/usr/bin/env node
global.nodeRequire = require;
global.engine = require('./wasm/pkg');
global.packageJson = require('./package.json');
require('./bundle');

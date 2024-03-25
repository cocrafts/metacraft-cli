require('esbuild-register/dist/node').register();
require('./injection');

const { createServer } = require('http');
const { resolve, relative } = require('path');
const { watch } = require('chokidar');
const { gray, green, red } = require('chalk');
const invalidate = require('invalidate-module');
const express = require('express');
const entryFile = process.argv[2];
const entryUri = resolve(process.cwd(), entryFile);

const mark = '｢metacraft｣';
const asyncWrap = (result) => new Promise((resolve) => resolve(result));

const httpServer = createServer();
const defaultHandler = express();

const configureServer = (httpServer, listen = false) => {
	const entryMod = require(entryUri);
	const configure = entryMod.configure || (() => undefined);

	asyncWrap(configure(express, httpServer)).then((requestHandler) => {
		if (listen) {
			httpServer.listen('3005');
		}

		httpServer.removeAllListeners('upgrade');
		httpServer.removeAllListeners('request');
		httpServer.on('request', requestHandler || defaultHandler);
	});
};

watch(process.cwd(), {
	ignoreInitial: true,
	ignored: ['**/node_modules/**/*', '**/.git/**/*', '**/.idea/**/*'],
}).on('all', (event, filename) => {
	const relativeUri = relative(process.cwd(), filename);

	invalidate(resolve(filename));
	console.log(gray(mark) + green(' • ') + gray(`hot reloaded ${relativeUri}`));

	try {
		configureServer(httpServer);
	} catch (err) {
		console.log(`${gray(mark)} failed to reload ${red(relativeUri)}:`);
		console.log(err);
	}
});

configureServer(httpServer, true);

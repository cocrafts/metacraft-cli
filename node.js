require('esbuild-register/dist/node').register();
require('./injection');

const { resolve } = require('path');
const entryFile = process.argv[process.argv.length - 1];
const entryUri = resolve(process.cwd(), entryFile);

require(entryUri);

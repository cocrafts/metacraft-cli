const { resolve } = require('path');
const nodeExternals = require('webpack-node-externals');
const WasmPackPlugin = require('@wasm-tool/wasm-pack-plugin');

const mode = process.env.mode || 'development';

const wasmPlugin = new WasmPackPlugin({
	crateDirectory: resolve(__dirname, 'wasm'),
	forceMode: mode,
	extraArgs: '--target nodejs',
});

// const tsLoader = { test: /\.(ts|js)$/, loader: 'ts-loader' }
const swcLoader = {
	test: /\.(ts|js)$/,
	loader: 'swc-loader',
	options: {
		jsc: {
			target: 'es2015',
		},
	},
};

module.exports = {
	mode,
	target: 'node',
	externals: [nodeExternals()],
	externalsPresets: {
		node: true,
	},
	entry: {
		bundle: './src/index.ts',
	},
	output: {
		path: resolve(__dirname),
	},
	resolve: {
		extensions: ['.js', '.ts'],
		alias: {
			commands: resolve(__dirname, 'src/commands'),
			middlewares: resolve(__dirname, 'src/middlewares'),
			utils: resolve(__dirname, 'src/utils'),
			types: resolve(__dirname, 'src/types'),
		},
	},
	module: {
		rules: [swcLoader],
	},
	plugins: [wasmPlugin],
};

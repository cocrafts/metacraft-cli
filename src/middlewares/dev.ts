import { parseConfigs } from 'utils/cli';
import { DevMiddleware } from 'utils/types';

export const bareDevMiddleware: DevMiddleware = async (configs, internal) => {
	const { publicPath, port, optimizeMode } = parseConfigs(internal.configs);

	return {
		publicPath,
		port,
		contentBase: 'metacraft',
		hot: true,
		historyApiFallback: true,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
			'Access-Control-Allow-Headers':
				'X-Requested-With, content-type, Authorization',
		},
		stats: {
			context: process.cwd(),
			all: true,
			assets: optimizeMode,
			colors: true,
			version: optimizeMode,
			hash: optimizeMode,
			timings: true,
			chunks: optimizeMode,
			performance: optimizeMode,
			modules: optimizeMode,
			moduleTrace: optimizeMode,
			modulesSort: 'size',
			chunkModules: optimizeMode,
			chunkOrigins: optimizeMode,
			cached: true,
			error: true,
			cachedAssets: optimizeMode,
		},
		clientLogLevel: 'silent',
		noInfo: !optimizeMode,
		overlay: true,
	};
};

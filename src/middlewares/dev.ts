import { join } from 'path';

import { parseConfigs } from 'utils/cli';
import { DevMiddleware } from 'utils/types';

export const bareDevMiddleware: DevMiddleware = async (configs, internal) => {
	const { publicPath, port } = parseConfigs(internal.configs);

	return {
		port,
		hot: true,
		static: {
			publicPath,
			directory: join(process.cwd(), 'metacraft'),
		},
		client: {
			progress: true,
			overlay: true,
			logging: 'warn',
		},
		compress: true,
		historyApiFallback: true,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
			'Access-Control-Allow-Headers':
				'X-Requested-With, content-type, Authorization',
		},
	};
};

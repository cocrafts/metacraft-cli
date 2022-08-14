import { exists } from 'utils/modules';
import { MetacraftConfigs, ParsedConfigs } from 'utils/types';

export const guessEntry = async (
	entries: string[],
): Promise<string | undefined> => {
	for (const entry of entries) {
		if (await exists(entry)) {
			return entry;
		}
	}
};

export const parseConfigs = (
	configs: MetacraftConfigs,
	args,
): ParsedConfigs => {
	const env = configs.env();
	const isProduction = configs.isProduction(env);

	return {
		env,
		isProduction,
		publicPath: configs.publicPath(isProduction, env),
		staticPath: configs.staticPath(isProduction, env),
		port: configs.port(args.port),
		serverPort: configs.serverPort(args.serverPort),
		host: configs.host(args.host),
		optimizeMode: configs.optimizeMode(env),
		keepPreviousBuild: configs.keepPreviousBuild(isProduction),
	};
};

export const webEntries = [
	'index.web.js',
	'index.js',
	'index.ts',
	'index.web.ts',
];

export const nodeEntries = [
	'index.node.js',
	'server.js',
	'node.js',
	'index.node.ts',
	'server.ts',
	'node.ts',
];

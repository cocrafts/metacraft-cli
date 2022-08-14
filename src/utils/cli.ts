import { merge } from 'lodash';
import { defaultLogger } from 'utils/logger';
import { crossRequire, crossResolve, exists } from 'utils/modules';
import {
	MetacraftConfigs,
	MetacraftInternals,
	MetacraftModules,
	ParsedConfigs,
} from 'utils/types';
import { v4 as uuid } from 'uuid';

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
	args?,
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

export const extractInternals = async (): Promise<MetacraftInternals> => {
	const modules: MetacraftModules = {};
	const projectConfigs: MetacraftConfigs = await crossRequire(configEntry, {});

	const moduleMap = merge(
		{
			chalk: 'node_modules/chalk',
			express: 'node_modules/express',
			ProgressBarPlugin: 'node_modules/progress-bar-webpack-plugin',
			HtmlPlugin: 'node_modules/html-webpack-plugin',
			DevServer: 'node_modules/webpack-dev-server',
		},
		projectConfigs.resolves || {},
	);

	for (const key in moduleMap) {
		modules[key] = await crossRequire(moduleMap[key]);
	}

	modules['logger'] = defaultLogger(modules['chalk']);

	const configs: MetacraftConfigs = merge(
		{
			env: () => process.env.ENV || 'development',
			isProduction: (env) => env === 'PRODUCTION',
			publicPath: () => '/',
			staticPath: () => 'rockman',
			port: (cliDefault) => process.env.PORT || cliDefault || 3000,
			serverPort: (cliDefault) => process.env.PORT || cliDefault || 3005,
			host: (cliDefault) => process.env.HOST || cliDefault || 'localhost',
			optimizeMode: () => !!process.env.OPTIMIZE,
			keepPreviousBuild: () => false,
			buildId: uuid,
			moduleAlias: { global: {}, web: {}, node: {} },
			htmlTemplate: await crossResolve('assets/index.hbs'),
			htmlOptions: {},
			resolves: {},
		},
		projectConfigs,
	);

	return { configs, modules };
};

const configEntry = 'metacraft.config.js';

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

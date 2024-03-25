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

export const guessEnvironmentEntry = async (
	isProduction: boolean,
): Promise<string> => {
	const entries = isProduction ? envEntries.production : envEntries.development;

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
		...configs,
		env,
		isProduction,
		publicPath: configs.publicPath(isProduction, env),
		staticPath: configs.staticPath(isProduction, env),
		port: configs.port(args?.port),
		serverPort: configs.serverPort(args?.serverPort),
		host: configs.host(args?.host),
		stats: configs.stats(isProduction, env),
		esBuildOptions: configs.esBuildOptions(isProduction, env),
		swcOptions: configs.swcOptions(isProduction, env),
		keepPreviousBuild: configs.keepPreviousBuild(isProduction),
	};
};

export const extractInternals = async (): Promise<MetacraftInternals> => {
	const modules: MetacraftModules = {};
	const projectConfigs: MetacraftConfigs = await crossRequire(configEntry, {});
	const packageJson = await crossRequire('package.json');

	const moduleMap = merge(
		{
			chalk: 'node_modules/chalk',
			webpack: 'node_modules/webpack',
			express: 'node_modules/express',
			ProgressBarPlugin: 'node_modules/progress-bar-webpack-plugin',
			HtmlPlugin: 'node_modules/html-webpack-plugin',
			TerserPlugin: 'node_modules/terser-webpack-plugin',
			CssExtractPlugin: 'node_modules/mini-css-extract-plugin',
			TsconfigPathsPlugin: 'node_modules/tsconfig-paths-webpack-plugin',
			ReactRefreshPlugin: 'node_modules/@pmmmwh/react-refresh-webpack-plugin',
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
			isProduction: (env) => env === 'production',
			publicPath: () => '/',
			staticPath: () => 'metacraft',
			port: (cliDefault) => process.env.PORT || cliDefault || 3000,
			serverPort: (cliDefault) => process.env.PORT || cliDefault || 3005,
			host: (cliDefault) => process.env.HOST || cliDefault || 'localhost',
			stats: () => ({}),
			esBuildOptions: () => ({}),
			swcOptions: () => ({}),
			keepPreviousBuild: () => false,
			buildId: uuid,
			moduleAlias: { global: {}, web: {}, node: {} },
			htmlTemplate: await crossResolve(['index.ejs', 'assets/index.ejs']),
			templateParameters: {},
			htmlPluginOptions: {},
			resolves: {},
			webpackMiddlewares: [],
			devMiddlewares: [],
			useBabel: false,
			useReact: !!packageJson?.dependencies?.react,
			withProgress: true,
		} as MetacraftConfigs,
		projectConfigs,
	);

	return { configs, modules };
};

const configEntry = 'metacraft.config.js';

export const styleEntries = [
	'style.css',
	'assets/style.css',
	'style.scss',
	'assets/style.scss',
	'style.sass',
	'assets/style.sass',
];

export const nodeEntries = [
	'index.js',
	'index.ts',
	'node.js',
	'node.ts',
	'index.node.js',
	'index.node.ts',
	'cli.js',
	'cli.ts',
	'index.cli.js',
	'index.cli.ts',
];

export const devEntries = [
	'web.js',
	'web.ts',
	'index.web.js',
	'index.web.ts',
	'browser.js',
	'browser.ts',
	'index.browser.js',
	'index.browser.ts',
];

export const serverEntries = [
	'server.js',
	'server.ts',
	'index.server.js',
	'index.server.ts',
];

export const envEntries = {
	development: ['.env.development', '.env'],
	production: ['.env.production', '.env'],
};

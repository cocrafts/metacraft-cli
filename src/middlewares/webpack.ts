import { resolve } from 'path';

import { merge } from 'lodash';
import { generateHtmlPlugin } from 'plugins/html';
import { generateProgressPlugin } from 'plugins/progress';
import { devEntries, guessEntry, styleEntries } from 'utils/cli';
import { crossResolve, isPackageDeclared } from 'utils/modules';
import { WebpackMiddleware } from 'utils/types';
import { getJsRule } from 'utils/webpack';

export const bareWebpackMiddleware: WebpackMiddleware = async (
	configs,
	internal,
) => {
	const parsedConfigs = internal.configs;
	const {
		buildId,
		env,
		stats,
		isProduction,
		staticPath,
		publicPath,
		moduleAlias,
		useReact,
		withProgress,
	} = parsedConfigs;
	const {
		webpack,
		TerserPlugin,
		CssExtractPlugin,
		ReactRefreshPlugin,
		TsconfigPathsPlugin,
	} = internal.modules;
	const isReactDeclared = await isPackageDeclared('react');
	const isReactUsed = isReactDeclared || useReact;
	const uniqueId = buildId();
	const innerModuleUri = resolve(__dirname, 'node_modules');
	const shareModuleUri = resolve(__dirname, '../../'); /* yarn globals */
	const appEntries = [
		await crossResolve(styleEntries),
		await guessEntry(devEntries),
	];
	const devUri = await crossResolve(
		'node_modules/webpack-dev-server/client/index.js',
	);
	const hotUri = await crossResolve(
		'node_modules/webpack/hot/only-dev-server.js',
	);
	const conditionalPlugins = [];
	const hotEntries = [`${devUri}?${publicPath}`, hotUri];
	const runStats = {
		context: process.cwd(),
		all: false,
		modulesSort: 'size',
		cached: true,
		warnings: true,
		errors: true,
	};
	const jsRule = await getJsRule(parsedConfigs);

	if (isProduction) {
		// TODO: work with build.json
	}

	if (isReactUsed && !isProduction) {
		conditionalPlugins.push(new ReactRefreshPlugin());
	}

	if (withProgress) {
		conditionalPlugins.push(generateProgressPlugin(internal, parsedConfigs));
	}

	return {
		context: process.cwd(),
		stats: merge(runStats, stats),
		infrastructureLogging: {
			level: 'warn',
		},
		mode: isProduction ? 'production' : 'development',
		entry: {
			app: {
				import: isProduction ? appEntries : [...hotEntries, ...appEntries],
				filename: isProduction
					? `${uniqueId}.[contenthash].js`
					: `[name].[contenthash].js`,
			},
		},
		optimization: {
			minimize: isProduction,
			minimizer: [
				new TerserPlugin({
					extractComments: false,
				}),
			],
			moduleIds: 'named',
		},
		output: {
			publicPath,
			path: resolve(process.cwd(), staticPath),
			filename: '[name].[contenthash].js',
			chunkFilename: '[id].[contenthash].js',
		},
		resolveLoader: {
			modules: [innerModuleUri, shareModuleUri],
		},
		resolve: {
			mainFields: ['browser', 'main', 'module'],
			alias: { ...moduleAlias.global, ...moduleAlias.web },
			modules: [process.cwd(), 'node_modules'],
			plugins: [new TsconfigPathsPlugin()],
			extensions: [
				'.web.js',
				'.js',
				'.web.jsx',
				'.jsx',
				'.web.ts',
				'.ts',
				'.web.tsx',
				'.tsx',
				'.scss',
				'.sass',
			],
		},
		module: {
			rules: [
				jsRule,
				{
					test: /\.s[ac]ss$/i,
					use: [
						CssExtractPlugin.loader,
						'css-loader',
						'postcss-loader',
						{
							loader: 'sass-loader',
							options: { api: 'modern' },
						},
					],
				},
				{
					test: /\.css$/,
					use: [CssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
				},
				{
					test: /\.(png|jpg|svg|ttf)$/,
					type: 'asset/resource',
					generator: {
						filename: 'assets/[name].[hash][ext][query]',
					},
				},
			],
		},
		plugins: [
			new webpack.DefinePlugin({
				ENV: JSON.stringify(env),
				'process.env.NODE_ENV': JSON.stringify(env),
			}),
			generateHtmlPlugin(internal, parsedConfigs),
			new CssExtractPlugin(),
			...conditionalPlugins,
		],
	};
};

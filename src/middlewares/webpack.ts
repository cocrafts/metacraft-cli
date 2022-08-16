import { resolve } from 'path';

import { Options } from '@swc/core';
import { merge } from 'lodash';
import { devEntries, guessEntry, parseConfigs } from 'utils/cli';
import { crossResolve, exists } from 'utils/modules';
import { WebpackMiddleware } from 'utils/types';

export const bareWebpackMiddleware: WebpackMiddleware = async (
	configs,
	internal,
) => {
	let brightFlag = false;
	let initialBuild = true;
	const parsedConfigs = parseConfigs(internal.configs);
	const { env, isProduction, publicPath, staticPath, stats, swcOptions } =
		parsedConfigs;
	const { buildId, moduleAlias, htmlTemplate, templateParameters } =
		internal.configs;
	const {
		webpack,
		HtmlPlugin,
		ProgressBarPlugin,
		CssExtractPlugin,
		ReactRefreshPlugin,
		chalk,
	} = internal.modules;
	const { gray, blue } = chalk;
	const uniqueId = buildId();
	const innerModuleUri = resolve(__dirname, 'node_modules');
	const shareModuleUri = resolve(__dirname, '../'); /* yarn globals */
	const appEntries = [
		await crossResolve(['style.sass', 'assets/style.sass']),
		await guessEntry(devEntries),
	];
	const devUri = await crossResolve(
		'node_modules/webpack-dev-server/client/index.js',
	);
	const hotUri = await crossResolve(
		'node_modules/webpack/hot/only-dev-server.js',
	);
	const hotEntries = [`${devUri}?${publicPath}`, hotUri];
	const conditionalPlugins = [];
	const reactAvailable = exists('react');
	const runStats = {
		context: process.cwd(),
		all: false,
		modulesSort: 'size',
		cached: true,
		warnings: true,
		errors: true,
	};
	const swcRunOptions: Options = {
		jsc: {
			parser: {
				syntax: 'typescript',
				tsx: true,
				dynamicImport: true,
			},
			transform: {},
		},
	};

	if (reactAvailable) {
		swcRunOptions.jsc.transform.react = {
			refresh: !isProduction,
		};
	}

	if (isProduction) {
		console.log('TODO: work with build.json');
	} else {
		conditionalPlugins.push(new ReactRefreshPlugin());
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
				filename: isProduction ? `${uniqueId}.js` : '[name].js',
			},
		},
		optimization: {
			minimize: isProduction,
			moduleIds: 'named',
		},
		output: {
			publicPath,
			path: resolve(process.cwd(), staticPath),
			filename: '[name].js',
			chunkFilename: '[id].js',
		},
		resolveLoader: {
			modules: [innerModuleUri, shareModuleUri],
		},
		resolve: {
			mainFields: ['browser', 'main', 'module'],
			alias: { ...moduleAlias.global, ...moduleAlias.web },
			modules: [process.cwd(), 'node_modules'],
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
				{
					test: /\.(ts|js)x?$/,
					loader: 'swc-loader',
					options: merge(swcRunOptions, swcOptions),
				},
				{
					test: /\.s[ac]ss$/i,
					use: [CssExtractPlugin.loader, 'css-loader', 'sass-loader'],
				},
				{
					test: /\.css$/,
					use: [CssExtractPlugin.loader, 'css-loader'],
				},
				{
					test: /\.(png|jpg|svg|ttf)$/,
					loader: 'file-loader',
					options: {
						name: '[name].[ext]',
					},
				},
			],
		},
		plugins: [
			new webpack.DefinePlugin({
				ENV: JSON.stringify(env),
				'process.env.NODE_ENV': JSON.stringify(env),
			}),
			new HtmlPlugin({
				template: htmlTemplate,
				templateParameters: {
					title: 'Metacraft',
					...parsedConfigs,
					...templateParameters,
				},
				filename: 'index.html',
			}),
			new ProgressBarPlugin({
				width: 18,
				complete: '#',
				incomplete: gray('#'),
				format: `${blue(' • ')}[:bar] ${gray('(:elapsed seconds)')}`,
				summary: false,
				customSummary: (time) => {
					const buildTime = `${time.substring(0, time.length - 1)}${gray('s')}`;
					const alternatedColor = brightFlag ? (x) => x : gray;
					const buildType = initialBuild
						? 'initial build'
						: 'hot module update';
					const buildFlag = isProduction ? 'production bundle' : buildType;

					console.log(alternatedColor(' •'), gray(`${buildFlag}`), buildTime);

					brightFlag = !brightFlag;
					initialBuild = false;
				},
			}),
			new CssExtractPlugin(),
			...conditionalPlugins,
		],
	};
};

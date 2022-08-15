import { resolve } from 'path';

import { devEntries, guessEntry, parseConfigs } from 'utils/cli';
import { crossRequire, crossResolve, exists } from 'utils/modules';
import { WebpackMiddleware } from 'utils/types';

export const bareWebpackMiddleware: WebpackMiddleware = async (
	configs,
	internal,
) => {
	let brightFlag = false;
	let initialBuild = true;
	const parsedConfigs = parseConfigs(internal.configs);
	const { env, isProduction, publicPath, staticPath } = parsedConfigs;
	const { buildId, moduleAlias, htmlTemplate, templateParameters } =
		internal.configs;
	const { webpack, HtmlPlugin, ProgressBarPlugin, CssExtractPlugin, chalk } =
		internal.modules;
	const { gray, blue } = chalk;
	const uniqueId = buildId();
	const appEntry = await guessEntry(devEntries);
	const devUri = resolve(__dirname, 'node_modules/webpack-dev-server');
	const hotUri = resolve(__dirname, 'node_modules/webpack/hot/only-dev-server');
	const hotEntries = [`${devUri}/client?${publicPath}`, hotUri];
	const babelPlugins = [];
	const conditionalPlugins = isProduction
		? []
		: [new webpack.HotModuleReplacementPlugin()];
	const reactAvailable = exists('react');

	if (isProduction) {
		console.log('TODO: work with build.json');
	}

	if (!isProduction && reactAvailable) {
		const ReactRefreshWebpackPlugin = await crossRequire(
			'node_modules/@pmmmwh/react-refresh-webpack-plugin',
		);

		conditionalPlugins.push(new ReactRefreshWebpackPlugin());
		babelPlugins.push(
			await crossResolve('node_modules/react-refresh/babel.js'),
		);
	}

	return {
		context: process.cwd(),
		mode: isProduction ? 'production' : 'development',
		entry: {
			app: {
				import: isProduction ? appEntry : [...hotEntries, appEntry],
				filename: isProduction ? `${uniqueId}.js` : '[name].js',
			},
			style: await crossResolve(['style.sass', 'assets/style.sass']),
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
			modules: [resolve(__dirname, 'node_modules')],
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
					loader: 'babel-loader',
					options: {
						compact: false,
						cacheDirectory: true,
						plugins: babelPlugins,
					},
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

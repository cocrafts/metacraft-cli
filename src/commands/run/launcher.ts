import { fork } from 'child_process';
import { resolve } from 'path';

import { bareDevMiddleware } from 'middlewares/dev';
import { bareWebpackMiddleware } from 'middlewares/webpack';
import type {
	MetacraftInternals,
	MetacraftLogger,
	ParsedConfigs,
} from 'utils/types';
import type { Configuration } from 'webpack';
import type { Configuration as DevConfiguration } from 'webpack-dev-server';

interface LaunchArgs {
	entry?: string;
	logger: MetacraftLogger;
	internal?: MetacraftInternals;
	parsedConfigs?: ParsedConfigs;
}

export const launchNodeIfPossible = async ({
	entry,
	logger,
	parsedConfigs,
}: LaunchArgs): Promise<void> => {
	if (!entry) return;

	logger.nodeDetected(entry, parsedConfigs);
	logger.launchNodeServer(parsedConfigs);

	try {
		fork(resolve(__dirname, 'server.js'), [entry], {
			cwd: process.cwd(),
			stdio: 'inherit',
		});
	} catch (e) {
		logger.launchNodeFailure(entry, parsedConfigs);
	}
};

export const launchDevIfPossible = async ({
	entry,
	logger,
	internal,
	parsedConfigs,
}: LaunchArgs): Promise<void> => {
	if (!entry) return;
	const { devMiddlewares, webpackMiddlewares } = internal.configs;
	const { webpack, DevServer } = internal.modules;
	const { port, host } = parsedConfigs;

	logger.devDetected(entry, parsedConfigs);
	logger.launchDevServer(parsedConfigs);

	const webpackItems = [bareWebpackMiddleware, ...webpackMiddlewares];
	const devItems = [bareDevMiddleware, ...devMiddlewares];

	let webpackConfig: Configuration;
	let devConfig: DevConfiguration;

	for (let i = 0; i < webpackItems.length; i += 1) {
		const middleware = webpackItems[i];
		const nextConfig = await middleware(webpackConfig, internal);

		if (nextConfig) {
			webpackConfig = nextConfig;
		} else {
			break;
		}
	}

	for (let i = 0; i < devItems.length; i += 1) {
		const middleware = devItems[i];
		const nextConfig = await middleware(devConfig, internal);

		if (nextConfig) {
			devConfig = nextConfig;
		} else {
			break;
		}
	}

	const compiler = webpack(webpackConfig);
	const devServer = new DevServer(compiler, devConfig);

	devServer.listen(port, host, (error) => {
		if (error) console.log(error);
	});
};

import { fork } from 'child_process';
import { resolve } from 'path';

import { bareDevMiddleware } from 'middlewares/dev';
import { bareWebpackMiddleware } from 'middlewares/webpack';
import { combineMiddlewares } from 'utils/middleware';
import type {
	MetacraftInternals,
	MetacraftLogger,
	ParsedConfigs,
} from 'utils/types';

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

	logger.devDetected(entry, parsedConfigs);
	logger.launchDevServer(parsedConfigs);

	const webpackConfigs = await combineMiddlewares({
		internal,
		middlewares: [bareWebpackMiddleware, ...webpackMiddlewares],
	});

	const devConfigs = await combineMiddlewares({
		internal,
		middlewares: [bareDevMiddleware, ...devMiddlewares],
	});

	const compiler = webpack(webpackConfigs);
	const devServer = new DevServer(devConfigs, compiler);

	devServer.start();
};

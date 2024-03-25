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

const packageJson = global.packageJson;

export const launchNodeIfPossible = async ({
	entry,
	logger,
	parsedConfigs,
}: LaunchArgs): Promise<void> => {
	if (!entry) return;
	logger.nodeDetected(entry, parsedConfigs);
	console.log('hmmm');
};

export const launchWebIfPossible = async ({
	entry,
	logger,
	internal,
	parsedConfigs,
}: LaunchArgs): Promise<void> => {
	if (!entry) return;
	const { devMiddlewares, webpackMiddlewares } = internal.configs;
	const { webpack, DevServer } = internal.modules;

	logger.greeting(packageJson.version);
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
	logger.listeningForChanges(parsedConfigs);
};

export const launchServerIfPossible = async ({
	entry,
	logger,
	parsedConfigs,
}: LaunchArgs): Promise<void> => {
	if (!entry) return;

	logger.greeting(packageJson.version);
	logger.serverDetected(entry, parsedConfigs);
	logger.launchServer(parsedConfigs);

	try {
		fork(resolve(__dirname, 'server.js'), [entry], {
			cwd: process.cwd(),
			stdio: 'inherit',
		});
		logger.listeningForChanges(parsedConfigs);
	} catch (e) {
		logger.launchNodeFailure(entry, parsedConfigs);
	}
};

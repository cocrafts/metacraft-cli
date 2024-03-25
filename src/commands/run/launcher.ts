import { fork } from 'child_process';
import { resolve } from 'path';

import { bareDevMiddleware } from 'middlewares/dev';
import { bareWebpackMiddleware } from 'middlewares/webpack';
import { combineMiddlewares } from 'utils/middleware';
import type { MetacraftLogger, ParsedMetacraftInternals } from 'utils/types';

interface LaunchArgs {
	entry?: string;
	logger: MetacraftLogger;
	internal?: ParsedMetacraftInternals;
}

const packageJson = global.packageJson;

export const launchNodeIfPossible = async ({
	entry,
	logger,
	internal,
}: LaunchArgs): Promise<void> => {
	if (!entry) return;
	logger.nodeDetected(entry, internal.configs);

	try {
		fork(resolve(__dirname, 'node.js'), [...process.argv.slice(2), entry], {
			cwd: process.cwd(),
			stdio: 'inherit',
		});
	} catch (e) {
		logger.launchNodeFailure(entry, internal.configs);
	}
};

export const launchWebIfPossible = async ({
	entry,
	logger,
	internal,
}: LaunchArgs): Promise<void> => {
	if (!entry) return;
	const { devMiddlewares, webpackMiddlewares } = internal.configs;
	const { webpack, DevServer } = internal.modules;

	logger.greeting(packageJson.version);
	logger.devDetected(entry, internal.configs);
	logger.launchDevServer(internal.configs);

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
	logger.listeningForChanges(internal.configs);
};

export const launchServerIfPossible = async ({
	entry,
	logger,
	internal,
}: LaunchArgs): Promise<void> => {
	if (!entry) return;

	logger.greeting(packageJson.version);
	logger.serverDetected(entry, internal.configs);
	logger.launchServer(internal.configs);

	try {
		fork(resolve(__dirname, 'server.js'), [entry], {
			cwd: process.cwd(),
			stdio: 'inherit',
		});
		logger.listeningForChanges(internal.configs);
	} catch (e) {
		logger.launchNodeFailure(entry, internal.configs);
	}
};

import { fork } from 'child_process';
import { resolve } from 'path';

import type { MetacraftLogger, ParsedConfigs } from 'utils/types';

interface LaunchNodeArgs {
	entry?: string;
	logger: MetacraftLogger;
	parsedConfigs?: ParsedConfigs;
}

export const launchNodeIfPossible = async ({
	entry,
	logger,
	parsedConfigs,
}: LaunchNodeArgs): Promise<void> => {
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

export const launchDevelopment = async (): Promise<void> => {
	console.log('coming soon!');
};

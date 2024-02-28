import { guessEntries } from 'commands/run/internal';
import { config as loadEnvironmentVariables } from 'dotenv';
import {
	extractInternals,
	guessEnvironmentEntry,
	parseConfigs,
} from 'utils/cli';
import { RootOptions } from 'utils/configs';
import { CommandModule, Options } from 'yargs';

import { bundleNodeBuild, bundleWebBuild } from './bundler';

const module: CommandModule<object, RootOptions> = {
	command: 'bundle',
	aliases: ['build', 'compile'],
	describe: 'Build production bundle',
	builder: (yargs) => {
		return yargs
			.options(bundleOptions)
			.group(Object.keys(bundleOptions), '[bundle] Options:');
	},
	handler: async (args) => {
		global.setEnv('ENV', args.e);
		global.setEnv('NODE_ENV', args.e);

		if (args.env) {
			loadEnvironmentVariables({ path: args.envFile });
		} else {
			const envEntry = await guessEnvironmentEntry(true);
			loadEnvironmentVariables({ path: envEntry });
		}

		const internal = await extractInternals();
		const parsedConfigs = parseConfigs(internal.configs, args);
		const { logger } = internal.modules;
		const { webEntry, nodeEntry } = await guessEntries(logger);

		await bundleWebBuild({
			entry: webEntry,
			logger,
			internal,
			parsedConfigs,
		});

		await bundleNodeBuild({
			entry: nodeEntry,
			logger,
			internal,
			parsedConfigs,
		});
	},
};

export default module;

const bundleOptions = {
	environment: {
		alias: 'e',
		type: 'string',
		default: 'production',
		describe: 'Build environment',
	} as Options,
	hydrate: {
		alias: 'h',
		type: 'boolean',
		default: false,
		describe: 'Hydrate pages to static HTML markup',
	} as Options,
};

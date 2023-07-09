import { guessEntries } from 'commands/run/internal';
import { config as loadEnvironmentVariables } from 'dotenv';
import {
	extractInternals,
	guessEnvironmentEntry,
	parseConfigs,
} from 'utils/cli';
import { CommandModule, Options } from 'yargs';

import { generateBundle } from './bundler';

const module: CommandModule = {
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
		const envEntry = await guessEnvironmentEntry(false);
		loadEnvironmentVariables({ path: envEntry });

		const internal = await extractInternals();
		const parsedConfigs = parseConfigs(internal.configs, args);
		const { logger } = internal.modules;
		const { webEntry } = await guessEntries(logger);

		await generateBundle({
			entry: webEntry,
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

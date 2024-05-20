import { guessEntries } from 'commands/run/internal';
import { config as loadEnvironmentVariables } from 'dotenv';
import {
	extractInternals,
	guessEnvironmentEntry,
	loadEnvironments,
	parseConfigs,
} from 'utils/cli';
import { RootOptions } from 'utils/configs';
import { CommandModule, Options } from 'yargs';

import { bundleNodeBuild, bundleWebBuild } from './bundler';

type RunOptions = RootOptions & {
	hydrate?: boolean;
};

const module: CommandModule<object, RunOptions> = {
	command: 'bundle',
	aliases: ['build', 'compile'],
	describe: 'Build production bundle',
	builder: (yargs) => {
		return yargs
			.options(bundleOptions)
			.group(Object.keys(bundleOptions), '[bundle] Options:');
	},
	handler: async (args) => {
		await loadEnvironments(args.environment, args.environmentFile);
		const envEntry = await guessEnvironmentEntry(args.e as never);
		loadEnvironmentVariables({ path: envEntry });

		const internal = await extractInternals();
		const parsedConfigs = parseConfigs(internal.configs, args);
		const { logger } = internal.modules;
		const { webEntry, nodeEntry, serverEntry } = await guessEntries(logger);

		await bundleNodeBuild({
			entry: nodeEntry,
			logger,
			internal,
			parsedConfigs,
		});

		await bundleWebBuild({
			entry: webEntry,
			logger,
			internal,
			parsedConfigs,
		});

		await bundleNodeBuild({
			entry: serverEntry,
			logger,
			internal,
			parsedConfigs,
		});
	},
};

export default module;

const bundleOptions: Record<string, Options> = {
	environment: {
		type: 'string',
		default: 'production',
		describe: 'Build environment',
	},
	hydrate: {
		alias: 'h',
		type: 'boolean',
		default: false,
		describe: 'Hydrate pages to static HTML markup',
	},
};

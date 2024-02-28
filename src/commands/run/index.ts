import { guessEntries } from 'commands/run/internal';
import {
	launchDevIfPossible,
	launchNodeIfPossible,
} from 'commands/run/launcher';
import { config as loadEnvironmentVariables } from 'dotenv';
import {
	extractInternals,
	guessEnvironmentEntry,
	parseConfigs,
} from 'utils/cli';
import { RootOptions } from 'utils/configs';
import { type CommandModule, Options } from 'yargs';

type RunOptions = RootOptions & { e?: string };

const module: CommandModule<object, RunOptions> = {
	command: '$0',
	aliases: ['dev'],
	describe: 'Launch development server(s)',
	builder: (yargs) => yargs.default('p', 3000).options(runOptions),
	handler: async (args) => {
		global.setEnv('ENV', args.e);
		global.setEnv('NODE_ENV', args.e);

		if (args.envFile) {
			loadEnvironmentVariables({ path: args.envFile });
		} else {
			const envEntry = await guessEnvironmentEntry(false);
			loadEnvironmentVariables({ path: envEntry });
		}

		const internal = await extractInternals();
		const { logger } = internal.modules;
		const parsedConfigs = parseConfigs(internal.configs, args);
		const { nodeEntry, webEntry } = await guessEntries(logger);

		await launchNodeIfPossible({
			entry: nodeEntry,
			logger,
			internal,
			parsedConfigs,
		});

		await launchDevIfPossible({
			entry: webEntry,
			logger,
			internal,
			parsedConfigs,
		});

		logger.listeningForChanges(parsedConfigs);
	},
};

export default module;

const runOptions = {
	environment: {
		alias: 'e',
		type: 'string',
		default: 'development',
		describe: 'Build environment',
	} as Options,
};

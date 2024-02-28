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
import { MetacraftOptions } from 'utils/configs';
import { type CommandModule } from 'yargs';

const module: CommandModule<object, MetacraftOptions> = {
	command: '$0',
	aliases: ['dev'],
	describe: 'Launch development server(s)',
	builder: (yargs) => yargs.default('p', 3000),
	handler: async (args) => {
		if (args.env) {
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

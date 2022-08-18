import { guessEntries } from 'commands/run/internal';
import {
	launchDevIfPossible,
	launchNodeIfPossible,
} from 'commands/run/launcher';
import { extractInternals, parseConfigs } from 'utils/cli';
import { type CommandModule } from 'yargs';

const module: CommandModule = {
	command: '$0',
	aliases: ['dev'],
	describe: 'Launch development server(s)',
	builder: (yargs) => yargs.default('p', 3000),
	handler: async (args) => {
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

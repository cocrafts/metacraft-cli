import { guessEntries } from 'commands/run/internal';
import { launchNodeIfPossible } from 'commands/run/launcher';
import { extractInternals, parseConfigs } from 'utils/cli';
import { type CommandModule } from 'yargs';

const module: CommandModule = {
	command: '$0',
	aliases: ['dev'],
	describe: 'Launch development server(s)',
	builder: (yargs) => yargs.default('p', 2000),
	handler: async (args) => {
		const { configs, modules } = await extractInternals();
		const { logger } = modules;
		const parsedConfigs = parseConfigs(configs, args);
		const { nodeEntry } = await guessEntries(logger);

		await launchNodeIfPossible({ entry: nodeEntry, logger, parsedConfigs });
	},
};

export default module;

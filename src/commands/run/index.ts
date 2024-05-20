import { guessEntries } from 'commands/run/internal';
import {
	launchNodeIfPossible,
	launchServerIfPossible,
	launchWebIfPossible,
} from 'commands/run/launcher';
import { extractInternals, loadEnvironments, parseConfigs } from 'utils/cli';
import { PackOptions, RootOptions } from 'utils/configs';
import { ParsedMetacraftInternals } from 'utils/types';
import { type CommandModule } from 'yargs';

const module: CommandModule<object, RootOptions & PackOptions> = {
	command: '$0',
	aliases: ['dev'],
	describe: 'Launch development server(s)',
	builder: (yargs) => yargs.default('p', 3000),
	handler: async (args) => {
		await loadEnvironments(
			args.environment as string,
			args.environmentFile as string,
		);

		const internal = await extractInternals();
		const { logger } = internal.modules;
		const parsedConfigs = parseConfigs(internal.configs, args);
		const parsedInternals: ParsedMetacraftInternals = {
			configs: parsedConfigs,
			modules: internal.modules,
		};
		const { nodeEntry, webEntry, serverEntry } = await guessEntries(logger);

		await launchNodeIfPossible({
			entry: nodeEntry,
			logger,
			internal: parsedInternals,
		});

		await launchWebIfPossible({
			entry: webEntry,
			logger,
			internal: parsedInternals,
		});

		await launchServerIfPossible({
			entry: serverEntry,
			logger,
			internal: parsedInternals,
		});
	},
};

export default module;

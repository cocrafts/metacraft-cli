import { type CommandModule } from 'yargs';

const module: CommandModule = {
	command: '$0',
	aliases: ['dev'],
	describe: 'Launch development server(s)',
	builder: (yargs) => yargs.default('p', 2000),
	handler: async () => {
		console.log('hmm, this is default command');
	},
};

export default module;

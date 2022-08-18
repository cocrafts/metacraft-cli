import runBundle from 'commands/bundle';
import runCommand from 'commands/run';
import { options } from 'utils/configs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

export const cliInstance = yargs(hideBin(process.argv));

[runCommand, runBundle].forEach((options) => {
	cliInstance.command(options);
});

cliInstance
	.options(options)
	.alias('h', 'help')
	.alias('v', 'version')
	.demandCommand(1, 'You need at least one command')
	.help()
	.parse();

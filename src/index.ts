import bundleCmd from 'commands/bundle';
import runCmd from 'commands/run';
import vaultCmd from 'commands/vault';
import { rootOptions } from 'utils/configs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

export const cliInstance = yargs(hideBin(process.argv));

[runCmd, bundleCmd, vaultCmd].forEach((options) => {
	cliInstance.command(options);
});

cliInstance
	.options(rootOptions)
	.alias('h', 'help')
	.alias('v', 'version')
	.demandCommand(1, 'You need at least one command')
	.help()
	.parse();

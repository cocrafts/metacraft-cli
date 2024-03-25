import type { MetacraftLogger, ParsedConfigs } from 'utils/types';

export const defaultLogger = (chalk: any): MetacraftLogger => {
	const { gray, red, green, blue, yellow, magenta } = chalk;

	const mark = '｢metacraft｣';
	const serverAddress = (configs: ParsedConfigs) =>
		blue(`http://${configs.host}:${configs.serverPort}`);
	const browserAddress = (configs: ParsedConfigs) =>
		blue(`http://${configs.host}:${configs.port}`);

	return {
		greeting: (version) =>
			console.log(magenta(`${mark} cli, version ${version}`)),
		noEntry: (allEntries) => {
			console.log(
				red('No entry found! ') +
					'you need at least one entry on the following list:\n' +
					gray(allEntries),
			);
		},
		nodeDetected: (entry) => {
			console.log(blue('Detected ') + yellow(entry) + gray('..'));
		},
		launchNodeFailure: (entry: string) => {
			console.log(gray(mark) + red(' error launching ') + green(entry));
		},
		devDetected: (entry: string) => {
			console.log(
				blue(' • Browser entry ') + yellow(entry) + gray(' detected..'),
			);
		},
		launchDevServer: (configs) => {
			console.log(gray(' • launched ') + browserAddress(configs));
		},
		serverDetected: (entry: string) => {
			console.log(
				blue(' • Server entry ') + yellow(entry) + gray(' detected..'),
			);
		},
		launchServer: (configs) => {
			console.log(gray(' • launched ') + serverAddress(configs));
		},
		launchServerFailure: (entry: string) => {
			console.log(gray(mark) + red(' error launching server ') + green(entry));
		},
		listeningForChanges: () => {
			console.log(blue(' • ') + gray('listening for file changes...'));
		},
		bundleComplete: () => {
			console.log(magenta(' • ') + green('bundle complete.'));
		},
	};
};

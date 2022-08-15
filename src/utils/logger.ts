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
					gray('[') +
					green(allEntries) +
					gray(']'),
			);
		},
		nodeDetected: (entry) => {
			console.log(
				blue(' • Node.js entry ') + yellow(entry) + gray(' detected..'),
			);
		},
		launchNodeServer: (configs) => {
			console.log(gray(' • launched ') + serverAddress(configs));
		},
		launchNodeFailure: (entry: string) => {
			console.log(gray(mark) + red(' error launching server ') + green(entry));
		},
		devDetected: (entry: string) => {
			console.log(
				blue(' • Browser entry ') + yellow(entry) + gray(' detected..'),
			);
		},
		launchDevServer: (configs) => {
			console.log(gray(' • launched ') + browserAddress(configs));
		},
		listeningForChanges: () => {
			console.log(blue(' • ') + gray('listening for file changes...'));
		},
	};
};

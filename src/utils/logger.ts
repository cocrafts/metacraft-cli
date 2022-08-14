import type { MetacraftLogger, ParsedConfigs } from 'utils/types';

export const defaultLogger = (chalk: any): MetacraftLogger => {
	const { gray, red, green, blue, yellow, magenta } = chalk;

	const mark = '｢metacraft｣';
	const serverAddress = (configs: ParsedConfigs) =>
		blue(`http://${configs.host}:${configs.serverPort}`);

	return {
		greeting: (version) =>
			console.log(gray(`${mark} cli`), magenta(`@${version}`)),
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
				gray(mark) +
					gray(' • ') +
					yellow('node entry ') +
					green(entry) +
					gray(' detected'),
			);
		},
		launchNodeServer: (configs) => {
			console.log(
				gray('          • ') + yellow('launching ') + serverAddress(configs),
			);
		},
		launchNodeFailure: (entry: string) => {
			console.log(gray(mark) + red(' error launching server ') + green(entry));
		},
	};
};

import { MetacraftInternals, ParsedConfigs } from 'utils/types';

export const generateProgressPlugin = (
	{ modules }: MetacraftInternals,
	{ isProduction }: ParsedConfigs,
) => {
	let brightFlag = false;
	let initialBuild = true;
	const { ProgressBarPlugin, chalk } = modules;
	const { gray, blue } = chalk;

	return new ProgressBarPlugin({
		width: 18,
		complete: '#',
		incomplete: gray('#'),
		format: `${blue(' • ')}[:bar] ${gray('(:elapsed seconds)')}`,
		summary: false,
		customSummary: (time) => {
			const buildTime = `${time.substring(0, time.length - 1)}${gray('s')}`;
			const alternatedColor = brightFlag ? (x) => x : gray;
			const buildType = initialBuild ? 'initial build' : 'hot module update';
			const buildFlag = isProduction ? 'production bundle' : buildType;

			console.log(alternatedColor(' •'), gray(`${buildFlag}`), buildTime);

			brightFlag = !brightFlag;
			initialBuild = false;
		},
	});
};

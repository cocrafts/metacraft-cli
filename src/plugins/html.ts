import { ParsedConfigs, ParsedMetacraftInternals } from 'utils/types';

export const generateHtmlPlugin = (
	{ modules }: ParsedMetacraftInternals,
	parsedConfigs: ParsedConfigs,
) => {
	const { HtmlPlugin } = modules;
	const pageTitle = 'Metacraft';
	const params = {
		title: pageTitle,
		...parsedConfigs,
		...parsedConfigs.templateParameters,
		get: (key: string) => {
			if (key === 'title') return pageTitle;

			return parsedConfigs[key] || parsedConfigs?.templateParameters[key];
		},
	};

	return new HtmlPlugin({
		template: parsedConfigs.htmlTemplate,
		templateParameters: params,
		filename: 'index.html',
		...parsedConfigs.htmlPluginOptions,
	});
};

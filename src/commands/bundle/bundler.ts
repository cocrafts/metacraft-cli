import { Configuration } from 'webpack';
import { bareWebpackMiddleware as bare } from 'middlewares/webpack';
import { combineMiddlewares } from 'utils/middleware';
import {
	MetacraftInternals,
	MetacraftLogger,
	ParsedConfigs,
	WebpackMiddleware,
} from 'utils/types';

interface BundleArgs {
	entry: string;
	logger?: MetacraftLogger;
	internal: MetacraftInternals;
	parsedConfigs?: ParsedConfigs;
}

export const generateBundle = async ({
	entry,
	logger,
	internal,
	parsedConfigs,
}: BundleArgs): Promise<void> => {
	if (!entry) return;
	const { webpackMiddlewares } = internal.configs;
	const { webpack } = internal.modules;
	const middlewares: WebpackMiddleware[] = [bare, ...webpackMiddlewares];
	const config: Configuration = await combineMiddlewares<
		WebpackMiddleware,
		Configuration
	>({ internal, middlewares });
	const compiler = webpack(config);

	compiler.run((err) => {
		if (err) {
			console.log(err);
		} else {
			logger.bundleComplete(parsedConfigs);
		}
	});
};

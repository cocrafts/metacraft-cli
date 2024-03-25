import { Configuration as WebpackConfig } from 'webpack';
import { Configuration as DevConfig } from 'webpack-dev-server';
import {
	DevMiddleware,
	ParsedMetacraftInternals,
	WebpackMiddleware,
} from 'utils/types';

type CombineArgs<T> = {
	internal: ParsedMetacraftInternals;
	middlewares: T[];
};

export const combineMiddlewares = async <
	M extends WebpackMiddleware | DevMiddleware,
	C extends WebpackConfig | DevConfig,
>({
	internal,
	middlewares,
}: CombineArgs<M>): Promise<C> => {
	let config: C = {} as never;

	for (let i = 0; i < middlewares.length; i += 1) {
		const middleware = middlewares[i];
		const nextConfig = await middleware(config, internal);

		if (nextConfig) {
			config = nextConfig;
		} else {
			continue;
		}
	}

	return config;
};

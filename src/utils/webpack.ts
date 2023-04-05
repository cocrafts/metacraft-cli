import { RuleSetRule } from 'webpack';
import { Options as SwcOptions } from '@swc/core';
import { merge } from 'lodash';

import { crossResolve } from './modules';
import { ParsedConfigs } from './types';

export const getJsRule = async (
	parsedConfigs: ParsedConfigs,
): Promise<RuleSetRule> => {
	const { useBabel } = parsedConfigs;

	if (useBabel) {
		return getBabelLoader(parsedConfigs);
	} else {
		return getSwcRule(parsedConfigs);
	}
};

export const getSwcRule = async ({
	isProduction,
	swcOptions,
	useReact,
}: ParsedConfigs): Promise<RuleSetRule> => {
	const options: SwcOptions = {
		jsc: {
			parser: {
				syntax: 'typescript',
				tsx: true,
				dynamicImport: true,
			},
			transform: {},
		},
	};

	if (useReact) {
		options.jsc.transform.react = {
			runtime: 'automatic',
			development: !isProduction,
			refresh: !isProduction,
		};
	}

	return {
		test: /\.(ts|js)x?$/,
		loader: 'swc-loader',
		options: merge(options, swcOptions),
	};
};

export const getBabelLoader = async ({
	isProduction,
	useReact,
}: ParsedConfigs): Promise<RuleSetRule> => {
	const plugins = [];
	const rRefreshUri = await crossResolve('node_modules/react-refresh/babel.js');

	if (useReact && !isProduction) {
		plugins.push(rRefreshUri);
	}

	return {
		test: /\.(ts|js)x?$/,
		loader: 'babel-loader',
		options: {
			compact: false,
			cacheDirectory: true,
			plugins,
		},
	};
};

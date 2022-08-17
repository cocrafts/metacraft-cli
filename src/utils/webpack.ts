import { Options as SwcOptions } from '@swc/core';
import { merge } from 'lodash';
import { RuleSetRule } from 'webpack';

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
}: ParsedConfigs): Promise<RuleSetRule> => {
	const reactAvailable = await crossResolve('node_modules/react');

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

	if (!isProduction && reactAvailable) {
		options.jsc.transform.react = {
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
}: ParsedConfigs): Promise<RuleSetRule> => {
	const plugins = [];
	const reactAvailable = await crossResolve('node_modules/react');
	const rRefreshUri = await crossResolve('node_modules/react-refresh/babel.js');

	if (!isProduction && reactAvailable) {
		plugins.push(rRefreshUri);
	}

	return {
		test: /\.(ts|js)x?$/,
		loader: 'babel-loader',
		options: {
			plugins,
		},
	};
};

import type { RuleSetRule } from 'webpack';
import type { Options as SwcOptions } from '@swc/core';
import type { EsbuildPluginOptions } from 'esbuild-loader';
import { merge } from 'lodash';

import { crossResolve } from './modules';
import type { ParsedConfigs } from './types';

export const getJsRule = async (
	parsedConfigs: ParsedConfigs,
): Promise<RuleSetRule> => {
	const { compiler } = parsedConfigs;

	switch (compiler) {
		case 'esbuild':
			return getEsBuildRule(parsedConfigs);
		case 'swc':
			return getSwcRule(parsedConfigs);
		default:
			return getBabelRule(parsedConfigs);
	}
};

export const getEsBuildRule = async ({
	isProduction,
	esBuildOptions,
	useReact,
}: ParsedConfigs): Promise<RuleSetRule> => {
	const options: EsbuildPluginOptions = {
		loader: 'ts',
		minify: isProduction,
		target: ['es2022'],
	};

	if (useReact) {
		options.loader = 'tsx';
		options.jsx = 'automatic';
	}

	return {
		test: /\.(ts|js)x?$/,
		loader: 'esbuild-loader',
		options: merge(options, esBuildOptions),
	};
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

export const getBabelRule = async ({
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

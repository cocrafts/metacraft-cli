import { promises as fs } from 'fs';

import { Configuration } from 'webpack';
import { build, BuildResult, PluginBuild } from 'esbuild';
import { bareWebpackMiddleware as bare } from 'middlewares/webpack';
import { combineMiddlewares } from 'utils/middleware';
import { isPackageDeclared } from 'utils/modules';
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

export const bundleWebBuild = async ({
	entry,
	logger,
	internal,
	parsedConfigs,
}: BundleArgs): Promise<void> => {
	if (!entry) return;

	const { webpackMiddlewares } = internal.configs;
	const { webpack } = internal.modules;
	const middlewares: WebpackMiddleware[] = [bare, ...webpackMiddlewares];

	const parsedInternal = { configs: parsedConfigs, modules: internal.modules };
	const config: Configuration = await combineMiddlewares<
		WebpackMiddleware,
		Configuration
	>({ internal: parsedInternal, middlewares });
	const compiler = webpack(config);

	compiler.run((err: Error) => {
		if (err) {
			console.log(err);
		} else {
			logger.bundleComplete(parsedConfigs);
		}
	});
};

const prependScript = `require('dotenv').config();\n`;
const appendScript = (port: string | number) => `
if (configure) {
	const port = process.env.PORT || ${port};
	const express = require('express')();
	const configured = configure();

	if (configured && configured.then) {
		configured.then((app) => app.listen(port));
	} else {
		app.listen(port);
	}
}`;

const injectCodePlugin = (prepend: string, append: string) => ({
	name: 'prepend-code',
	setup(build: PluginBuild) {
		build.onEnd(async (result: BuildResult) => {
			if (result.errors.length === 0) {
				const isDotenvAvailable = await isPackageDeclared('dotenv');
				const outputPath = build.initialOptions.outfile;
				const originalBundle = await fs.readFile(outputPath, 'utf8');

				if (isDotenvAvailable) {
					await fs.writeFile(
						outputPath,
						`${prepend}\n${originalBundle}${append}`,
					);
				} else {
					await fs.writeFile(outputPath, originalBundle);
				}
			}
		});
	},
});

export const bundleNodeBuild = async ({
	entry,
	parsedConfigs,
}: BundleArgs): Promise<void> => {
	if (!entry) return;

	try {
		await build({
			entryPoints: [entry],
			bundle: true,
			platform: 'node',
			packages: 'external',
			outfile: `metacraft/${entry.replace('.ts', '.js')}`,
			plugins: [
				injectCodePlugin(prependScript, appendScript(parsedConfigs.port)),
			],
		});
	} catch (e) {
		console.log('Node build failed', e);
	}
};

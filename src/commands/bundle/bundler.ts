import { promises as fs } from 'fs';
import { join } from 'path';

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

const injectCodePlugin = (prepend: string) => ({
	name: 'prepend-code',
	setup(build: PluginBuild) {
		build.onEnd(async (result: BuildResult) => {
			if (result.errors.length === 0) {
				const isDotenvAvailable = await isPackageDeclared('dotenv');
				const outputPath = build.initialOptions.outfile;
				const originalBundle = await fs.readFile(outputPath, 'utf8');

				if (isDotenvAvailable) {
					await fs.writeFile(outputPath, `${prepend}\n${originalBundle}`);
				} else {
					await fs.writeFile(outputPath, originalBundle);
				}
			}
		});
	},
});

const entryScript = (
	entry: string,
	port: string | number,
) => `import express from 'express';
import * as entry from '../${entry}';

const configurator = entry.configureExpress || entry.configure;

if (configurator) {
	const port = process.env.PORT || ${port};
	configurator(express).then((app) => {
		app.listen(port, () => entry.onLaunchCompleted?.(port));
	});
}
`;

export const bundleNodeBuild = async ({
	entry,
	parsedConfigs,
}: BundleArgs): Promise<void> => {
	if (!entry) return;
	const [entryName] = entry.split('.');
	const injectedEntry = 'metacraft/___injectedBuildEntry.ts';

	await fs.mkdir(join(process.cwd(), 'metacraft'), { recursive: true });
	await fs.writeFile(
		injectedEntry,
		entryScript(entryName, parsedConfigs.serverPort),
	);

	try {
		await build({
			entryPoints: [injectedEntry],
			bundle: true,
			platform: 'node',
			packages: 'external',
			outfile: `metacraft/${entry.replace('.ts', '.js')}`,
			plugins: [injectCodePlugin(prependScript)],
			logOverride: {
				'import-is-undefined': 'silent',
			},
		});
	} catch (e) {
		console.log('Node build failed', e);
	} finally {
		fs.unlink(injectedEntry);
	}
};

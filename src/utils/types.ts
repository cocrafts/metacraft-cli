import type { Configuration, StatsOptions } from 'webpack';
import type { Configuration as DevConfiguration } from 'webpack-dev-server';
import { Options as SwcOptions } from '@swc/core';
import { EsbuildPluginOptions as EsBuildOptions } from 'esbuild-loader';
import type { Express } from 'express';

export interface ModuleAlias {
	global: Record<string, string>;
	web: Record<string, string>;
	node: Record<string, string>;
}

export type WebpackMiddleware = (
	configs: Configuration,
	internal: ParsedMetacraftInternals,
) => Promise<Configuration>;
export type DevMiddleware = (
	configs: DevConfiguration,
	internal: ParsedMetacraftInternals,
) => Promise<DevConfiguration>;

export interface HotOptions {
	reload: boolean;
	quiet: boolean;
	path: string;
	dynamicPublicPath: boolean;
}

interface CommonConfigs {
	webpackMiddlewares?: WebpackMiddleware[];
	devMiddlewares?: DevMiddleware[];
	hotOptions?: HotOptions;
	htmlTemplate?: string;
	templateParameters?: Record<string, any>;
	htmlPluginOptions?: Record<string, any>;
	moduleAlias?: ModuleAlias;
	resolves?: Record<string, string>;
	buildId?: () => string;
	useBabel?: boolean;
	compiler?: 'babel' | 'swc' | 'esbuild';
	useReact?: boolean;
	withProgress?: boolean;
}

export type MetacraftConfigs = CommonConfigs & {
	env?: () => string;
	isProduction?: (env: string) => boolean;
	publicPath?: (isProd: boolean, env: string) => string;
	staticPath?: (isProd: boolean, env: string) => string;
	host?: (cliDefault: string) => string;
	port?: (cliDefault: string) => string | number;
	serverPort?: (cliDefault: string) => string | number;
	stats?: (isProd: boolean, env: string) => StatsOptions;
	esBuildOptions?: (isProd: boolean, env: string) => EsBuildOptions;
	swcOptions?: (isProd: boolean, env: string) => SwcOptions;
	keepPreviousBuild?: (isProd: boolean) => boolean;
	buildCleanUp?: (idProd: boolean, env: string) => void;
};

export type ParsedConfigs = CommonConfigs & {
	env: string;
	isProduction: boolean;
	publicPath: string;
	staticPath: string;
	host: string;
	port: string | number;
	serverPort: string | number;
	stats: StatsOptions;
	esBuildOptions: EsBuildOptions;
	swcOptions: SwcOptions;
	keepPreviousBuild: boolean;
};

export interface MetacraftLogger {
	greeting: (version: string) => void;
	noEntry: (availableEntries: string) => void;
	nodeDetected: (entry: string, configs: ParsedConfigs) => void;
	launchNodeFailure: (entry: string, configs: ParsedConfigs) => void;
	devDetected: (entry: string, configs: ParsedConfigs) => void;
	launchDevServer: (configs: ParsedConfigs) => void;
	serverDetected: (entry: string, configs: ParsedConfigs) => void;
	launchServer: (configs: ParsedConfigs) => void;
	launchServerFailure: (entry: string, configs: ParsedConfigs) => void;
	listeningForChanges: (configs: ParsedConfigs) => void;
	bundleComplete: (configs: ParsedConfigs) => void;
}

export interface MetacraftModules {
	chalk?: any;
	webpack?: any;
	express?: Express;
	ProgressBarPlugin?: any;
	HtmlPlugin?: any;
	TerserPlugin?: any;
	CssExtractPlugin?: any;
	TsconfigPathsPlugin?: any;
	ReactRefreshPlugin?: any;
	DevServer?: any;
	logger?: MetacraftLogger;
}

export interface MetacraftInternals {
	configs: MetacraftConfigs;
	modules: MetacraftModules;
}

export interface ParsedMetacraftInternals {
	configs: ParsedConfigs;
	modules: MetacraftModules;
}

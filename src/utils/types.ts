import { Options as SwcOptions } from '@swc/core';
import type { Express } from 'express';
import type { Configuration, StatsOptions } from 'webpack';
import type { Configuration as DevConfiguration } from 'webpack-dev-server';

export interface ModuleAlias {
	global: Record<string, string>;
	web: Record<string, string>;
	node: Record<string, string>;
}

export type WebpackMiddleware = (
	configs: Configuration,
	internal: MetacraftInternals,
) => Promise<Configuration>;
export type DevMiddleware = (
	configs: DevConfiguration,
	internal: MetacraftInternals,
) => Promise<DevConfiguration>;

export interface HotOptions {
	reload: boolean;
	quiet: boolean;
	path: string;
	dynamicPublicPath: boolean;
}

export interface MetacraftConfigs {
	env?: () => string;
	isProduction?: (env: string) => boolean;
	publicPath?: (isProd: boolean, env: string) => string;
	staticPath?: (isProd: boolean, env: string) => string;
	host?: (cliDefault: string) => string;
	port?: (cliDefault: string) => string | number;
	serverPort?: (cliDefault: string) => string | number;
	stats?: (isProd: boolean, env: string) => StatsOptions;
	swcOptions?: (isProd: boolean, env: string) => SwcOptions;
	keepPreviousBuild?: (isProd: boolean) => boolean;
	buildCleanUp?: (idProd: boolean, env: string) => void;
	buildId?: () => string;
	webpackMiddlewares?: WebpackMiddleware[];
	devMiddlewares?: DevMiddleware[];
	hotOptions?: HotOptions;
	htmlTemplate?: string;
	templateParameters?: Record<string, any>;
	moduleAlias?: ModuleAlias;
	resolves?: Record<string, string>;
}

export interface ParsedConfigs {
	env: string;
	isProduction: boolean;
	publicPath: string;
	staticPath: string;
	host: string;
	port: string | number;
	serverPort: string | number;
	stats: StatsOptions;
	swcOptions: SwcOptions;
	keepPreviousBuild: boolean;
}

export interface MetacraftLogger {
	greeting: (version: string) => void;
	noEntry: (availableEntries: string) => void;
	nodeDetected: (entry: string, configs: ParsedConfigs) => void;
	launchNodeServer: (configs: ParsedConfigs) => void;
	launchNodeFailure: (entry: string, configs: ParsedConfigs) => void;
	devDetected: (entry: string, configs: ParsedConfigs) => void;
	launchDevServer: (configs: ParsedConfigs) => void;
	listeningForChanges: () => void;
}

export interface MetacraftModules {
	chalk?: any;
	webpack?: any;
	express?: Express;
	ProgressBarPlugin?: any;
	HtmlPlugin?: any;
	CssExtractPlugin?: any;
	DevServer?: any;
	logger?: MetacraftLogger;
}

export interface MetacraftInternals {
	configs: MetacraftConfigs;
	modules: MetacraftModules;
}

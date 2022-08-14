import type { Express } from 'express';
import type { Configuration, WebpackPluginFunction } from 'webpack';

export interface ModuleAlias {
	global: Record<string, string>;
	web: Record<string, string>;
	node: Record<string, string>;
}

type WebpackMiddleware = (configs: Configuration) => Configuration;
type DevMiddleware = (configs: never) => never;

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
	optimizeMode?: (env: string) => boolean;
	keepPreviousBuild?: (isProd: boolean) => boolean;
	buildCleanUp?: (idProd: boolean) => void;
	buildId?: () => string;
	webpackMiddlewares?: WebpackMiddleware[];
	devMiddlewares?: DevMiddleware[];
	hotOptions?: HotOptions;
	htmlTemplate?: string;
	htmlOptions?: Record<string, never>;
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
	optimizeMode: boolean;
	keepPreviousBuild: boolean;
}

export interface MetacraftLogger {
	greeting: (version: string) => void;
	noEntry: (availableEntries: string) => void;
	nodeDetected: (entry: string, configs: ParsedConfigs) => void;
	launchNodeServer: (configs: ParsedConfigs) => void;
	launchNodeFailure: (entry: string, configs: ParsedConfigs) => void;
}

export interface MetacraftModules {
	chalk?: any;
	webpack?: WebpackPluginFunction;
	express?: Express;
	ProgressBarPlugin?: never;
	HtmlPlugin?: never;
	DevServer?: never;
	logger?: MetacraftLogger;
}

export interface MetacraftInternals {
	configs: MetacraftConfigs;
	modules: MetacraftModules;
}

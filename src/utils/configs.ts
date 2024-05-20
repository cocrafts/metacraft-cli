import { type Options } from 'yargs';

export type RootOptions = {
	port?: number;
	host?: string;
	devOnly?: boolean;
	environment?: string;
	environmentFile?: string;
};

export const rootOptions: Record<string, Options> = {
	environment: {
		description: 'Environment possible values: [development | production]',
		alias: ['e'],
		type: 'string',
		default: 'development',
	},
	environmentFile: {
		description: 'Clarify .env file instead of calculate from environment',
		/* TODO: deprecate ef and envFile once the migration is done */
		alias: ['ef', 'envFile'],
		type: 'string',
	},
};

export type PackOptions = {
	port?: number;
	serverPort?: number;
	host?: string;
	devOnly?: boolean;
};

export const runOptions: Record<keyof PackOptions, Options> = {
	port: {
		description: 'Development server port',
		alias: 'p',
		type: 'number',
		default: 3000,
	},
	serverPort: {
		description: 'Node.js (api) server port',
		alias: 's',
		type: 'number',
		default: 3005,
	},
	host: {
		description: 'Ip address of launched servers',
		alias: ['i'],
		type: 'string',
	},
	devOnly: {
		description: 'Prevent api/ssr from launching',
		alias: 'd',
		type: 'boolean',
	},
};

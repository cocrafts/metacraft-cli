import { type Options } from 'yargs';

export const options: Record<string, Options> = {
	p: {
		description: 'Development server port',
		alias: 'port',
		type: 'number',
		default: 3000,
	},
	s: {
		description: 'Node.js (api) server port',
		alias: 'serverPort',
		type: 'number',
		default: 3005,
	},
	i: {
		description: 'Ip address of launched servers',
		alias: 'host',
		type: 'string',
	},
	d: {
		description: 'Prevent api/ssr from launching',
		alias: 'devOnly',
		type: 'boolean',
	},
	ef: {
		description:
			"Force load env file, by default we use '.env.development' for run, and '.env.production' for build",
		alias: 'envFile',
		type: 'string',
	},
};

export type MetacraftOptions = {
	port?: number;
	host?: string;
	devOnly?: boolean;
	envFile?: string;
};

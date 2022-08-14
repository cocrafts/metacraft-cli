const swcConfig = {
	module: {
		type: 'commonjs',
	},
};

module.exports = {
	transform: {
		'^.+\\.(t|j)sx?$': ['@swc/jest', swcConfig],
	},
	moduleNameMapper: {
		'^commands(.*)$': '<rootDir>/src/commands$1',
		'^middlewares(.*)$': '<rootDir>/src/middlewares$1',
		'^utils(.*)$': '<rootDir>/src/utils$1',
	},
};

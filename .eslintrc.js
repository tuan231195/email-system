const path = require('path');

module.exports = {
	extends: ['@vdtn359/eslint-config'],
	parserOptions: {
		project: path.resolve(__dirname, 'tsconfig.json'),
	},
	ignorePatterns: ['!.*', 'dist', 'node_modules'],
	rules: {
		'@typescript-eslint/no-explicit-any': 0,
		'no-restricted-syntax': ['error', 'ForInStatement', 'LabeledStatement', 'WithStatement'],
	},
};

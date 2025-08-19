/**
 * Internal dependencies
 */
const path = require('path');
const { webpackConfig } = require('@woocommerce/internal-style-build');

/**
 * External dependencies
 */
const path = require( 'path' );

const NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {
	mode: NODE_ENV,
	cache: ( NODE_ENV !== 'development' && { type: 'memory' } ) || {
		type: 'filesystem',
		cacheDirectory: path.resolve(
			__dirname,
			'node_modules/.cache/webpack'
		),
	},
	entry: {
		'build-style': path.resolve(__dirname, 'src/style.scss'),
	},
	output: {
		path: __dirname,
	},
	module: {
		rules: webpackConfig.rules,
		parser: webpackConfig.parser,
	},
	plugins: webpackConfig.plugins,
};

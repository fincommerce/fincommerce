/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { presetValues, periods } from '@woocommerce/date';

/**
 * Internal dependencies
 */
import { ReportQueryArg } from './types';

export const periodArg: ReportQueryArg = {
	required: true,
	type: 'string',
	description: __( 'Select the period to display data for.', 'woocommerce' ),
	options: presetValues.map( ( p ) => ( {
		value: p.value,
		label: p.label,
	} ) ),
};

export const compareArg: ReportQueryArg = {
	required: true, // not really required, but otherwise the period query arg doesn't work, so let's pretend until we fix it in WooCommerce.
	type: 'string',
	description: __(
		'Compare the current period to a previous period or the same period last year.',
		'woocommerce'
	),
	options: periods.map( ( p ) => ( { value: p.value, label: p.label } ) ),
};

export const intervalArg: ReportQueryArg = {
	required: false,
	type: 'string',
	description: __(
		'Time interval to use for bucketing data in charts.',
		'woocommerce'
	),
	options: [
		{ value: 'day', label: __( 'Day', 'woocommerce' ) },
		{ value: 'week', label: __( 'Week', 'woocommerce' ) },
		{ value: 'month', label: __( 'Month', 'woocommerce' ) },
		{ value: 'quarter', label: __( 'Quarter', 'woocommerce' ) },
		{ value: 'year', label: __( 'Year', 'woocommerce' ) },
	],
};

export const afterArg: ReportQueryArg = {
	required: false,
	type: 'string',
	format: 'YYYY-MM-DD',
	description: __(
		'Start date for a custom period (YYYY-MM-DD).',
		'woocommerce'
	),
};

export const beforeArg: ReportQueryArg = {
	required: false,
	type: 'string',
	format: 'YYYY-MM-DD',
	description: __(
		'End date for a custom period (YYYY-MM-DD).',
		'woocommerce'
	),
};

export const orderArg: ReportQueryArg = {
	required: false,
	type: 'string',
	options: [
		{ value: 'asc', label: __( 'Ascending', 'woocommerce' ) },
		{ value: 'desc', label: __( 'Descending', 'woocommerce' ) },
	],
	description: __(
		'Order of results (ascending or descending).',
		'woocommerce'
	),
};

export const orderbyArg: ReportQueryArg = {
	required: false,
	type: 'string',
	description: __( 'Field to order results by.', 'woocommerce' ),
	options: [], // Populated by report-specific definitions
};

export const pageArg: ReportQueryArg = {
	required: false,
	type: 'number',
	description: __( 'Page number for paginated results.', 'woocommerce' ),
};

export const perPageArg: ReportQueryArg = {
	required: false,
	type: 'number',
	description: __(
		'Number of items per page for paginated results.',
		'woocommerce'
	),
};

export const searchArg: ReportQueryArg = {
	required: false,
	type: 'string',
	description: __( 'Search term to filter results.', 'woocommerce' ),
};

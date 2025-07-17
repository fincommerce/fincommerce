/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { getResourceName } from '../utils';
import {
	ReportState,
	ReportItemsEndpoint,
	ReportStatEndpoint,
	ReportQueryParams,
	ReportStatQueryParams,
	ReportItemObjectInfer,
	ReportStatObjectInfer,
} from './types';
import {
	ReportDefinition,
	ReportSpecificConfig,
} from '../report-definitions/types';
import * as commonArgs from '../report-definitions/common-query-args';

const EMPTY_OBJECT = {} as const;

export const getReportItemsError = (
	state: ReportState,
	endpoint: ReportItemsEndpoint,
	query: ReportQueryParams
) => {
	const resourceName = getResourceName( endpoint, query );
	return state.itemErrors[ resourceName ] || false;
};

export const getReportItems = < T >(
	state: ReportState,
	endpoint: ReportItemsEndpoint,
	query: ReportQueryParams
): ReportItemObjectInfer< T > => {
	const resourceName = getResourceName( endpoint, query );
	return (
		( state.items[ resourceName ] as ReportItemObjectInfer< T > ) ||
		EMPTY_OBJECT
	);
};

export const getReportStats = < T >(
	state: ReportState,
	endpoint: ReportStatEndpoint,
	query: ReportStatQueryParams
): ReportStatObjectInfer< T > => {
	const resourceName = getResourceName( endpoint, query );
	return (
		( state.stats[ resourceName ] as ReportStatObjectInfer< T > ) ||
		EMPTY_OBJECT
	);
};

export const getReportStatsError = (
	state: ReportState,
	endpoint: ReportStatEndpoint,
	query: ReportStatQueryParams
) => {
	const resourceName = getResourceName( endpoint, query );
	return state.statErrors[ resourceName ] || false;
};

/**
 * Get the report config for a given report slug.
 *
 * @param state      - The report state.
 * @param reportSlug - The slug of the report to get the config for.
 * @return The report config for the given report slug.
 */
export const getReportConfig = (
	state: ReportState,
	reportSlug: string
): ReportSpecificConfig | undefined => {
	return state.config && state.config[ reportSlug ];
};

/**
 * Build the report config for a given report slug.
 * It merges the common query args with the report-specific ones coming from the config files.
 *
 * @param state      - The report state.
 * @param reportSlug - The slug of the report to build the config for.
 * @return The report config for the given report slug.
 */
const buildReportConfig = (
	state: ReportState,
	reportSlug: string
): ReportDefinition | undefined => {
	const config = getReportConfig( state, reportSlug );

	if ( ! config ) {
		return undefined;
	}

	const queryArgs: ReportDefinition[ 'queryArgs' ] = {
		period: commonArgs.periodArg,
		compare: commonArgs.compareArg,
		after: commonArgs.afterArg,
		before: commonArgs.beforeArg,
		interval: commonArgs.intervalArg,
		page: commonArgs.pageArg,
		per_page: commonArgs.perPageArg,
		order: commonArgs.orderArg,
		orderby: {
			...commonArgs.orderbyArg,
			options:
				config.charts?.map( ( c ) => ( {
					value: c.orderby || c.key,
					label: c.label,
				} ) ) || [],
		},
		search: commonArgs.searchArg,
	};

	if ( config.charts ) {
		queryArgs.chart = {
			required: true, // Or based on behavior
			type: 'string',
			description: __(
				'Select the chart to display for this report.',
				'woocommerce'
			),
			options: config.charts.map( ( c ) => ( {
				value: c.key,
				label: c.label,
			} ) ),
		};
	}

	const reportTitle =
		config.title ||
		reportSlug.charAt( 0 ).toUpperCase() + reportSlug.slice( 1 );

	return {
		report: reportSlug,
		title: reportTitle,
		path: `/wp-admin/admin.php?page=wc-admin&path=%2Fanalytics%2F${ reportSlug }`,
		queryArgs,
	};
};

/**
 * Get all the reports.
 *
 * @param state - The report state.
 * @return All the reports.
 */
export const getAllReports = ( state: ReportState ): ReportDefinition[] => {
	if ( ! state.config ) {
		return [];
	}
	const reportSlugs = Object.keys( state.config );
	return reportSlugs
		.map( ( slug ) => buildReportConfig( state, slug ) )
		.filter( ( def ): def is ReportDefinition => def !== undefined );
};

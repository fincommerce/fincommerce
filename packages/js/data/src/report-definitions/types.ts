export interface ReportQueryArgOption {
	value: string;
	label: string;
}

export interface ReportQueryArg {
	required?: boolean;
	description?: string;
	type: 'string' | 'array' | 'boolean' | 'number';
	format?: 'YYYY-MM-DD' | string;
	options?: ReportQueryArgOption[] | string[];
}

export interface ReportDefinition {
	report: string;
	title: string;
	path: string;
	queryArgs: {
		[ key: string ]: ReportQueryArg;
	};
}

export interface ReportSpecificConfig {
	title?: string;
	charts?: Array< {
		key: string;
		label: string;
		order?: string;
		orderby?: string;
		type?: string;
		[ key: string ]: unknown;
	} >;
	advancedFilters?: {
		filters: object;
		title: string;
		[ key: string ]: unknown;
	};
	filters?: Array< {
		label: string;
		param: string;
		[ key: string ]: unknown;
	} >;
}

export type ReportConfigs = {
	[ reportSlug: string ]: ReportSpecificConfig;
};

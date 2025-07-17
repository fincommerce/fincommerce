/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import { lazy } from '@wordpress/element';
import { dispatch } from '@wordpress/data';
import { REPORTS_STORE_NAME } from '@woocommerce/data';

/**
 * Internal dependencies
 */
import { getAdminSetting } from '~/utils/admin-settings';
import {
	charts as revenueCharts,
	advancedFilters as revenueAdvancedFilters,
	filters as revenueFilters,
} from './revenue/config';
import {
	charts as productsCharts,
	advancedFilters as productsAdvancedFilters,
	filters as productsFilters,
} from './products/config';
import {
	charts as ordersCharts,
	advancedFilters as ordersAdvancedFilters,
	filters as ordersFilters,
} from './orders/config';
import {
	charts as categoriesCharts,
	advancedFilters as categoriesAdvancedFilters,
	filters as categoriesFilters,
} from './categories/config';
import {
	charts as couponsCharts,
	advancedFilters as couponsAdvancedFilters,
	filters as couponsFilters,
} from './coupons/config';
import {
	charts as taxesCharts,
	advancedFilters as taxesAdvancedFilters,
	filters as taxesFilters,
} from './taxes/config';
import {
	advancedFilters as customersAdvancedFilters,
	filters as customersFilters,
} from './customers/config';
import {
	advancedFilters as downloadsAdvancedFilters,
	filters as downloadsFilters,
} from './downloads/config';
import {
	advancedFilters as stockAdvancedFilters,
	filters as stockFilters,
} from './stock/config';
import {
	charts as variationsCharts,
	advancedFilters as variationsAdvancedFilters,
	filters as variationsFilters,
} from './variations/config';
// TODO: Verify config exports for Variations, Stock, Customers, Downloads
// and import them here if they exist.

// Lazy load components
const RevenueReport = lazy( () =>
	import( /* webpackChunkName: "analytics-report-revenue" */ './revenue' )
);
const ProductsReport = lazy( () =>
	import( /* webpackChunkName: "analytics-report-products" */ './products' )
);
const VariationsReport = lazy( () =>
	import(
		/* webpackChunkName: "analytics-report-variations" */ './variations'
	)
);
const OrdersReport = lazy( () =>
	import( /* webpackChunkName: "analytics-report-orders" */ './orders' )
);
const CategoriesReport = lazy( () =>
	import(
		/* webpackChunkName: "analytics-report-categories" */ './categories'
	)
);
const CouponsReport = lazy( () =>
	import( /* webpackChunkName: "analytics-report-coupons" */ './coupons' )
);
const TaxesReport = lazy( () =>
	import( /* webpackChunkName: "analytics-report-taxes" */ './taxes' )
);
const DownloadsReport = lazy( () =>
	import( /* webpackChunkName: "analytics-report-downloads" */ './downloads' )
);
const StockReport = lazy( () =>
	import( /* webpackChunkName: "analytics-report-stock" */ './stock' )
);
const CustomersReport = lazy( () =>
	import( /* webpackChunkName: "analytics-report-customers" */ './customers' )
);

const manageStock = getAdminSetting( 'manageStock', 'no' );
const REPORTS_FILTER = 'woocommerce_admin_reports_list';

export default () => {
	const reports = [
		{
			report: 'revenue',
			title: __( 'Revenue', 'woocommerce' ),
			component: RevenueReport,
			navArgs: {
				id: 'woocommerce-analytics-revenue',
			},
			config: {
				charts: revenueCharts,
				advancedFilters: revenueAdvancedFilters,
				filters: revenueFilters,
			},
		},
		{
			report: 'products',
			title: __( 'Products', 'woocommerce' ),
			component: ProductsReport,
			navArgs: {
				id: 'woocommerce-analytics-products',
			},
			config: {
				charts: productsCharts,
				advancedFilters: productsAdvancedFilters,
				filters: productsFilters,
			},
		},
		{
			report: 'variations',
			title: __( 'Variations', 'woocommerce' ),
			component: VariationsReport,
			navArgs: {
				id: 'woocommerce-analytics-variations',
			},
			config: {
				charts: variationsCharts,
				advancedFilters: variationsAdvancedFilters,
				filters: variationsFilters,
			},
		},
		{
			report: 'orders',
			title: __( 'Orders', 'woocommerce' ),
			component: OrdersReport,
			navArgs: {
				id: 'woocommerce-analytics-orders',
			},
			config: {
				charts: ordersCharts,
				advancedFilters: ordersAdvancedFilters,
				filters: ordersFilters,
			},
		},
		{
			report: 'categories',
			title: __( 'Categories', 'woocommerce' ),
			component: CategoriesReport,
			navArgs: {
				id: 'woocommerce-analytics-categories',
			},
			config: {
				charts: categoriesCharts,
				advancedFilters: categoriesAdvancedFilters,
				filters: categoriesFilters,
			},
		},
		{
			report: 'coupons',
			title: __( 'Coupons', 'woocommerce' ),
			component: CouponsReport,
			navArgs: {
				id: 'woocommerce-analytics-coupons',
			},
			config: {
				charts: couponsCharts,
				advancedFilters: couponsAdvancedFilters,
				filters: couponsFilters,
			},
		},
		{
			report: 'taxes',
			title: __( 'Taxes', 'woocommerce' ),
			component: TaxesReport,
			navArgs: {
				id: 'woocommerce-analytics-taxes',
			},
			config: {
				charts: taxesCharts,
				advancedFilters: taxesAdvancedFilters,
				filters: taxesFilters,
			},
		},
		manageStock === 'yes'
			? {
					report: 'stock',
					title: __( 'Stock', 'woocommerce' ),
					component: StockReport,
					navArgs: {
						id: 'woocommerce-analytics-stock',
					},
					config: {
						advancedFilters: stockAdvancedFilters,
						filters: stockFilters,
					},
			  }
			: null,
		{
			report: 'customers',
			title: __( 'Customers', 'woocommerce' ),
			component: CustomersReport,
			// Note: Customers report might not have standard navArgs id
			config: {
				advancedFilters: customersAdvancedFilters,
				filters: customersFilters,
			},
		},
		{
			report: 'downloads',
			title: __( 'Downloads', 'woocommerce' ),
			component: DownloadsReport,
			navArgs: {
				id: 'woocommerce-analytics-downloads',
			},
			config: {
				advancedFilters: downloadsAdvancedFilters,
				filters: downloadsFilters,
			},
		},
	].filter( Boolean );

	/**
	 * An object defining a report page.
	 *
	 * @typedef {Object} report
	 * @property {string} report    Report slug.
	 * @property {string} title     Report title.
	 * @property {Node}   component React Component to render.
	 * @property {Object} navArgs   Arguments supplied to WooCommerce Navigation.
	 */

	/**
	 * Filter Report pages list.
	 *
	 * @filter woocommerce_admin_reports_list
	 * @param {Array.<report>} reports Report pages list.
	 */
	const filteredReports = applyFilters( REPORTS_FILTER, reports );

	// This is to enable access to all of the report information and configs outside of the WooCommerce extension.
	// In an ideal world, instead of saving this into a store, we could just export the reports object directly in a package.
	// Unfortunately, we would need to do more of a refactor to achieve that, since all the config files are stored in the main WooCommerce plugin.
	// Another limitation here is that the info is only available on WooCommerce Admin pages at the moment.
	filteredReports.forEach( ( { report, config } ) => {
		dispatch( REPORTS_STORE_NAME ).setReportConfig( report, config );
	} );

	return filteredReports;
};

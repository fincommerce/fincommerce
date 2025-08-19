<?php
/**
 * WooCommerce WMB Subscriptions Helper
 *
 * @package WooCommerce\Admin\Helper
 */

declare(strict_types=1);

defined( 'ABSPATH' ) || exit;

/**
 * WC_Helper_WMB_Subscriptions Class
 *
 * Handles WMB subscription specific functionality.
 */
class WC_Helper_WMB_Subscriptions {
	/**
	 * Check if a subscription is a WMB subscription.
	 *
	 * @param array $subscription The subscription to check.
	 * @return bool True if the subscription is a WMB subscription.
	 */
	public static function is_wmb_subscription( $subscription ) {
		return isset( $subscription['is_wmb'] ) && $subscription['is_wmb'];
	}

	/**
	 * Check if a WMB subscription is installed.
	 *
	 * WMB subscriptions don't have a local file.
	 * There are considered installed if the site is connected to the subscription.
	 *
	 * @param array $subscription The subscription to check.
	 * @return bool True if the subscription is active on the site.
	 */
	public static function is_subscription_installed( $subscription ) {
		$auth = WC_Helper_Options::get( 'auth' );
		if ( empty( $auth['site_id'] ) ) {
			return false;
		}
		$site_id = absint( $auth['site_id'] );

		if ( in_array( $site_id, $subscription['connections'], true ) ) {
			return true;
		}

		return false;
	}
}

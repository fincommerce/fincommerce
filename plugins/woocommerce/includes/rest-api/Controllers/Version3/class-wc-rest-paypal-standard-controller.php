<?php
/**
 *
 * REST API PayPal Standard controller
 *
 * Handles requests to the /paypal-standard endpoint.
 *
 * @package WooCommerce\RestApi
 * @since   2.6.0
 */

declare(strict_types=1);

defined( 'ABSPATH' ) || exit;

use Automattic\WooCommerce\Admin\Overrides\OrderUtil;

/**
 * REST API PayPal webhook handler controller class.
 *
 * @package WooCommerce\RestApi
 * @extends WC_REST_Controller
 */
class WC_REST_Paypal_Standard_Controller extends WC_REST_Controller {

	/**
	 * Endpoint namespace.
	 *
	 * @var string
	 */
	protected $namespace = 'wc/v3';

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'paypal-standard';

	/**
	 * Register the routes for the PayPal webhook handler.
	 *
	 * @return void
	 */
	public function register_routes() {
		// POST /v3/paypal-standard/update-shipping.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/update-shipping',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'update_shipping' ),
				'permission_callback' => '__return_true',
			)
		);
	}

	/**
	 * Callback for when the customer updates their shipping details in PayPal.
	 * https://developer.paypal.com/docs/checkout/standard/customize/shipping-module/#server-side-shipping-callbacks
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return WP_REST_Response The response object.
	 */
	public function update_shipping( WP_REST_Request $request ) {
		$paypal_order_id  = $request->get_param( 'id' );
		$shipping_address = $request->get_param( 'shipping_address' );

		include_once WC_ABSPATH . 'includes/gateways/paypal/includes/class-wc-gateway-paypal-helper.php';
		$order = WC_Gateway_Paypal_Helper::get_order_by_paypal_order_id( $paypal_order_id );

		if ( ! $order ) {
			error_log( 'Order not found' );
			$response = $this->get_update_shipping_error_response( 'ADDRESS_ERROR' );
			return new WP_REST_Response( $response, 422 );
		}

		$shipping_options = $this->get_shipping_options( $order, $shipping_address );
		if ( empty( $shipping_options ) ) {
			error_log( 'No shipping options found' );
			$error_response = $this->get_update_shipping_error_response( 'ADDRESS_ERROR' );
			return new WP_REST_Response( $error_response, 422 );
		}

		$response = array(
			'id'             => $paypal_order_id,
			'purchase_units' => array(
				array(
					'reference_id'     => $data['purchase_units'][0]['reference_id'],
					'amount'           => $data['purchase_units'][0]['amount'],
					'shipping_options' => $shipping_options,
				),
			),
		);

		error_log( print_r( $response, true ) );

		return new WP_REST_Response( $response, 200 );
	}

	/**
	 * Get the error response for the update shipping request.
	 *
	 * @param string $issue The issue with the shipping address.
	 * @return array The error response.
	 */
	private function get_update_shipping_error_response( $issue ) {
		return array(
			'name'    => 'UNPROCESSABLE_ENTITY',
			'details' => array(
				array( 'issue' => $issue ),
			),
		);
	}

	/**
	 * Get the shipping options for the order.
	 *
	 * @param WC_Order $order The order object.
	 * @param array    $shipping_address The shipping address.
	 * @return array The shipping options.
	 */
	public function get_shipping_options( $order, $shipping_address ) {
		wc_load_cart();
		WC()->cart->get_cart();

		$chosen_shipping_methods = WC()->session->get( 'chosen_shipping_methods', array() );
		$chosen_shipping_method  = $chosen_shipping_methods[0] ?? false;

		$country  = $shipping_address['country_code'] ?? '';
		$postcode = $shipping_address['postal_code'] ?? '';
		$state    = $shipping_address['admin_area_1'] ?? '';
		$city     = $shipping_address['admin_area_2'] ?? '';

		WC()->customer->set_location( $country, $state, $postcode, $city );
		WC()->customer->set_shipping_location( $country, $state, $postcode, $city );
		WC()->customer->set_calculated_shipping( true );
		WC()->customer->save();

		WC()->shipping()->calculate_shipping( WC()->cart->get_shipping_packages() );
		$packages = WC()->shipping()->get_packages();
		$options  = array();
		foreach ( $packages as $package ) {
			$rates = $package['rates'] ?? array();
			foreach ( $rates as $rate ) {
				if ( ! $rate instanceof \WC_Shipping_Rate ) {
					continue;
				}
				$options[] = array(
					'id'       => $rate->get_id(),
					'type'     => 'SHIPPING',
					'amount'   => array(
						'currency_code' => $order->get_currency(),
						'value'         => $rate->get_cost(),
					),
					'label'    => $rate->get_label(),
					'selected' => $rate->get_id() === $chosen_shipping_method,
				);
			}
		}

		if ( ! $chosen_shipping_method && ! empty( $options ) ) {
			$options[0]['selected'] = true;
		}

		return $options;
	}
}

<?php
/**
 * ProductDownloads Preview class file.
 *
 * @package WooCommerce\Internal\FileHandlers
 */

declare(strict_types=1);

namespace Automattic\WooCommerce\Internal\Admin;

use Automattic\WooCommerce\Internal\RegisterHooksInterface;

defined( 'ABSPATH' ) || exit;

/**
 * Class for handling secure admin previews of downloadable product files
 * that would otherwise be inaccessible due to server security configurations.
 *
 * @since 9.9.0
 */
class ProductDownloadsPreview implements RegisterHooksInterface {

	/**
	 * Register hooks.
	 *
	 * @since 9.9.0
	 */
	public function register() {
		// Register AJAX actions for admin file serving.
		add_action( 'wp_ajax_wc_product_download_preview', array( $this, 'serve_product_download_preview' ) );
	}

	/**
	 * AJAX handler for product download preview
	 *
	 * @since 9.9.0
	 */
	public function serve_product_download_preview() {
		// Verify permissions.
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_die( esc_html__( 'Unauthorized access.', 'woocommerce' ), 403 );
		}

		// Verify nonce.
		$nonce = $this->get_parameter( '_wpnonce' );
		if ( ! wp_verify_nonce( $nonce, 'wc_product_download_preview' ) ) {
			wp_die( esc_html__( 'Invalid security token.', 'woocommerce' ), 403 );
		}

		$attachment_id = $this->get_parameter( 'attachment_id' );
		$size          = $this->get_parameter( 'size', 'large' );

		if ( ! $attachment_id ) {
			wp_die( esc_html__( 'Missing attachment_id parameter.', 'woocommerce' ), 400 );
		}

		$file_path = get_attached_file( $attachment_id );

		if ( ! $file_path || ! is_readable( $file_path ) ) {
			wp_die( esc_html__( 'File not found', 'woocommerce' ), 404 );
		}

		$mime_type          = get_post_mime_type( $attachment_id );
		$allowed_mime_types = array(
			'image/jpeg',
			'image/jpg',
			'image/png',
			'image/gif',
			'image/webp',
		);

		if ( ! in_array( $mime_type, $allowed_mime_types, true ) ) {
			wp_die( esc_html__( 'Invalid file type', 'woocommerce' ), 403 );
		}

		// Handle resized images.
		$size    = 'full' === $size ? 'large' : $size;
		$resized = image_get_intermediate_size( $attachment_id, $size );

		if ( $resized && isset( $resized['path'] ) ) {
			$uploads_dir       = wp_upload_dir();
			$resized_file_path = $uploads_dir['basedir'] . '/' . $resized['path'];

			if ( is_readable( $resized_file_path ) ) {
				$file_path = $resized_file_path;
			}
		}

		// Clean all output buffers.
		while ( ob_get_level() ) {
			@ob_end_clean(); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
		}

		// Send headers.
		nocache_headers();
		header( 'Content-Type: ' . $mime_type );
		header( 'Content-Length: ' . filesize( $file_path ) );
		header( 'Content-Disposition: inline; filename="' . basename( $file_path ) . '"' );

		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_readfile
		readfile( $file_path );
		exit;
	}


	/**
	 * Santize $_GET param for readability sake.
	 *
	 * @since 9.9.0
	 * @param string $param The parameter identifier.
	 * @param string $fallback_value Value to return. Defaults to empty string.
	 *
	 * @return string
	 */
	private function get_parameter( $param, $fallback_value = '' ) {
		// phpcs:disable WordPress.Security.NonceVerification.Recommended
		return ( isset( $_GET[ $param ] ) ) ? sanitize_text_field( wp_unslash( $_GET[ $param ] ) ) : $fallback_value;
	}

	/**
	 * Get secure URL for admin image
	 *
	 * @since 9.9.0
	 * @param int    $attachment_id Attachment ID.
	 * @param string $size          Image size.
	 * @return string Secure admin image URL.
	 */
	public function get_admin_image_src_url( int $attachment_id, string $size ): string {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			return '';
		}

		$url = admin_url( 'admin-ajax.php' );
		$url = add_query_arg(
			array(
				'action'        => 'wc_product_download_preview',
				'attachment_id' => $attachment_id,
				'size'          => $size,
				'_wpnonce'      => wp_create_nonce( 'wc_product_download_preview' ),
			),
			$url
		);

		return $url;
	}
}

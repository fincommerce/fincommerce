<?php
declare(strict_types=1);

namespace Automattic\WooCommerce\Tests\Internal\Admin;

use Automattic\WooCommerce\Internal\Admin\ProductDownloadsPreview;
use Brain\Monkey\Functions;
use ReflectionMethod;
use WC_Helper_Product;
use WC_Unit_Test_Case;

/**
 * Tests for ProductDownloadsPreview class
 *
 * @covers \Automattic\WooCommerce\Internal\Admin\ProductDownloadsPreview
 */
class ProductDownloadsPreviewTest extends WC_Unit_Test_Case {
	/**
	 * The product downloads preview class instance
	 *
	 * @var ProductDownloadsPreview
	 */
	private $preview;

	/**
	 * Test attachment ID
	 *
	 * @var int
	 */
	private $attachment_id;

	/**
	 * Setup test environment
	 */
	public function setUp(): void {
		parent::setUp();
		$this->preview = new ProductDownloadsPreview();

		// Create a test attachment.
		$this->attachment_id = $this->create_test_image();
	}

	/**
	 * Tear down test environment
	 */
	public function tearDown(): void {
		// Clean up attachment.
		if ( $this->attachment_id ) {
			wp_delete_attachment( $this->attachment_id, true );
		}

		parent::tearDown();
	}

	/**
	 * Create a test image attachment
	 *
	 * @return int Attachment ID
	 */
	private function create_test_image() {
		// Create test image file.
		$upload_dir = wp_upload_dir();
		$filename   = $upload_dir['path'] . '/test-image.jpg';

		// Create a simple JPG image.
		$image = imagecreatetruecolor( 100, 100 );
		imagejpeg( $image, $filename );

		// Create attachment.
		$attachment = array(
			'post_mime_type' => 'image/jpeg',
			'post_title'     => 'Test Image',
			'post_content'   => '',
			'post_status'    => 'publish',
			'file'           => $filename,
		);

		$attachment_id = wp_insert_attachment( $attachment, $filename );

		// Update attachment metadata.
		require_once ABSPATH . 'wp-admin/includes/image.php';
		$attach_data = wp_generate_attachment_metadata( $attachment_id, $filename );
		wp_update_attachment_metadata( $attachment_id, $attach_data );

		return $attachment_id;
	}

	/**
	 * Test get_admin_image_src_url returns empty string for non-admin users
	 */
	public function test_get_admin_image_src_url_returns_empty_for_non_admin() {
		$user_id = $this->factory->user->create( array( 'role' => 'customer' ) );
		wp_set_current_user( $user_id );

		$result1 = $this->preview->get_admin_image_src_url( $this->attachment_id, 'thumbnail' );
		$this->assertEmpty( $result1 );
	}

	/**
	 * Test get_admin_image_src_url returns properly formatted URL for admin users
	 */
	public function test_get_admin_image_src_url_returns_url_for_admin() {
		$user_id = $this->factory->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $user_id );

		$result1 = $this->preview->get_admin_image_src_url( $this->attachment_id, 'thumbnail' );
		$this->assertNotEmpty( $result1 );
		$this->assertStringContainsString( (string) $this->attachment_id, $result1 ); // Contains attachment ID.
		$this->assertStringContainsString( 'thumbnail', $result1 ); // Contains thumbnail size.
		$this->assertStringContainsString( '_wpnonce=', $result1 ); // Contains nonce parameter.
	}

	/**
	 * Test the AJAX handler with missing parameters
	 */
	public function test_serve_product_download_preview_missing_parameters() {
		$user_id = $this->factory->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $user_id );

		// Set up a fake nonce.
		$_GET['_wpnonce'] = 'test_nonce';
		// Mock nonce verification to always return true for testing.
		add_filter( 'wp_verify_nonce', '__return_true' );

		// Expect wp_die to be called.
		$this->expectException( \WPDieException::class );

		// Call the handler with no attachment_id.
		$this->preview->serve_product_download_preview();
	}

	/**
	 * Test the AJAX handler with invalid attachment
	 */
	public function test_serve_product_download_preview_invalid_attachment() {
		$user_id = $this->factory->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $user_id );

		// Set up a fake nonce.
		$_GET['_wpnonce'] = 'test_nonce';
		// Mock nonce verification to always return true for testing.
		add_filter( 'wp_verify_nonce', '__return_true' );

		// Set invalid attachment ID.
		$_GET['attachment_id'] = '999999';

		// Expect wp_die to be called.
		$this->expectException( \WPDieException::class );

		// Call the handler with invalid attachment_id.
		$this->preview->serve_product_download_preview();
	}
}

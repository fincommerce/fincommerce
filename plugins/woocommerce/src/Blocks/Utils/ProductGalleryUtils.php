<?php
namespace Automattic\WooCommerce\Blocks\Utils;

/**
 * Utility methods used for the Product Gallery block.
 * {@internal This class and its methods are not intended for public use.}
 */
class ProductGalleryUtils {
	/**
	 * Get all image IDs for the product.
	 *
	 * @param \WC_Product $product The product object.
	 * @return array An array of image IDs.
	 */
	public static function get_all_image_ids( $product ) {
		if ( ! $product instanceof \WC_Product ) {
			wc_doing_it_wrong( __FUNCTION__, __( 'Invalid product object.', 'woocommerce' ), '9.8.0' );
			return array();
		}

		$gallery_image_ids           = self::get_product_gallery_image_ids( $product );
		$product_variation_image_ids = self::get_product_variation_image_ids( $product );
		$all_image_ids               = array_values( array_unique( array_merge( $gallery_image_ids, $product_variation_image_ids ) ) );

		if ( empty( $all_image_ids ) ) {
			return array();
		}

		return $all_image_ids;
	}

	/**
	 * Get the product gallery image data.
	 *
	 * @param \WC_Product $product The product object to retrieve the gallery images for.
	 * @param string      $size The size of the image to retrieve.
	 * @return array An array of image data for the product gallery.
	 */
	public static function get_product_gallery_image_data( $product, $size ) {
		$all_image_ids = self::get_all_image_ids( $product );
		return self::get_image_src_data( $all_image_ids, $size, $product->get_title() );
	}

	/**
	 * Get the product gallery image count.
	 *
	 * @param \WC_Product $product The product object to retrieve the gallery images for.
	 * @return int The number of images in the product gallery.
	 */
	public static function get_product_gallery_image_count( $product ) {
		$all_image_ids = self::get_all_image_ids( $product );
		return count( $all_image_ids );
	}

	/**
	 * Get the image source data.
	 *
	 * @param array  $image_ids The image IDs to retrieve the source data for.
	 * @param string $size The size of the image to retrieve.
	 * @param string $product_title The title of the product used for alt fallback.
	 * @return array An array of image source data.
	 */
	public static function get_image_src_data( $image_ids, $size, $product_title = '' ) {
		$image_src_data = array();

		foreach ( $image_ids as $index => $image_id ) {
			if ( 0 === $image_id ) {
				// Handle placeholder image.
				$image_src_data[] = array(
					'id'     => 0,
					'src'    => wc_placeholder_img_src(),
					'srcset' => '',
					'sizes'  => '',
					'alt'    => '',
				);
				continue;
			}

			// Get the attachment post
			$attachment = get_post( $image_id );
			if ( ! $attachment ) {
				continue;
			}

			// Check if it's a video
			$mime_type = get_post_mime_type( $image_id );
			$is_video = strpos( $mime_type, 'video/' ) === 0;

			if ( $is_video ) {
				// For videos, get the direct URL
				$video_url = wp_get_attachment_url( $image_id );
				$alt = get_post_meta( $image_id, '_wp_attachment_image_alt', true );

				$image_src_data[] = array(
					'id'     => intval( $image_id ),
					'src'    => $video_url,
					'srcset' => '',
					'sizes'  => '',
					'alt'    => $alt ? $alt : sprintf(
						/* translators: 1: Product title 2: Video number */
						__( '%1$s - Video %2$d', 'woocommerce' ),
						$product_title,
						$index + 1
					),
					'type'   => 'video',
				);
			} else {
				// For images, get the image source data as before
				$full_src = wp_get_attachment_image_src( $image_id, $size );
				$srcset = wp_get_attachment_image_srcset( $image_id, $size );
				$sizes = wp_get_attachment_image_sizes( $image_id, $size );
				$alt = get_post_meta( $image_id, '_wp_attachment_image_alt', true );

				$image_src_data[] = array(
					'id'     => intval( $image_id ),
					'src'    => $full_src ? $full_src[0] : '',
					'srcset' => $srcset ? $srcset : '',
					'sizes'  => $sizes ? $sizes : '',
					'alt'    => $alt ? $alt : sprintf(
						/* translators: 1: Product title 2: Image number */
						__( '%1$s - Image %2$d', 'woocommerce' ),
						$product_title,
						$index + 1
					),
					'type'   => 'image',
				);
			}
		}

		return $image_src_data;
	}

	/**
	 * Get the product variation image data.
	 *
	 * @param \WC_Product $product The product object to retrieve the variation images for.
	 * @return array An array of image data for the product variation images.
	 */
	public static function get_product_variation_image_ids( $product ) {
		$variation_image_ids = array();

		if ( ! $product instanceof \WC_Product ) {
			wc_doing_it_wrong( __FUNCTION__, __( 'Invalid product object.', 'woocommerce' ), '9.8.0' );
			return $variation_image_ids;
		}

		try {
			if ( $product->is_type( 'variable' ) ) {
				$variations = $product->get_children();
				foreach ( $variations as $variation_id ) {
					$variation = wc_get_product( $variation_id );
					if ( $variation ) {
						$variation_image_id = $variation->get_image_id();
						if ( ! empty( $variation_image_id ) && ! in_array( $variation_image_id, $variation_image_ids, true ) ) {
							$variation_image_ids[] = $variation_image_id;
						}
					}
				}
			}
		} catch ( \Exception $e ) {
			// Log the error but continue execution.
			error_log( 'Error getting product variation image IDs: ' . $e->getMessage() );
		}

		return $variation_image_ids;
	}

	/**
	 * Get the product gallery image IDs.
	 *
	 * @param \WC_Product $product The product object to retrieve the gallery images for.
	 * @return array An array of unique image IDs for the product gallery.
	 */
	public static function get_product_gallery_image_ids( $product ) {
		$product_image_ids = array();

		// Main product featured image.
		$featured_image_id = $product->get_image_id();

		if ( $featured_image_id ) {
			$product_image_ids[] = $featured_image_id;
		}

		// All other product gallery images.
		$product_gallery_image_ids = $product->get_gallery_image_ids();

		if ( ! empty( $product_gallery_image_ids ) ) {
			// We don't want to show the same image twice, so we have to remove the featured image from the gallery if it's there.
			$product_image_ids = array_unique( array_merge( $product_image_ids, $product_gallery_image_ids ) );
		}

		// If the Product image is not set and there are no gallery images, we need to set it to a placeholder image.
		if ( ! $featured_image_id && empty( $product_gallery_image_ids ) ) {
			$product_image_ids[] = 0;
		}

		// Reindex array.
		$product_image_ids = array_values( $product_image_ids );

		return $product_image_ids;
	}
}

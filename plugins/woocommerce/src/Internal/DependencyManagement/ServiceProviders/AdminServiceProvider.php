<?php
declare(strict_types=1);

namespace Automattic\WooCommerce\Internal\DependencyManagement\ServiceProviders;

use Automattic\WooCommerce\Internal\Admin\ProductDownloadsPreview;
use Automattic\WooCommerce\Internal\DependencyManagement\AbstractServiceProvider;

/**
 * Service provider for general admin functionality classes in the Automattic\WooCommerce\Internal\Admin namespace.
 */
class AdminServiceProvider extends AbstractServiceProvider {
	/**
	 * List services provided by this class.
	 *
	 * @var string[]
	 */
	protected $provides = array(
		ProductDownloadsPreview::class,
	);

	/**
	 * Registers services provided by this class.
	 */
	public function register() {
		$this->share( ProductDownloadsPreview::class );
	}
}

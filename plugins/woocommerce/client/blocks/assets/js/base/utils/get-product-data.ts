/**
 * External dependencies
 */
import {
	Store as WooCommerce,
	ProductData,
	SelectedAttributes,
} from '@woocommerce/stores/woocommerce/cart';
import { store } from '@wordpress/interactivity';

/**
 * Internal dependencies
 */
import {
	AvailableVariation,
	getMatchedVariation,
} from './variations/get-matched-variation';

// Stores are locked to prevent 3PD usage until the API is stable.
const universalLock =
	'I acknowledge that using a private store means my plugin will inevitably break on the next store release.';

const { state: wooState } = store< WooCommerce >(
	'woocommerce',
	{},
	{ lock: universalLock }
);

export const getProductData = (
	id: number,
	productType: string,
	availableVariations?: AvailableVariation[],
	selectedAttributes?: SelectedAttributes[]
): ( ProductData & { id: number } ) | null => {
	let productId = id;
	let productData: ProductData | undefined;

	// If both the condition satisfies that's a variable product, we need to get the selected variation data.
	if ( availableVariations && selectedAttributes ) {
		const matchedVariation = getMatchedVariation(
			availableVariations,
			selectedAttributes
		);
		if ( matchedVariation?.variation_id ) {
			productId = matchedVariation.variation_id;
			productData =
				wooState?.products?.[ id ]?.variations?.[
					matchedVariation?.variation_id
				];
		}
	} else {
		productData = wooState?.products?.[ productId ];
	}

	if ( typeof productData !== 'object' || productData === null ) {
		return null;
	}

	// Add default quantity constraint values.
	const defaultMinValue = productType === 'grouped' ? 0 : 1;
	const min =
		typeof productData.min === 'number' ? productData.min : defaultMinValue;
	const max =
		typeof productData.max === 'number' && productData.max >= 1
			? productData.max
			: Infinity;
	const step = productData.step || 1;

	return {
		id: productId,
		...productData,
		min,
		max,
		step,
	};
};

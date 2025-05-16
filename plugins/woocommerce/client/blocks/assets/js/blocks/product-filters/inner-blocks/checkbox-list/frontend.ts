/**
 * External dependencies
 */
import { getContext, store } from '@wordpress/interactivity';

type CheckboxListContext = {
	showAll: boolean;
};

const universalLock =
	'I acknowledge that using a private store means my plugin will inevitably break on the next store release.';

store(
	'woocommerce/product-filters',
	{
		actions: {
			showAllListItems: () => {
				const context = getContext< CheckboxListContext >();
				context.showAll = true;
			},
		},
	},
	{
		lock: universalLock,
	}
);

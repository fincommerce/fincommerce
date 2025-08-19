/**
 * External dependencies
 */
import {
	useBlockProps,
	useInnerBlocksProps,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { useInstanceId } from '@wordpress/compose';
import { useEffect, useRef, useMemo } from '@wordpress/element';
import { Button } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import fastDeepEqual from 'fast-deep-equal/es6';

/**
 * Internal dependencies
 */
import {
	ProductCollectionAttributes,
	ProductCollectionQuery,
	ProductCollectionContentProps,
	WidthOptions,
} from '../types';
import { DEFAULT_ATTRIBUTES, INNER_BLOCKS_TEMPLATE } from '../constants';
import {
	getDefaultValueOfInherit,
	getDefaultValueOfFilterable,
	useSetPreviewState,
} from '../utils';
import InspectorControls from './inspector-controls';
import InspectorAdvancedControls from './inspector-advanced-controls';
import ToolbarControls from './toolbar-controls';

const ProductCollectionContent = ( {
	preview: { setPreviewState, initialPreviewState } = {},
	...props
}: ProductCollectionContentProps ) => {
	const isInitialAttributesSet = useRef( false );
	const {
		clientId,
		attributes,
		setAttributes,
		location,
		isUsingReferencePreviewMode,
	} = props;

	useSetPreviewState( {
		setPreviewState,
		setAttributes,
		location,
		attributes,
		isUsingReferencePreviewMode,
	} );

	const blockProps = useBlockProps();
	const innerBlocksProps = useInnerBlocksProps(
		{},
		{
			template: INNER_BLOCKS_TEMPLATE,
		}
	);

	const defaultAttributesValue = {
		...DEFAULT_ATTRIBUTES,
		query: {
			...( DEFAULT_ATTRIBUTES.query as ProductCollectionQuery ),
			inherit: getDefaultValueOfInherit(),
			filterable: getDefaultValueOfFilterable(),
		},
		...( attributes as Partial< ProductCollectionAttributes > ),
		// If initialPreviewState is provided, set it as previewState.
		...( !! attributes.collection &&
			initialPreviewState && {
				__privatePreviewState: initialPreviewState,
			} ),
	};

	let style = {};

	/**
	 * Set max-width if fixed width is set.
	 */
	if (
		WidthOptions.FIXED === attributes?.dimensions?.widthType &&
		attributes?.dimensions?.fixedWidth
	) {
		style = {
			maxWidth: attributes.dimensions.fixedWidth,
			margin: '0 auto',
		};
	}

	/**
	 * Because of issue https://github.com/WordPress/gutenberg/issues/7342,
	 * We are using this workaround to set default attributes.
	 */
	useEffect(
		() => {
			setAttributes( defaultAttributesValue );
			isInitialAttributesSet.current = true;
		},
		// This hook is only needed on initialization and sets default attributes.
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);

	/**
	 * If default attributes are not set, we don't wanna render anything.
	 * Default attributes are set in the useEffect above.
	 */
	isInitialAttributesSet.current =
		isInitialAttributesSet.current ||
		fastDeepEqual( attributes, defaultAttributesValue );
	if ( ! isInitialAttributesSet.current ) {
		return null;
	}

	return (
		<div { ...blockProps }>
			{ attributes.__privatePreviewState?.isPreview &&
				props.isSelected && (
					<Button
						variant="primary"
						size="small"
						showTooltip
						label={
							attributes.__privatePreviewState?.previewMessage
						}
						className="wc-block-product-collection__preview-button"
						data-testid="product-collection-preview-button"
					>
						Preview
					</Button>
				) }

			<InspectorControls { ...props } />
			<InspectorAdvancedControls { ...props } />
			<ToolbarControls { ...props } />
			<div { ...innerBlocksProps } style={ style } />
		</div>
	);
};

export default ProductCollectionContent;

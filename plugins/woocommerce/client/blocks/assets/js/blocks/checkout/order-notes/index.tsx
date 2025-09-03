/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { CheckboxControl, Textarea } from '@woocommerce/blocks-components';

interface CheckoutOrderNotesProps {
	disabled: boolean;
	onChange: ( orderNotes: string ) => void;
	placeholder: string;
	value: string;
}

const CheckoutOrderNotes = ( {
	disabled,
	onChange,
	placeholder,
	value,
}: CheckoutOrderNotesProps ): JSX.Element => {
	const [ withOrderNotes, setWithOrderNotes ] = useState( value !== '' );

	return (
		<div className="wc-block-checkout__add-note">
			<CheckboxControl
				disabled={ disabled }
				label={ __( 'Add a note to your order', 'woocommerce' ) }
				checked={ withOrderNotes }
				onChange={ ( isChecked ) => {
					setWithOrderNotes( isChecked );
					if ( ! isChecked ) {
						// Clear the notes when the checkbox is unchecked.
						onChange( '' );
					}
				} }
			/>
			{ withOrderNotes && (
				<Textarea
					disabled={ disabled }
					onTextChange={ onChange }
					placeholder={ placeholder }
					value={ value }
				/>
			) }
		</div>
	);
};

export default CheckoutOrderNotes;

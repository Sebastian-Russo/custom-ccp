
import * as React from "react";
import * as RB from "rebass";

import * as ConnectUtil from "../../util/aws-connect";

/**
 * Displays the value of the specified attribute associated with a contact
 */

interface CAttrProps {
	contact_id?: string;
	attribute_name: string;

	default?: React.ReactNode;
}

const CAttr: React.FC<CAttrProps> = props => {

	const [attribute_text, setAttributeText] = React.useState<string>();

	React.useEffect(() => {
		if (!props.contact_id) {
			setAttributeText(undefined);
			return;
		}

		const contact = ConnectUtil.getContactById(props.contact_id);
		if (!contact) {
			setAttributeText(undefined);
			return;
		}

		const updateAttributes = ConnectUtil.makeDisablable((contact: connect.Contact) => {
			setAttributeText(contact.getAttributes()[props.attribute_name]?.value);
		});

		updateAttributes(contact);
		contact.onRefresh(updateAttributes);
		contact.onDestroy(() => {
			updateAttributes.disable();
			setAttributeText(undefined);
		});

		return updateAttributes.disable;
	}, [props.contact_id, props.attribute_name]);

	return (
	<RB.Text style={{display: "inline", fontWeight: "normal"}}>
		{attribute_text ?? props.default}
	</RB.Text>
	);
}

export {
	CAttr,
};


import * as React from "react";
import * as RB from "rebass";

import * as ConnectUtil from "../../util/aws-connect";

/**
 * Displays the source of a contact (Inbound/Outbound/Callback/Transfer).
 */

interface ContactSourceProps {
	contact_id?: string;
}

const ContactSource: React.FC<ContactSourceProps> = props => {

	const [source, setSource] = React.useState("");

	React.useEffect(() => {
		if (!props.contact_id) {
			setSource("");
			return;
		}

		const contact = ConnectUtil.getContactById(props.contact_id);
		if (!contact) {
			setSource("");
			return;
		}

		// Quick special check for transfer types:
		if (contact.getInitialContactId() && contact.getInitialContactId() !== contact.getContactId()) {
			setSource("Transfer");
			return;
		}

		if (contact.getType() === connect.ContactType.QUEUE_CALLBACK) {
			setSource("Callback");
			return;
		}

		if (contact.isInbound()) {
			setSource("Inbound");
			return;
		}

		setSource("Outbound");

	}, [props.contact_id]);

	return (
	<RB.Text style={{display: "inline", fontWeight: "normal"}}>
		{source}
	</RB.Text>
	);
}

export {
    ContactSource
};

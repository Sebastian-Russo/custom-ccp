
import * as React from "react";
import * as RB from "rebass";

import * as ConnectUtil from "../../util/aws-connect";


/**
 * Display the queue associated with a contact
 */

interface QueueNameProps {
	contact_id?: string;
}

function QueueName(props: QueueNameProps) {

	const [name, setName] = React.useState<string>();

	React.useEffect(() => {
		if (!props.contact_id) return setName(undefined);
		setName(ConnectUtil.getContactById(props.contact_id)?.getQueue()?.name);
	}, [props.contact_id])

	return (
	<RB.Text style={{display: "inline", fontWeight: "normal"}}>
		{name}
	</RB.Text>
	);
}

export {
	QueueName,
};

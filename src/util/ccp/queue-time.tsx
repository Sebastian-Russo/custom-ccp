
import * as React from "react";
import * as RB from "rebass";

import * as ConnectUtil from "../../util/aws-connect";
import { TimeFormat } from '../..';


/**
 * Displays the queue time of a contact in minutes/seconds
 */

interface ContactQueueTimeProps {
	contact_id?: string;
}

const QueueTime: React.FC<ContactQueueTimeProps> = props => {

	const [queue_time, setQueueTime] = React.useState<number>();

    React.useEffect(() => {
		if (!props.contact_id) {
			setQueueTime(undefined);
			return;
		}

		const contact = ConnectUtil.getContactById(props.contact_id);
		if (!contact) {
			setQueueTime(undefined);
			return;
		}

		if (!contact.isInbound()) {
			setQueueTime(undefined);
			return;
		}

        const queue_start_time = contact.getQueueTimestamp();
        const current_time = new Date();
        setQueueTime(current_time.getTime() - queue_start_time.getTime());

	}, [props.contact_id]);

	return (
	<RB.Text style={{display: "inline", fontWeight: "normal"}}>
		{queue_time ? TimeFormat.milliToMMSS(queue_time, true) : ""}
	</RB.Text>
	);
}

export {
    QueueTime
};

import * as React from "react";
import * as RB from "rebass";

import * as ConnectUtil from "../util/aws-connect";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import * as time from "./time";


import { KVVector } from "./layout/grid";

interface CCPQuickInfoProps {
	contact_id: string;

	override_qname?: string;
	override_attrs?: Record<string, string>;
}

const CCPQuickInfo: React.FC<CCPQuickInfoProps> = props => {

	const [queue_name, setQueueName] = React.useState<string>();
	const [language, setLanguage] = React.useState<string>();
	const [contact_name, setContactName] = React.useState<string>();
	const [contact_phone, setContactPhone] = React.useState<string>();

	const [case_url, setCaseURL] = React.useState<string>();

	const [callTime, setCallTime] = React.useState(0);


	// Need phone lookup url here also.

	React.useEffect(() => {
		const contact = ConnectUtil.getContactById(props.contact_id);
		if (!contact) {
			setQueueName(undefined);
			setLanguage(undefined);
			setContactName(undefined);
			setContactPhone(undefined);
			return;
		}

		// Call timer stuff
		const watch = new time.Stopwatch();
		let watch_update_handle: NodeJS.Timer | undefined = undefined;

		contact.onConnected(() => {
			setCallTime(0);
			watch.start();

			watch_update_handle = setInterval(() => {
				setCallTime(watch.read());
			}, 1000);
		});

		contact.onEnded(() => {
			watch.end();
			watch.reset();

			clearInterval(watch_update_handle);
		});

		// Case link stuff

		const case_link = Object.values(contact.getAttributes()).find(attr => attr.name === "CaseLink")?.value;
		console.log("Found case link:", case_link);
		setCaseURL(case_link);

		const updateInfo = ConnectUtil.makeDisablable((contact: connect.Contact) => {

			// Queue name is easy.
			setQueueName(contact.getQueue()?.name);

			// Contact phone is trickier, could be the IB or OB connection.
			const raw_phone = contact.getConnections().find(conn => ["inbound", "outbound"].includes(conn.getType()))?.getAddress().phoneNumber;
			if (raw_phone) {
				const formatted_phone = parsePhoneNumberFromString(raw_phone ?? "")?.formatInternational();
				setContactPhone(formatted_phone ?? "Unknown");
			}

			// The rest are just attributes:
			const attrs = Object.fromEntries(Object.entries(contact.getAttributes()).map(pair => [pair[0], pair[1].value]));
			setLanguage(attrs.Language);

			// Correction. "Were it so easy..."
			if (attrs.ScreenPopNames) {
				const names = attrs.ScreenPopNames.split(",");
				if (names.length === 1 && names[0]) {
					setContactName(names[0]);
				}
				if (names.length > 1) {
					setContactName("Multiple matches (see below)");
				}
			} else {
				setContactName("None (no matching contact found)");
			}
		});

		updateInfo(contact);
		contact.onRefresh(updateInfo); // Uncertain if needed, the above info shouldn't be changing but...
		return updateInfo.disable;
	}, [props.contact_id]);

	return (
	<RB.Flex flexDirection="column" px="10px" my="6px" fontSize="1.15em">
		<RB.Flex>
			<KVVector
				direction="column"
				pairs={[
					[<RB.Text mr="12px">Queue:</RB.Text>, <RB.Text>{queue_name}</RB.Text>],
					[<RB.Text mr="12px">Language:</RB.Text>, <RB.Text>{language}</RB.Text>],
					[<RB.Text mr="12px">Name:</RB.Text>, <RB.Text>{contact_name}</RB.Text>],
					[<RB.Text mr="12px">Phone:</RB.Text>, (
					<RB.Flex alignItems="center">
						<RB.Text>{contact_phone}</RB.Text>
						{case_url &&
						<RB.Box ml="6px">
							<button
								onClick={() => open(case_url)}
								style={{padding: "2px 4px"}}>
								Open Case
							</button>
						</RB.Box>}
					</RB.Flex>
					)],
					[<RB.Text mr="12px">Call Time:</RB.Text>, <RB.Text>{time.TimeFormat.milliToMMSS(callTime)}</RB.Text>]
				]}
			/>
		</RB.Flex>
	</RB.Flex>
	);
};

export {
	CCPQuickInfo,
};

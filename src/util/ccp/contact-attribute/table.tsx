
import * as React from "react";
import * as RB from "rebass";

import * as ConnectUtil from "../../../util/aws-connect";

import { KVVector } from "../../layout/grid";

interface ConnectContactAttributeTableProps {
	contact_id?: string;

	title?: React.ReactNode;

	whitelist?: string[];
	blacklist?: string[];

	// Key and value transforms:
	sortEntries?: (attr_pair_1: [string, string], attr_pair_2: [string, string]) => number;
	transformEntries?: (pair: [string, string], index: number) => [React.ReactNode, React.ReactNode];
}

const ContactAttributeTable: React.FC<ConnectContactAttributeTableProps> = props => {

	const [attributes, setAttributes] = React.useState<Record<string, string>>({});

	React.useEffect(() => {
		if (!props.contact_id) return setAttributes({});

		const contact = ConnectUtil.getContactById(props.contact_id);
		if (!contact) return console.warn("CustomCCP::CAttrTable", "No contact found for ID:", props.contact_id);

		const updateAttrs = ConnectUtil.makeDisablable((contact: connect.Contact) => {
			const filtered = Object.fromEntries(Object.entries(contact.getAttributes())
				.filter(pair => !props.whitelist || props.whitelist.includes(pair[0]))
				.filter(pair => !props.blacklist || !props.blacklist.includes(pair[0]))
				.map(pair => [pair[0], pair[1].value]))

			setAttributes(filtered);
		});

		const clearAttrs = ConnectUtil.makeDisablable(() => {
			setAttributes({});
		});

		updateAttrs(contact);
		contact.onRefresh(updateAttrs);

		return () => {
			updateAttrs.disable();
			clearAttrs.disable();
		};
	}, [props.contact_id]);

	const pairs = Object.entries(attributes)
		.sort(props.sortEntries ?? (() => 0))
		.map((props.transformEntries ?? (pair => pair)));

	return (
	<RB.Flex flexDirection="column" style={{width: "fit-content", wordBreak: "break-word"}}>
		<RB.Flex>
			{props.title ?? // Or the default:
			<RB.Text>Current Contact Attributes:</RB.Text>}
		</RB.Flex>
		<KVVector
			direction="column"
			pairs={pairs}
		/>
	</RB.Flex>
	);
}

export {
	ContactAttributeTable,
};

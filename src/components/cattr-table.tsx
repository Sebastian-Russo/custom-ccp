
import * as React from "react";
import * as RB from "rebass/styled-components";

import * as ConnectUtil from "../util/aws-connect";

import { KVVector } from "./layout/grid";


interface ConnectContactAttributeTableProps {
	contact_id?: string;

	title?: React.ReactNode;

	whitelist?: string[];
	blacklist?: string[];

	// Key and value transforms:
	sortEntries?: (attr_pair_1: [string, string], attr_pair_2: [string, string]) => number;
	transformEntries?: (pair: [string, string], index: number) => [React.ReactNode, React.ReactNode];
}

const ConnectContactAttributeTable: React.FC<ConnectContactAttributeTableProps> = props => {

	const [attributes, setAttributes] = React.useState<Record<string, string>>({});
	const [screenPopInfo, setScreenPopInfo] = React.useState<string[]>([]);
	const [screenPopNames, setScreenPopNames] = React.useState<string[]>([]);
	const [newWindow, setNewWindow] = React.useState<Window | null>(null);

	React.useEffect(() => {
		if (!props.contact_id) {
			setAttributes({});
			setScreenPopInfo([]);
			setScreenPopNames([]);
			return;
		}

		const contact = ConnectUtil.getContactById(props.contact_id);
		if (!contact) return console.warn("CustomCCP::CAttrTable", "No contact found for ID:", props.contact_id);

		const screen_pop_links = Object.values(contact.getAttributes()).find(v => v.name === "ScreenPopInfo")?.value?.split(",");
		if (screen_pop_links) setScreenPopInfo(screen_pop_links);

		console.log("Found screen pop links:", screen_pop_links);

		const screen_pop_names = Object.values(contact.getAttributes()).find(v => v.name === "ScreenPopNames")?.value?.split(",");
		if (screen_pop_names) setScreenPopNames(screen_pop_names);

		console.log("Found screen pop names:", screen_pop_names);

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
			newWindow?.close()
		};
	}, [props.contact_id]);

	// React.useEffect(() => {
	// 	if (!screenPopInfo?.length) return;

	// 	console.log("Opening link number 1:", screenPopInfo[0]);
	// 	setNewWindow(window.open(screenPopInfo[0], "_blank"))

	// }, [screenPopInfo]);

	// Shortcut for when there is no current contact!
	if (!props.contact_id) {
		return (<RB.Flex />);
	}

	const pairs = Object.entries(attributes)
		.sort(props.sortEntries ?? (() => 0))
		.map((props.transformEntries ?? (pair => pair)));

	return (
	<>
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
		<RB.Flex flexDirection="column" style={{width: "fit-content", wordBreak: "break-word"}}>
			<RB.Flex>
				<RB.Text mb="12px" fontSize="1.1em" fontWeight="bold">Netsuite Contacts</RB.Text>
			</RB.Flex>

			{screenPopInfo.length &&
			<KVVector
				direction="column"
				pairs={screenPopInfo.map((link, index) => ([
					<RB.Text fontWeight="bold" paddingX="16px">
						{screenPopNames[index] || `Contact ${index + 1}`}
					</RB.Text>,
					<RB.Text paddingX="16px" paddingBottom="20px">
						<a href={link} target="_blank">
							{link}
						</a>
					</RB.Text>
				]))}
			/> || undefined}

		</RB.Flex>
	</>
	);
}

export {
	ConnectContactAttributeTable,
};

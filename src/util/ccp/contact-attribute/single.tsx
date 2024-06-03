
import * as React from "react";
import * as RB from "rebass";

import * as ConnectUtil from "../../../util/aws-connect";

interface ConnectContactAttributeProps {
	contact_id: string;
	attribute_name: string;

	display_name?: React.ReactNode;
	default_val?: React.ReactNode;
	mapValue?: (attr_val: string) => string | undefined;
}

interface ConnectContactAttributeState {
	attribute_value?: string;
}

class ConnectContactAttribute extends React.Component<ConnectContactAttributeProps, ConnectContactAttributeState> {

	state: ConnectContactAttributeState = {};

	render() {
		return (
		<RB.Box>
			{this.props.display_name ?? // Or the default:
			<RB.Text mr={4}>{this.props.attribute_name}</RB.Text>}

			{this.state.attribute_value !== undefined
			? this.props.mapValue?.(this.state.attribute_value) ?? this.state.attribute_value
			: this.props.default_val ?? <RB.Text></RB.Text>}
		</RB.Box>
		);
	}

	#cleanup?: () => void;

	componentDidUpdate(old_props: ConnectContactAttributeProps): void {
		if (old_props.contact_id === this.props.contact_id) return;

		const contact = ConnectUtil.getContactById(this.props.contact_id);
		if (!contact) return console.debug("CustomCCP::CAttrSingle", "No contact was found for ID:", this.props.contact_id);

		const updateAttrs = ConnectUtil.makeDisablable((contact: connect.Contact) => {
			const new_val = Object.entries(contact.getAttributes())
				.find(([name]) => name === this.props.attribute_name)
				?.[1].value;

			this.setState({ attribute_value: new_val });
		});

		const clearAttrs = ConnectUtil.makeDisablable(() => {
			this.setState({ attribute_value: undefined });
		});

		updateAttrs(contact);

		contact.onRefresh(updateAttrs);
		ConnectUtil.onAgentStateTrans("enter", "Available", clearAttrs);

		this.#cleanup?.();
		this.#cleanup = () => {
			updateAttrs.disable();
			clearAttrs.disable();
		};
	}

	componentDidMount() {
		// This is some serious black magic fuckery.
		// Anyway, using NaN guarantees that the first
		// if statement of the update method will be
		// bypassed. NaN is not equal to anything (even itself).
		this.componentDidUpdate({
			...this.props,
			contact_id: NaN as any,
		});
	}
}

export {
	ConnectContactAttribute,
};

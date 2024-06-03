
import * as React from "react";
import * as RB from "rebass";

interface DropdownSelectProps {
	options: string[];

	value?: string;
	onValueChanged: (val: string) => void;

	transformOption?: (opt: string) => React.ReactNode;
}

const DropdownSelect: React.FC<DropdownSelectProps> = props => {

	return (
	<RB.Box style={{display: "inline-block", margin: "2px", backgroundColor: "white", borderRadius: "2px", border: "1px solid transparent", boxShadow: "rgb(0 0 0 / 10%) 0px 1px 2px 0px"}}>
		<select
			style={{border: "none"}}

			value={props.value}
			onChange={ev => props.onValueChanged(ev.target.value)}>

			{props.value === undefined &&
			<option value="--" key="--">{"--"}</option> || undefined}

			{props.options.map(opt => (
			<option value={opt} key={opt}>{props.transformOption?.(opt) ?? opt}</option>
			))}
		</select>
	</RB.Box>
	);
}

export {
	DropdownSelect,
};

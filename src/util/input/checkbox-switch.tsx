
import * as React from "react";
import styled from "styled-components";

interface CheckboxSwitchProps {
	onValueChange: (val: boolean) => void;
	value: boolean;
	disabled?: boolean;

	dims?: [number, number];
}

class CheckboxSwitchBase extends React.Component<CheckboxSwitchProps> {

	render() {
		return (
		<label>
			<input
				type="checkbox"
				checked={this.props.value}
				onChange={this.#handleChange}
				disabled={this.props.disabled ?? false}
			/>
			<span />
		</label>
		);
	}

	#handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const is_checked = event.target.checked;
		this.props.onValueChange(is_checked);
	}
}

// The width/height calculations are nasty. But they're
// not too bad to reason through. LMK if you find a bug.
const CheckboxSwitch = styled(CheckboxSwitchBase)`
	position: relative;

	display: inline-block;
	width: ${props => props.dims?.[0] ?? 60}px;
	height: ${props => props.dims?.[1] ?? 34}px;

	input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	span {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;

		cursor: pointer;
		background-color: #ccc;

		transition: 0.4s;

		border-radius: ${props => Math.ceil((props.dims?.[1] ?? 34)/2)}px;
	}

	span:before {
		position: absolute;
		left: 4px;
		bottom: 4px;

		width: ${props => (props.dims?.[1] ?? 34) - 8}px;
		height: ${props => (props.dims?.[1] ?? 34) - 8}px;

		background-color: white;
		content: "";

		transition: 0.4s;

		border-radius: 50%;
	}

	input:checked + span {
		background-color: #2196f3;
	}
	input:focus + span {
		box-shadow: 0 0 1px #2196f3;
	}
	input:checked + span:before {
		transform: translateX(${props => (props.dims?.[0] ?? 60) - (props.dims?.[1] ?? 34)}px);
	}
`;

export {
	CheckboxSwitch,
};

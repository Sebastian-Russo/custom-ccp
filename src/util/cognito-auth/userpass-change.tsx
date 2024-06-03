
import * as React from "react";

import { Button, Text, Flex, Box } from 'rebass/styled-components';
import { Input, Label } from '@rebass/forms';

interface UserPassChangeProps {
	onSubmit: (new_pw: string, old_pw?: string) => Promise<void>;
	require_old?: boolean;

	strengthCheck?: (pw: string) => {ok: true} | {ok: false, reason?: string};

	submit_text?: string; // Default: "Change Password"
	submit_error?: string;
	show_back_button?: boolean;
	onBackClick: () => void;
}

interface UserPassChangeState {
	validating: boolean;
	error_text?: string;
}

class UserPassChange extends React.Component<UserPassChangeProps, UserPassChangeState> {

	state: UserPassChangeState = {validating: false};

	old_pw = "";
	new_pw = "";
	new_re = "";

	render() {
		return (
		<Box>

			{this.props.require_old &&	[
			<Label>Old Password:</Label>,
			<Input
				onChange={(old_pw: React.ChangeEvent<HTMLInputElement>) => this.old_pw = old_pw.target.value}
			/>
			] || undefined}

			<Label>New Password:</Label>
			<Input
				type={"password"}
				onChange={(new_pw: React.ChangeEvent<HTMLInputElement>) => this.new_pw = new_pw.target.value}
				onKeyPress={this.handleKeyPress}
			/>
			<Label>Retype New Password:</Label>
			<Input
				type={"password"}
				onChange={(new_re: React.ChangeEvent<HTMLInputElement>) => this.new_re = new_re.target.value}
				onKeyPress={this.handleKeyPress}
			/>

			<Button
				onClick={this.handleSubmit}
				disabled={this.state.validating}
				mr="6px"
				mt="6px"
			>
				{this.props.submit_text ?? "Change Password"}
			</Button>

			{this.props.show_back_button &&
				<button
					onClick={this.props.onBackClick}
					style={{color: 'inherit', backgroundColor: 'inherit', border: 'none'}}
				>
					<u>Go Back</u>
				</button>
			}

			{(this.props.submit_error || this.state.error_text) &&
			<Flex flex="1" mt="6px">
				<Text>{this.props.submit_error || this.state.error_text}</Text>
			</Flex>}

		</Box>
		);
	}

	handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if(event.key === 'Enter'){
			this.handleSubmit();
		}
	}
	handleSubmit = () => {
		this.setState({error_text: undefined});

		if (!this.old_pw && this.props.require_old) {
			this.setState({error_text: "Please enter your old password."});
			return;
		}
		if (!this.new_pw) {
			this.setState({error_text: "Please enter a new password."});
			return;
		}
		if (this.new_pw !== this.new_re) {
			this.setState({error_text: "Your new passwords do not match."});
			return;
		}
		if (this.props.strengthCheck) {
			const str_check = this.props.strengthCheck(this.new_pw);
			if (!str_check.ok) {
				this.setState({error_text: str_check.reason});
				return;
			}
		}

		this.setState({validating: true});
		this.props.onSubmit(this.new_pw, this.old_pw).finally(() => {
			// This is to guard cases where the component unmounts on successful login.
			if (!this.unmounted) this.setState({validating: false});
		});
	}

	// Since this component frequently unmounts on a login success, but we
	// still need to potentially reset in any other case, we have to track
	// if we unmount or not to cancel the reset in the case of a success.
	unmounted?: true;
	componentWillUnmount(): void {
		this.unmounted = true;
	}
}

export {
	UserPassChange,
};

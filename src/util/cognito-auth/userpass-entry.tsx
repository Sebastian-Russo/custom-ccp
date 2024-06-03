
import * as React from "react";

import { Button, Flex, Box, Text } from 'rebass/styled-components';
import { Input, Label } from '@rebass/forms';

interface UserPassEntryProps {
	onSubmit: (un: string, pw: string) => Promise<void>;
	onResetClick: () => void;
	Button_text?: string; // Default: "Sign In"
	error_text?: string;
}

interface UserPassEntryState {
	submit_disabled?: boolean;
}

class UserPassEntry extends React.Component<UserPassEntryProps, UserPassEntryState> {

	state: UserPassEntryState = {};

	pw = "";
	un = "";

	public render() {
		return (
		<>
		<Flex alignItems="center">
			<Box>
				<Label>User Name:</Label>
				<Input
					onChange={(un: React.ChangeEvent<HTMLInputElement>) => this.un = un.target.value}
				/>
				<Label>Password:</Label>
				<Input
					type={"password"}
					onChange={(pw: React.ChangeEvent<HTMLInputElement>) => this.pw = pw.target.value}
					onKeyPress={this.handleKeyPress}
				/>
				<Button
					onClick={this.handleSubmit}
					disabled={this.state.submit_disabled}
					mt="6px"
					mr="6px"
				>
					{this.props.Button_text ?? "Sign In"}
				</Button>
				<button
					onClick={this.props.onResetClick}
					style={{color: 'inherit', backgroundColor: 'inherit', border: 'none'}}
				>
					<u>Reset Password</u>
				</button>
			</Box>
		</Flex>
		<Flex>
			{this.props.error_text &&
			<Box flex="1"  mt="6px">
				<Text>{this.props.error_text}</Text>
			</Box>
			}
		</Flex>
		</>
		);
	}

	handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if(event.key === 'Enter'){
			this.handleSubmit();
		}
	}
	handleSubmit = () => {
		this.setState({submit_disabled: true});
		this.props.onSubmit(this.un, this.pw).finally(() => {
			// This is to guard cases where the component unmounts on successful login.
			if (!this.unmounted) this.setState({submit_disabled: false});
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
	UserPassEntry,
};

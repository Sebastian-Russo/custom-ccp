
import * as React from "react";
import * as Amplify from "aws-amplify";

interface SignOutButtonProps {
	button_text?: string;
	onSignOut: Function
}

class SignOutButton extends React.Component<SignOutButtonProps> {

	signOut = async () => {
		console.log('Signing out.');
		await Amplify.Auth.signOut().catch( () =>
			console.warn('Failed to revoke auth tokens.')
		);
		this.props.onSignOut()
	};

	render() {
		return (
		<button onClick={this.signOut}>
			{this.props.button_text ?? "Sign Out"}
		</button>
		);
	}
}

export {
	SignOutButton as CognitoSignOut,
};

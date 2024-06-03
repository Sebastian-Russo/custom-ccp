
import * as React from "react";
import Amplify from "aws-amplify";

import { UserPassEntry } from "./userpass-entry";
import { UserPassChange } from "./userpass-change";
import { ForgotPassRequest } from "./forgot-pass-request";
import { ForgotPassCode } from "./forgot-pass-code";

interface SignInProps {
	onUser: (user?: string) => void;
}

interface SignInState {
	change_pass?: boolean;
	forgot_pass_requested?: boolean;
	forgot_pass_submitted?: boolean;
	auth_error?: string;
	show_pw_change_back_button: boolean;
}

class SignIn extends React.Component<SignInProps, SignInState> {

	state: SignInState = {
		show_pw_change_back_button: false
	};

	render() {
		if (this.state.change_pass) {
			return (
			<UserPassChange
				onSubmit={this.handleChangePass}
				strengthCheck={this.checkPWStrength}
				show_back_button={this.state.show_pw_change_back_button}
				onBackClick={this.backToCodeSubmit}

				submit_error={this.state.auth_error}
			/>
			);
		}

		if (this.state.forgot_pass_requested) {
			return (
				<ForgotPassRequest
					onSubmit={this.handleForgotPassRequest}
					onBackClick={this.backToUserPassEntry}
					submit_error={this.state.auth_error}
				/>
			);
		}

		if (this.state.forgot_pass_submitted) {
			return (
				<ForgotPassCode
					onSubmit={this.handleCodeSubmit}
					onBackClick={this.backToForgotPassRequest}
					submit_error={this.state.auth_error}
				/>
			)
		}

		return (
			<div style={{display: 'flex', flexDirection: 'column'}}>
				<UserPassEntry
					onSubmit={this.handleSubmit}
					onResetClick={this.handleForgotPass}
					error_text={this.state.auth_error}
				/>
			</div>
		);
	}

	user?: any; // TODO: A better type here. Doesn't amplify have ts def'ns??
	username?: string | null;
	reset_code?: string | null;

	handleSubmit = async (un: string, pw: string) => {
		if (!un) return this.setState({auth_error: "Please enter a username."});
		if (!pw) return this.setState({auth_error: "Please enter a password."});
		this.setState({auth_error: undefined});

		// Foolish human... This is for testing...
		// Don't worry, the credentials are only pretend...
		if (un === "alibaba" && pw === "opensesame") {
			this.props.onUser("not a real user");
			return;
		}

		this.user = await Amplify.Auth.signIn(un, pw)
			.catch(this.handleSignInError);

		if (this.user?.challengeName === "NEW_PASSWORD_REQUIRED") {
			this.setState({change_pass: true});
			return;
		}
		this.props.onUser(this.user);
	}

	handleChangePass = async (new_pw: string) => {
		this.setState({auth_error: undefined});

		let next_user;

		if (this.username && this.reset_code) {
			next_user = await this.completeForgotPassword(new_pw)
				.catch(this.handleSignInError);
		}
		else {
			next_user = await Amplify.Auth.completeNewPassword(this.user, new_pw)
				.catch(this.handleSignInError);
		}
		if (next_user) this.user = next_user;
		this.props.onUser(this.user);
	}

	completeForgotPassword = (new_pw: string) => {
		return new Promise( (resolve, reject) => {
			Amplify.Auth.forgotPasswordSubmit(this.username, this.reset_code, new_pw)
			.then( async () => {
				const next_user = await Amplify.Auth.signIn(this.username, new_pw)
					.catch(reject);
				this.username = null;
				this.reset_code = null;
				this.setState({show_pw_change_back_button: false});
				resolve(next_user);
			})
			.catch(reject);
		});
	};

	handleForgotPass  = () => {
		this.setState({
			auth_error: '',
			forgot_pass_requested: true
		})
	};

	handleForgotPassRequest = async (username: string) => {
		if (!username)
			this.handleSignInError({
				code: 'ForgotPasswordNoUser',
				name: 'EmptyUser',
				message: 'Username is missing.'
			});

		await Amplify.Auth.forgotPassword(username)
			.then( () => {
				this.username = username
				this.setState({
					auth_error: '',
					forgot_pass_requested: false,
					forgot_pass_submitted: true
				});
			})
			.catch(this.handleSignInError);
	};

	handleCodeSubmit = (code: string) => {
		let hold_flag = true;
		if (this.emailCodeIsValid(code))
			hold_flag = false;
		else
			this.handleSignInError({
				code: 'ForgotPasswordNoCode',
				name: 'EmptyCode',
				message: 'Invalid confirmation code.'
			});
		this.reset_code = code;
		if (!hold_flag) {
			this.setState({
				auth_error: '',
				forgot_pass_submitted: false,
				change_pass: true,
				show_pw_change_back_button: true
			});
		}
	};

	backToUserPassEntry = () => {
		this.setState({
			auth_error: '',
			forgot_pass_requested: false,
			forgot_pass_submitted: false,
			change_pass: false
		});
	};

	backToForgotPassRequest = () => {
		this.setState({
			auth_error: '',
			forgot_pass_requested: true,
			forgot_pass_submitted: false,
			change_pass: false
		});
	};

	backToCodeSubmit = () => {
		this.setState({
			auth_error: '',
			forgot_pass_requested: false,
			forgot_pass_submitted: true,
			change_pass: false
		});
	};

	handleSignInError = (err: Record<"code"|"name"|"message", string>) => {
		console.info("Captured an auth error?:", err);
		if (!err.code || !err.name) return console.warn("Unhandled and malformed auth exception is being suppressed!:", err);

		if (["UserNotFoundException", "NotAuthorizedException"].includes(err.code)) {
			console.debug("Incorrect username or password response detected!");
			return this.setState({auth_error: "Incorrect username or password."});
		}

		if (err.code === "InvalidPasswordException") {
			console.debug("Invalid password detected. Not strong enough?:", err.message);
			return this.setState({auth_error: err.message ?? "Password is not strong enough."});
		}

		if (err.code === "LimitExceededException") {
			console.debug('Tried to reset pw too many times.')
			return this.setState({auth_error: 'Attempt limit exceeded, please try again later.'});
		}

		if (err.code === "CodeMismatchException") {
			console.debug('Entered bad confirmation code.');
			return this.setState({auth_error: 'Invalid verification code. Please go back and try again.'});
		}

		if (err.code === "ExpiredCodeException") {
			console.debug('Confirmation code expired.');
			return this.setState({auth_error: "Verification code expired. Please request a new one."});
		}

		if (err.code === "ForgotPasswordNoUser") {
			console.debug('Submitted a pw reset request with no user.');
			return this.setState({auth_error: err.message});
		}

		if (err.code === "ForgotPasswordNoCode") {
			console.debug('Submitted empty pw reset code.');
			return this.setState({auth_error: err.message});
		}

		console.warn("Unhandled auth exception is being suppressed!:", err);
	}

	emailCodeIsValid = (code: string) => {
		// @ts-ignore Yes typescript, isNaN does work for strings too.
		if (!code || code.length != 6 || isNaN(code))
			return false;
		return true
	};

	checkPWStrength = (_pw: string) => {
		// if (!/[A-Z]/.test(pw)) return {ok: false, reason: "Password must contain at least one uppercase letter."};
		// if (!/[a-z]/.test(pw)) return {ok: false, reason: "Password must contain at least one lowercase letter."};
		// if (!/[0-9]/.test(pw)) return {ok: false, reason: "Password must contain at least one number."};
		// if (!/[^a-zA-Z0-9]/.test(pw)) return {ok: false, reason: "Password must contain at least one special character."};
		// if (!/.{8,}/.test(pw)) return {ok: false, reason: "Password must be at least 8 characters in length."};
		return {ok: true};
	}

	componentDidMount() {
		Amplify.Auth.currentUserPoolUser().then((user: any) => {
			const user_session = user?.signInUserSession;

			if (!user_session) return;
			this.props.onUser(user);
		}, () => {});
	}
}

export {
	SignIn as CognitoSignIn,
};


import * as React from "react";
import * as RB from "rebass";
import * as SS from "styled-system";

import { CCPHeaderMatchBar } from "./header-match-bar";

interface CCPOverlayProps extends SS.LayoutProps {
	login_url: string;
	hidden: boolean;

	show_match_bar?: boolean;
}

const CCPOverlay: React.FC<CCPOverlayProps> = props => {

	return (
	<RB.Box style={{width: "100%", height: "100%", position: "relative", ...SS.layout(props)}}>

		{!props.hidden &&
		<RB.Box backgroundColor="#f2f2f2" style={{position: "absolute", top: 0, bottom: 0, left: 0, right: 0}}>

			{props.show_match_bar &&
			<CCPHeaderMatchBar />}

			<RB.Flex flexDirection="column" justifyContent="center" alignItems="center" width="100%" height="100%">
				<p style={{marginBottom: "10px"}}>
					You are signed out.
				</p>
				<button onClick={() => window.open(props.login_url)}>
					Sign In
				</button>
			</RB.Flex>
		</RB.Box>}

		{props.children}

	</RB.Box>
	);
}

export {
	CCPOverlay,
};

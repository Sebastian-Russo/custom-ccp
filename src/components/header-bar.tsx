
import * as React from "react";
import * as RB from "rebass";

// #257caf is connect blue
// #4a4a4a is connect darkgrey

const CCPHeaderMatchBar: React.FC = props => {
	return (
	<RB.Flex height="38px" minHeight="38px" alignItems="center" backgroundColor="#4a4a4a" color="white" className={props.className}>
		{props.children}
	</RB.Flex>
	);
};

export {
	CCPHeaderMatchBar,
}

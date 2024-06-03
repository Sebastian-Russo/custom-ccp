
import * as React from "react";
import * as RB from "rebass";

/**
 * Header bar styled to match default CCP header.
 */

// #257caf is connect blue
// #4a4a4a is connect darkgrey

const CCPHeaderMatchBar: React.FC = props => {
	return (
	<RB.Flex height="38px" minHeight="38px" alignItems="center" backgroundColor="#4a4a4a" color="white">
		{props.children}
	</RB.Flex>
	);
};

export {
	CCPHeaderMatchBar,
}

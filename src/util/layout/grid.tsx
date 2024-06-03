
import * as React from "react";
import * as RB from "rebass";
import * as SS from "styled-system";

interface KVVectorProps extends Omit<SS.GridProps, "display"> {
	direction: "row" | "column";
	pairs: [React.ReactNode, React.ReactNode][];
}

const KVVector: React.FC<KVVectorProps> = props => {

	const primary_vector = props.direction === "row" ? "gridTemplateRows" : "gridTemplateColumns";
	const secondary_vector = props.direction === "row" ? "gridTemplateColumns" : "gridTemplateRows";

	const styles: React.CSSProperties = {
		[primary_vector]: "auto auto",
		...SS.grid(props), // Very handy!
	}

	return (
	<RB.Box display="grid" style={styles}>
		{props.pairs.map(([key_node, value_node], index) => [
		<RB.Box
			key={`k${index}`}
			style={{
				[`grid${secondary_vector}Start`]: "" + (index + 1),
				[`grid${primary_vector}Start`]: "1",
			}}
		>{key_node}</RB.Box>
		,
		<RB.Box
			key={`v${index}`}
			style={{
				[`grid${secondary_vector}Start`]: "" + (index + 1),
				[`grid${primary_vector}Start`]: "2",
			}}
		>{value_node}</RB.Box>
		])}
	</RB.Box>
	);
}

export {
	KVVector,
};

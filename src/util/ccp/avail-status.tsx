
import * as React from "react";
import * as RB from "rebass";
import * as SS from "styled-system";

interface AgentAvailStatusProps extends SS.LayoutProps {
	agent?: connect.Agent;

	available_color?: string; // Default: "green".
	unavailable_color?: string; // Default: "red".
}

const AgentAvailStatus: React.FC<AgentAvailStatusProps> = props => {

	const [agent_avail, setAgentAvail] = React.useState(false);

	React.useEffect(() => {
		if (!props.agent) {
			setAgentAvail(false);
			return;
		}

		setAgentAvail(props.agent.getStatus().name === "Available")
		props.agent.onStateChange(change => {
			if (change.newState === "Available") return setAgentAvail(true);
			setAgentAvail(false);
		});
	}, [props.agent]);

	return (
	<RB.Box style={SS.layout(props)}>
		<RB.Text color={agent_avail ? (props.available_color || "green") : (props.unavailable_color || "red")}>
			{"⬤"}
		</RB.Text>
	</RB.Box>
	);
}

export {
	AgentAvailStatus,
};

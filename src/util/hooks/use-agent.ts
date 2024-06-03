
import * as React from "react";
import "amazon-connect-streams";

function useAgent(): connect.Agent | undefined {

	const [agent, setAgent] = React.useState<connect.Agent>();

	React.useEffect(() => {
		connect.agent(setAgent);
	}, []);

	return agent;
}

export {
	useAgent,
};

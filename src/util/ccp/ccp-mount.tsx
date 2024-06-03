
import * as React from "react";
import * as RB from "rebass";
import * as SS from "styled-system";

import "amazon-connect-streams";

interface CCPMountProps extends SS.LayoutProps {
	ccp_config: Omit<connect.InitCCPOptions, "softphone">;
	ccp_style?: "old" | "new";

	onAgentLogin?: (agent?: connect.Agent) => void;

	// Use this to mount the ccp using a different method that enables
	// the customer profiles and wisdom connect features.
	// https://github.com/amazon-connect/amazon-connect-streams/blob/master/Documentation.md#initialization-for-ccp-customer-profiles-and-wisdom
	customer_profiles_id?: string;
}

const CCPMount: React.FC<CCPMountProps> = props => {

	// CCP Iframe mount point:
	const ccp_mount_ref = React.useRef<HTMLDivElement | null>(null);

	// CCP Initialization and Auth observers.
	React.useEffect(() => {
		if (!ccp_mount_ref.current) return;
		if (ccp_mount_ref.current.querySelector("iframe")) return;

		// First time init:
		const init_options = {
			...props.ccp_config,
			softphone: { allowFramedSoftphone: true },
		}

		if (!props.customer_profiles_id) {
			// Original style:
			connect.core.initCCP(ccp_mount_ref.current, init_options);
		} else {
			// App Style:
			connect.agentApp.initApp("ccp", "ccp-mount", props.ccp_config.ccpUrl, {
				style: "height: 100%",
				ccpParams: init_options,
			});

			const customer_profile_url = init_options.ccpUrl.replace(/ccp-v2$/, "customerprofiles");
			connect.agentApp.initApp("customerprofiles", props.customer_profiles_id, customer_profile_url, {
				style: "height: 100%; width: 100%",
			});
		}

		const frame = ccp_mount_ref.current.querySelector("iframe");
		if (!frame) return console.warn("CCP iframe element failed to load!");

		// Listen for agent auth events, try to open login tab:
		let login_tab: Window | undefined | null = undefined;

		frame.addEventListener("load", () => {
			try { frame.contentWindow?.location.href } // This throws if the agent is not signed in.
			catch (err) {
				console.log("Detected that agent is currently signed out.");
				props.onAgentLogin?.();

				if (login_tab) return;
				login_tab = window.open(props.ccp_config.loginUrl, "Sign In", "left=0,top=0,width=1200,height=1200,menubar");
			}
		});

		connect.agent(agent => {
			props.onAgentLogin?.(agent);
			if (agent && login_tab) login_tab.close();
		});

	}, [ccp_mount_ref.current]);


	// CCP Old/New Style:
	const [ccp_style, setCCPStyle] = React.useState<{width?: string; height: string}>({height: "100%"});

	React.useEffect(() => {
		const style = { height: props.ccp_style === "old" ? "465px" : "100%"} as Record<"width"|"height", string>;
		if (props.ccp_style === "old") style.width = "320px";

		setCCPStyle(style);
	}, [props.ccp_style]);

	return (
	<RB.Box style={SS.layout(props)}>
		<div
			id="ccp-mount"
			key="ccp-mount"
			ref={ccp_mount_ref}
			style={ccp_style}
		/>
	</RB.Box>
	);
}

export {
	CCPMount
};

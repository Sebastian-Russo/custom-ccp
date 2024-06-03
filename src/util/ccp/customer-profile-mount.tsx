
import * as React from "react";
import * as RB from "rebass";
import * as SS from "styled-system";

import "amazon-connect-streams";

interface CustomerProfileMountProps extends SS.LayoutProps {
	customer_profile_url: string;
}

const CustomerProfileMount: React.FC<CustomerProfileMountProps> = props => {

	// CCP Iframe mount point:
	const profile_mount_ref = React.useRef<HTMLDivElement | null>(null);

	// CCP Initialization and Auth observers.
	React.useEffect(() => {
		if (!profile_mount_ref.current) return;
		if (profile_mount_ref.current.querySelector("iframe")) return;

		connect.agentApp.initApp("customerprofiles", "customer-profile-mount", props.customer_profile_url, { style: "height: 100%; width: 100%" });

		const frame = profile_mount_ref.current.querySelector("iframe");
		if (!frame) return console.warn("CCP iframe element failed to load!");

	}, [profile_mount_ref.current]);

	return (
	<RB.Box style={SS.layout(props)}>
		<div
			id="customer-profile-mount"
			key="customer-profile-mount"
			ref={profile_mount_ref}
			style={SS.layout(props)}
		/>
	</RB.Box>
	);
}

export {
	CustomerProfileMount,
};

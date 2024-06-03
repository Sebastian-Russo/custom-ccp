
import "amazon-connect-streams";
// import "amazon-connect-chatjs";
// import "amazon-connect-taskjs";

//--- Agent Utils ---\\

/**
 * Gets the current agent and returns him, otherwise returns
 * undefined.
 * @return {connect.Agent | undefined} The current agent, or undefined.
 */
function getCurrentAgent(): connect.Agent | undefined {
	let agent: connect.Agent | undefined;
	connect.agent(a => agent = a);
	return agent;
}

/**
 * Sets the currently logged in agent to 'Offline'
 * if possible. Otherwise a no-op.
 */
function setAgentToOffline() {
	const agent = getCurrentAgent();
	if (!agent) return console.debug("CustomCCP::ConnectUtil", "SetOffline: No agent was found.");

	const offline_state = agent.getAgentStates()
		.find(s => s.name === "Offline");

	if (!offline_state) return console.debug("CustomCCP::ConnectUtil", "SetOffline: Could not find an agent state: 'Offline'.");
	agent.setState(offline_state, {
		success: () => console.log("CustomCCP::ConnectUtil", "Agent is offline."),
		failure: () => console.log("CustomCCP::ConnectUtil", "Failed to change agent to offline."),
	});
}

/**
 * Sets the currently logged in agent to the desired
 * state, falling back to the secondary if the first
 * state change fails.
 * @param {string} state_name Name of state to change to.
 * @param {string} fallback   Optional fallback state to change to.
 */
function setAgentToState(state_name: string, fallback?: string): void {
	const agent = getCurrentAgent();
	if (!agent) return console.debug("CustomCCP::ConnectUtil", "No agent found.");

	const state = agent.getAgentStates()
		.find(s => s.name === state_name);

	if (!state && fallback) return setAgentToState(fallback);
	if (!state) return console.debug("CustomCCP::ConnectUtil", "No state found:", state_name);

	agent.setState(state, {
		success: () => console.debug("CustomCCP::ConnectUtil", "Agent state set to:", state_name),
		failure: () => console.debug("CustomCCP::ConnectUtil", "Failed to set agent state to:", state_name),
	});
}

/**
 * Subscribes a callback to be invoked with the agent transitions
 * into or out of the specified state. Returns void.
 * @param {"enter"|"exit"} type  Specifies if called on enter or exit.
 * @param {AgentState}     state The agent state to trigger the call on.
 * @param {() => void}     cb    The callback to be invoked.
 */
function onAgentStateTrans(type: "enter"|"exit", state: AgentState, cb: (trans: connect.AgentStateChange) => void) {
	const agent = getCurrentAgent();
	if (!agent) return console.debug("CustomCCP::ConnectUtil", "Cannot set an agent state transition callback with no current agent!");

	agent.onStateChange(state_trans => {
		if (type === "enter" && state_trans.newState === state) cb(state_trans);
		if (type === "exit" && state_trans.oldState === state) cb(state_trans);
	});
}

const CONNECT_AGENT_STATES = {
	offline: "Offline",
	available: "Available",
	pending_busy: "PendingBusy",
	busy: "Busy",
	acw: "AfterCallWork",
	lunch: "Lunch",
	brk: "Break"
} as const;

type AgentState = ValueOf<typeof CONNECT_AGENT_STATES>;

//--- Contact Utils ---\\

function getContactById(id: string): connect.Contact | undefined {
	return getCurrentAgent()
		?.getContacts()
		.find(ctc => ctc.getContactId() === id);
}

//--- Connection Utils ---\\

function createOutboundConnection(phone_number: string) {
	const ep = connect.Endpoint.byPhoneNumber(phone_number);
	getCurrentAgent()?.connect(ep);
}

//--- Callback Utils ---\\

// The unsubscribe method for connect is really quite
// unsatisfactory. This utility allows you to wrap your
// callback and then disable it later. It still is stuck
// on the event as a no-op, but it's better than just
// leaving it. Wish streams-api gave a way...
// Wondering if this is just the height of foolishness...

function makeDisablable<F extends (...args: any[]) => any>(f: F): F & {disable(): void} {
	let disabled = false;
	let wrapper: any = (...args: any[]) => {
		if (disabled) return;
		return f(...args);
	}

	wrapper.disable = () => disabled = true;
	return wrapper;
}

//--- Exports ---\\

export {
	getCurrentAgent,
	setAgentToState,
	setAgentToOffline,
	onAgentStateTrans,
	CONNECT_AGENT_STATES,

	getContactById,

	createOutboundConnection,

	makeDisablable,
	// Types:
	AgentState,
}

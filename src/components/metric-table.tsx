
import * as React from "react";
import * as RB from "rebass";
import * as RBF from "@rebass/forms";
import * as SS from "styled-system";

import { getRTMetricsForQueues } from "../api/api"

import * as Time from "./time";

interface RealtimeQueueMetricTableProps {
	queues: connect.Queue[];
}

interface QueueMetricItem {
	CONTACTS_IN_QUEUE: number;
	OLDEST_CONTACT_AGE: number;
}

type RTMReducer = (state: Record<string, QueueMetricItem>, action: (state: Record<string, QueueMetricItem>) => Record<string, QueueMetricItem>) => Record<string, QueueMetricItem>;
const applyReduction: RTMReducer = (state, action) => action(state);

const RealtimeQueueMetricTable: React.FC<RealtimeQueueMetricTableProps> = props => {

	const [queue_metrics, setQueueMetrics] = React.useReducer(applyReduction, {});

	// We gotta only show the top 5, by number of callers in queue, by request...
	const [queues, setQueues] = React.useState(props.queues);

	const [total_contacts, setTotalContacts] = React.useState(0);

	const [sort_type, setSortType] = React.useState<"QueueCount" | "QueueTime">("QueueTime");

	React.useEffect(() => {
		if (!props.queues || !props.queues.length) {
			setQueues([]);
			setQueueMetrics(() => ({}));
			return;
		}

		const pollForRTM = async () => {
			const rtm_resp = await getRTMetricsForQueues(props.queues.map(q => q.queueId.split("/").pop()!));
			if (!rtm_resp.success) return console.log("API getRTM call failed...");

			// console.log("Setting queue metrics:", rtm_resp.metrics);
			setQueueMetrics(() => rtm_resp.metrics);

			const all_rtm_resp = await getRTMetricsForQueues(undefined, "total");
			if (!all_rtm_resp.success) return console.log("API getRTM call failed...");

			setTotalContacts(Object.values(all_rtm_resp.metrics).map(metric => metric.CONTACTS_IN_QUEUE).reduce((sum, contacts) => sum + contacts, 0));
		}

		pollForRTM();

		const poll_token = setInterval(pollForRTM, 6000); return () => clearInterval(poll_token);
	}, [props.queues]);

	React.useEffect(() => {
		if (!queue_metrics) {
			setQueues(props.queues);
			return;
		};

		let sorted_queues: connect.Queue[] = [];
		if (sort_type === "QueueCount") {
			sorted_queues = [...props.queues].sort((q1, q2) => {
				const q1_id = q1.queueId.split("/").pop()!
				const q2_id = q2.queueId.split("/").pop()!
				if (queue_metrics[q1_id]?.CONTACTS_IN_QUEUE === undefined) return 0;
				if (queue_metrics[q2_id]?.CONTACTS_IN_QUEUE === undefined) return 0;
				if (queue_metrics[q2_id]?.CONTACTS_IN_QUEUE === queue_metrics[q1_id].CONTACTS_IN_QUEUE)
					return queue_metrics[q2_id].OLDEST_CONTACT_AGE - queue_metrics[q1_id].OLDEST_CONTACT_AGE
				return queue_metrics[q2_id].CONTACTS_IN_QUEUE - queue_metrics[q1_id].CONTACTS_IN_QUEUE;
			});
		}
		if (sort_type === "QueueTime") {
			sorted_queues = [...props.queues].sort((q1, q2) => {
				const q1_id = q1.queueId.split("/").pop()!
				const q2_id = q2.queueId.split("/").pop()!
				if (queue_metrics[q1_id]?.OLDEST_CONTACT_AGE === undefined) return 0;
				if (queue_metrics[q2_id]?.OLDEST_CONTACT_AGE === undefined) return 0;
				return queue_metrics[q2_id].OLDEST_CONTACT_AGE - queue_metrics[q1_id].OLDEST_CONTACT_AGE;
			});
		}

		setQueues(sorted_queues.slice(0, 5));
	}, [props.queues, queue_metrics, sort_type]);

	return (
	<Grid gridTemplateColumns="auto 1fr" gridTemplateRows={`repeat(${props.queues.length + 1} auto)`}>
		<RB.Flex ml="1px" alignItems="center" justifyContent="space-between" key='rtm-label' style={{gridColumnStart: 2, gridRowStart: 1}}>
			<RB.Text>Queue Time</RB.Text>
			<RB.Flex alignItems="center">
				{(sort_type === "QueueTime") && <RB.Text height="20px" lineHeight="12px" fontSize="25px">&larr;</RB.Text>}
				<RBF.Switch id="sorttoggle" checked={sort_type === "QueueCount"} onClick={() => {
					(sort_type === "QueueCount") ? setSortType("QueueTime") : setSortType("QueueCount");
				}} />
				{(sort_type === "QueueCount") && <RB.Text height="20px" lineHeight="12px" fontSize="25px">&rarr;</RB.Text>}
			</RB.Flex>
			<RB.Text>Queue Count</RB.Text>
		</RB.Flex>
		{queues.map((queue, index) => [
		<RB.Flex mr="6px" justifyContent="flex-end" alignItems="center" key={`rtm-qname-${queue.name}`} style={{gridColumnStart: 1, gridRowStart: index + 2}}>
		  <RB.Text>{queue.name}</RB.Text>
		</RB.Flex>,

		<RB.Box backgroundColor="#f2f2f2" key={`rtm-qdata-${queue.name}`} style={{gridColumnStart: 2, gridRowStart: index + 2, minWidth: "100px", display: "flex", flexDirection: "row"}}>
			<RB.Flex alignItems="center" my="2px" style={{backgroundColor: (index % 2 == 0 ? "#57BCFF" : "#FFFFFF"), height: "1.5em", width: "100%"}}>
				<RB.Text ml="4px" style={{whiteSpace: "nowrap"}}>
					{queue_metrics[queue.queueId.split("/").pop()!]?.OLDEST_CONTACT_AGE !== undefined ? Time.TimeFormat.milliToMMSS(queue_metrics[queue.queueId.split("/").pop()!]?.OLDEST_CONTACT_AGE * 1000, true) : "Data loading..."}
				</RB.Text>

				<RB.Text ml="4px" style={{whiteSpace: "nowrap", marginLeft: "auto"}}>
					{queue_metrics[queue.queueId.split("/").pop()!]?.OLDEST_CONTACT_AGE !== undefined ? `(${queue_metrics[queue.queueId.split("/").pop()!]?.CONTACTS_IN_QUEUE})` : "(0)"}
				</RB.Text>
			</RB.Flex>

		</RB.Box>
		])}
		<RB.Flex justifyContent="flex-end" key={`rtm-total`} style={{gridColumnStart: 2, gridRowStart: queues.length + 2}}>
			<RB.Text>Total In Queue ({total_contacts})</RB.Text>
		</RB.Flex>

	</Grid>
	);
}

const Grid: React.FC<SS.GridProps> = props => {

	const styles: React.CSSProperties = {
		...SS.grid(props),
	};

	return (
	<RB.Box display="grid" style={styles}>
		{props.children}
	</RB.Box>
	);
}

export {
	RealtimeQueueMetricTable,
};

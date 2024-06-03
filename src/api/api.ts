
import config from "../config.json";

type Success<T> = {
	success: false;
} | ({
	success: true;
} & T);

interface RTMObject {
	CONTACTS_IN_QUEUE: number;
	OLDEST_CONTACT_AGE: number;

	UpdatedAt?: string;
}

async function getRTMetricsForQueues(queue_ids: string[], type?: undefined, max_age?: number): Promise<Success<{metrics: Record<string, RTMObject>}>>;
async function getRTMetricsForQueues(queue_ids: undefined, type: "total", max_age?: number): Promise<Success<{metrics: Record<string, RTMObject>}>>;
async function getRTMetricsForQueues(queue_ids?: string[], type?: "total", max_age = 5): Promise<Success<{metrics: Record<string, RTMObject>}>> {
	const resp = await fetch(config.api.get_rtms, {
		method: "POST",
		body: JSON.stringify({
			queue_ids,
			type,
			max_age,
		}),
	});

	if (!resp.ok) return {success: false};
	const json = await resp.json();

	if (!json.metrics) return {success: false};

	for (let queue_id in json.metrics) {
		json.metrics[queue_id].CONTACTS_IN_QUEUE = +json.metrics[queue_id].CONTACTS_IN_QUEUE;
		json.metrics[queue_id].OLDEST_CONTACT_AGE = +json.metrics[queue_id].OLDEST_CONTACT_AGE;
	}

	return {
		success: true,
		metrics: json.metrics,
	};
}

export {
	getRTMetricsForQueues,
};

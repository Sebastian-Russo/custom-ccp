
/**
 * This object holds the scalar multipliers for
 * time durations.
 */
const DURATION = {
	milli: 1,

	second: 1000,
	minute: 1000 * 60,
	hour:   1000 * 60 * 60,
	day:    1000 * 60 * 60 * 24,
};

/**
 * Timer returns a promise that resolves to void after the
 * given number of milliseconds.
 * @param  {number}        millis Milliseconds to wait beofre resolving.
 * @return {Promise<void>}        A promise that resolves after the given
 *                                number of milliseconds.
 */
function timer(millis: number): Promise<void> {
	return new Promise(res => setTimeout(res, millis));
}

/**
 * Returns a function that can be used to convert between units specified
 * in the arguments. Use the DURATION object units as arguments.
 * @param  {number} old_unit Old unit scalar
 * @param  {number} new_unit New unit scalar
 * @return {(in_old: number) => number} A function which converts values from
 *                                      the old unit to the new unit.
 */
function convertUnit(old_unit: number, new_unit: number): (in_old: number) => number {
	return in_old => in_old * (new_unit / old_unit);
}

class Stopwatch {

	#started?: number;
	#ended?: number;

	/**
	 * Starts the stopwatch. Resets the watch if it
	 * was already running.
	 * @type {() => void}
	 */
	start = () => {
		this.#started = Date.now();
		this.#ended = undefined;
	}

	/**
	 * Ends the stopwatch. Throws if the stopwatch was
	 * never started. Returns the elapsed time of the
	 * watch.
	 * @type {() => number}
	 */
	end = () => {
		this.#ended = Date.now();
		return this.read();
	}

	/**
	 * Reads the time of the stopwatch. Throws if the
	 * stopwatch was never started or is still running.
	 * Returns the elapsed time of the watch.
	 * @type {() => number}
	 */
	read = () => {
		if (!this.#started) throw new Error("Cannot read stopwatch, it hasn't started yet.");
		if (this.#ended) return this.#ended - this.#started;
		return Date.now() - this.#started;
	}

	/**
	 * Resets the watch. After calling this the watch
	 * is back in a never started state.
	 * @type {() => void}
	 */
	reset = () => {
		this.#started = undefined;
		this.#ended = undefined;
	}

	/**
	 * Returns true iff the watch is currently running.
	 * @type {() => boolean}
	 */
	isRunning = () => {
		return this.#started && !this.#ended;
	}

	/**
	 * Returns true iff the watch has finished running.
	 * @type {() => boolean}
	 */
	isFinished = () => {
		return this.#started && this.#ended;
	}
}

class TimeFormat {

	/**
	 * Returns the given duration in milliseconds as a string in
	 * minutes:seconds format. Returns just seconds if the duration
	 * is less than one minute, unless second parameter is true.
	 * @param  {number}  millis    Duration in milliseconds to format.
	 * @param  {boolean} lead_zero If true, displays leading minutes even if zero.
	 * @return {string}            The formatted duration string in mm:ss format.
	 */
	static milliToMMSS(millis: number, lead_zero?: boolean): string {
		const seconds = Math.floor(millis / 1000);
		const minutes = Math.floor(seconds / 60);

		const seconds_past_minute = seconds - minutes*60;
		const leading_seconds = seconds_past_minute < 10
			? `0${seconds_past_minute}`
			: `${seconds_past_minute}`;

		if (minutes) return `${minutes}:${leading_seconds}`;
		if (lead_zero) return `00:${leading_seconds}`;
		return `${seconds_past_minute}`;
	}
}

export {
	DURATION,

	timer,
	convertUnit,

	Stopwatch,
	TimeFormat,
};

import EventDispatcher from "./EventDispatcher";
import { ValueOrDefault } from "./Engine";
import System from "./System";
import TimerEvent from "./TimerEvent";

class Timer extends EventDispatcher {
	constructor(interval, repeatCount) {
		super();

		/** Integer **/
		this.repeatCount = ValueOrDefault(repeatCount, 0);

		/** Number **/
		this.interval = ValueOrDefault(interval, 1000 / 60);

		/** Integer **/
		this.iterations = 0;

		/** Boolean **/
		this.isRunning = false;

		/** Timestamp **/
		this.lastTickTimestamp = performance.now();

		this.req = null;
		this.evt = new TimerEvent(TimerEvent.TICK, this.lastTickTimestamp, this.lastTickTimestamp);
		this.cb = this.onTimerCallback.asDelegate(this);
	}

	getRepeatCount() {
		return this.repeatCount;
	}

	setRepeatCount(value) {
		if (this.repeatCount != value) {
			this.repeatCount = value;

			if (this.isRunning && this.repeatCount <= this.iterations) {
				this.stop();
			}
		}
	}

	getInterval() {
		return this.interval;
	}

	setInterval(value) {
		if (this.interval != value) {
			this.interval = value;

			if (this.isRunning) {
				this.reset();
				this.start();
			}
		}
	}

	getIterations() {
		return this.iterations;
	}

	getIsRunning() {
		return this.isRunning;
	}

	reset() {
		if (this.isRunning) {
			this.stop();
		}

		this.iterations = 0;
		this.lastTickTimestamp = performance.now();
	}

	start() {
		this.lastTickTimestamp = performance.now();
		this.isRunning = true;
		this.requestNextSample();
	}

	stop() {
		if (!this.isRunning) {
			return;
		}

		this.isRunning = false;

		if (this.repeatCount == 0 || this.iterations === this.repeatCount) {
			this.dispatchEvent(new TimerEvent(TimerEvent.COMPLETE, performance.now(), this.lastTickTimestamp));
		}
	}

	onTimerCallback(t) {
		if (!this.isRunning) {
			return;
		}

		var delta = t - this.lastTickTimestamp;

		if (delta >= this.interval) {
			this.iterations++;

			this.evt.currentTickTime = t;
			this.evt.lastTickTime = this.lastTickTimestamp;

			this.dispatchEvent(this.evt);

			this.lastTickTimestamp = t - (delta % this.interval);
		}

		if (this.isRunning && (this.repeatCount === 0 || this.iterations < this.repeatCount)) {
			this.requestNextSample();
		}
		else {
			this.stop();
		}
	}

	requestNextSample() {
		this.req = System.requestAnimationFrame(this.cb);
	}
}

export default Timer;

import EventDispatcher from "./EventDispatcher";
import { ValueOrDefault, RequestAnimationFrame } from "./Engine";
import TimerEvent from "./TimerEvent";

class Timer extends EventDispatcher {
	constructor(interval, repeatCount) {
		super();

		/** Integer **/
		this.repeatCount = ValueOrDefault(repeatCount, 0);

		/** Number **/
		this.interval = ValueOrDefault(interval, 100);

		/** Integer **/
		this.iterations = 0;

		/** Boolean **/
		this.isRunning = false;

		/** Date **/
		this.lastTickTimestamp = 0;
		this.lastTick = 0;
		this.req = null;
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
		this.lastTickTimestamp = 0;
	}

	start() {
		this.lastTickTimestamp = new Date();
		this.isRunning = true;
		this.requestNextSample();
	}

	stop() {
		if (!this.isRunning) {
			return;
		}

		this.isRunning = false;

		if (this.repeatCount == 0 || this.iterations == this.repeatCount) {
			this.dispatchEvent(new TimerEvent(TimerEvent.COMPLETE, Date.now(), this.lastTickTimestamp));
		}
	}

	onTimerCallback(t) {
		if (!this.isRunning) {
			return;
		}

		var delta = t - this.lastTickTimestamp;
		var useTimeout = true;

		if (delta >= this.interval) {
			useTimeout = false;

			this.iterations++;
			this.dispatchEvent(new TimerEvent(TimerEvent.TICK, t, this.lastTickTimestamp));
			this.lastTickTimestamp = t;
		}

		if (this.isRunning && (this.repeatCount == 0 || this.iterations < this.repeatCount)) {
			delta = (this.interval - delta);

			if (useTimeout && delta < 16 && delta > 0) {
				var me = this;

				setTimeout(function () {
					me.cb((new Date() - 0));
				}, delta);
			}
			else {
				this.requestNextSample();
			}
		}
		else {
			this.stop();
		}
	}

	requestNextSample() {
		this.req = RequestAnimationFrame(this.cb, null);
	}
}

export default Timer;

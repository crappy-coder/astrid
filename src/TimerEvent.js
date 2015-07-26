import Event from "./Event";
import { ValueOrDefault } from "./Engine";

class TimerEvent extends Event {
	constructor(type, currentTickTime, lastTickTime, bubbles, cancelable) {
		super(type, bubbles, cancelable);

		this.currentTickTime = ValueOrDefault(currentTickTime, 0);
		this.lastTickTime = ValueOrDefault(lastTickTime, 0);
	}

	getTickTime() {
		return this.currentTickTime;
	}

	getLastTickTime() {
		return this.lastTickTime;
	}

	getTickDelta() {
		return (this.getTickTime() - this.getLastTickTime());
	}
}

Object.assign(TimerEvent, {
	TICK: "timerTick",
	COMPLETE: "timerComplete"
});

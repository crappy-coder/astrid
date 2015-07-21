import Event from "./Event";
import { ValueOrDefault } from "./Engine";

class TimerEvent extends Event {
	constructor(type, currentTickTime, lastTickTime, bubbles, cancelable) {
		super(type, bubbles, cancelable);

		this.currentTickTime = MoValueOrDefault(currentTickTime, 0);
		this.lastTickTime = MoValueOrDefault(lastTickTime, 0);
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

Object.assign(MoTimerEvent, {
	TICK: "timerTick",
	COMPLETE: "timerComplete"
});

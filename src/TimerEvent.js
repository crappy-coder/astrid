import Event from "./Event";

class TimerEvent extends Event {
	constructor(type, currentTickTime, lastTickTime, bubbles, cancelable) {
		super(type, bubbles, cancelable);

		this.currentTickTime = astrid.valueOrDefault(currentTickTime, 0);
		this.lastTickTime = astrid.valueOrDefault(lastTickTime, 0);
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

export default TimerEvent;

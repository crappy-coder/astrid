import Event from "./Event";
import { ValueOrDefault } from "./Engine";

class DeviceMotionEvent extends Event {
	constructor(type, acceleration, interval, bubbles, cancelable) {
		super(type, ValueOrDefault(bubbles, false), ValueOrDefault(cancelable, false));

		this.x = acceleration.x;
		this.y = acceleration.y;
		this.z = acceleration.z;
		this.interval = interval;
	}

	getX() {
		return this.x;
	}

	getY() {
		return this.y;
	}

	getZ() {
		return this.z;
	}

	getInterval() {
		return this.interval;
	}
}

DeviceMotionEvent.CHANGE = "deviceMotionChange";

export default DeviceMotionEvent;

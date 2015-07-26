import Event from "../Event";
import { ValueOrDefault } from "../Engine";

class GestureEvent extends Event {
	constructor(type, rotation, scale, bubbles, cancelable) {
		super(type, ValueOrDefault(bubbles, true), ValueOrDefault(cancelable, true));

		this.rotation = rotation;
		this.scale = scale;
	}

	getRotation() {
		return this.rotation;
	}

	getScale() {
		return this.scale;
	}
}

GestureEvent.GESTURE_START = "gestureStart";
GestureEvent.GESTURE_CHANGE = "gestureChange";
GestureEvent.GESTURE_END = "gestureEnd";

export default GestureEvent;

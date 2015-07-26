import Event from "../Event";
import { ValueOrDefault } from "../Engine";

class TouchEvent extends Event {
	constructor(type, touchPoints, scale, rotation, bubbles, cancelable) {
		super(type, ValueOrDefault(bubbles, true), ValueOrDefault(cancelable, true));

		this.points = touchPoints;
		this.scale = scale;
		this.rotation = rotation;
	}
	
	getScale() {
		return this.scale;
	}
	
	getRotation() {
		return this.rotation;
	}
	
	getAllTouches() {
		return this.points;
	}
}

Object.assign(TouchEvent, {
	TOUCH_START : "touchStart",
	TOUCH_END : "touchEnd",
	TOUCH_MOVE : "touchMove",
	TOUCH_CANCEL : "touchCancel"
});

export default TouchEvent;

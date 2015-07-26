import Event from "../Event";

class TouchEvent extends Event {
	constructor(type, touchPoints, scale, rotation, bubbles, cancelable) {
		super(type, MoValueOrDefault(bubbles, true), MoValueOrDefault(cancelable, true));

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

import Event from "./Event";

class FrameEvent extends Event {
	constructor(type, deltaTime, bubbles, cancelable) {
		super(type, bubbles, cancelable);

		this.deltaTime = deltaTime;
	}

	getDeltaTime() {
		return this.deltaTime;
	}
}

FrameEvent.ENTER = "enter";

export default FrameEvent;

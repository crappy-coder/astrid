import Event from "./Event";

class SourceEvent extends Event {
	constructor(type, bubbles, cancelable) {
		super(type, bubbles, cancelable);
	}
}

SourceEvent.READY = "sourceReady";
SourceEvent.CHANGE = "sourceChange";

export default SourceEvent;

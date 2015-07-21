import Event from "./Event";

class LoadEvent extends Event {
	constructor(type, bubbles, cancelable) {
		super(type, bubbles, cancelable);
	}
}

LoadEvent.SUCCESS = "loadSuccess";
LoadEvent.FAILURE = "loadFailure";

export default LoadEvent;

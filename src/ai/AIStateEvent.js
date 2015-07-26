import Event from "../Event";

class AIStateEvent extends Event {
	constructor(type, bubbles, cancelable) {
		super(type, bubbles, cancelable);
	}
}

AIStateEvent.ENTER = "aiStateEventEnter";
AIStateEvent.EXIT = "aiStateEventExit";

export default AIStateEvent;

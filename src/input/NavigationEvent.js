import Event from "../Event";
import { ValueOrDefault } from "../Engine";

class NavigationEvent extends Event {
	constructor(type, direction, targetFrom, targetTo, bubbles, cancelable) {
		super(type, bubbles, cancelable);

		this.direction = direction;
		this.targetFrom = ValueOrDefault(targetFrom, null);
		this.targetTo = ValueOrDefault(targetTo, null);
	}

	getDirection() {
		return this.direction;
	}

	getTargetFrom() {
		return this.targetFrom;
	}

	getTargetTo() {
		return this.targetTo;
	}
}

NavigationEvent.ENTER = "navigationEnter";
NavigationEvent.LEAVE = "navigationLeave";

export default NavigationEvent;

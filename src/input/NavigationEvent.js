import Event from "../Event";

class NavigationEvent extends Event {
	constructor(type, direction, targetFrom, targetTo, bubbles, cancelable) {
		super(type, bubbles, cancelable);

		this.direction = direction;
		this.targetFrom = astrid.valueOrDefault(targetFrom, null);
		this.targetTo = astrid.valueOrDefault(targetTo, null);
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

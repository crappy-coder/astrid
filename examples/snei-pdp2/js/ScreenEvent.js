import Event from "../../../src/Event"

class ScreenEvent extends Event {
	constructor(type, bubbles, cancelable) {
		super(type, bubbles, cancelable);
	}
}

ScreenEvent.PRODUCT_COUNT_CHANGED = "productCountChanged";

export default ScreenEvent;
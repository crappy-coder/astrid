import ScreenEvent from "./ScreenEvent"
import ScreenNavigationDirection from "./ScreenNavigationDirection"

class ScreenNavigationEvent extends ScreenEvent {
	constructor(type, direction, bubbles, cancelable) {
		super(type, bubbles, cancelable);

		this.direction = direction;
	}
}

ScreenNavigationEvent.NAVIGATION_BEGIN = "screenNavigationBegin";
ScreenNavigationEvent.NAVIGATION_END = "screenNavigationEnd";

export default ScreenNavigationEvent;
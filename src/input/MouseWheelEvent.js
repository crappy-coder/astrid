import MouseEvent from "./MouseEvent";
import MouseButton from "./MouseButton";
import MouseWheelDirection from "./MouseWheelDirection";

class MouseWheelEvent extends MouseEvent {
	constructor(type, delta, x, y, modifiers, bubbles, cancelable) {
		super(type, x, y, MouseButton.Middle, modifiers, bubbles, cancelable);

		this.delta = delta;
		this.direction = (delta > 0 ? MouseWheelDirection.Down : MouseWheelDirection.Up);
	}
}

export default MouseWheelEvent;

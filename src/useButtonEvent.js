import MouseEvent from "./useEvent";
import { ValueOrDefault } from "./Engine";

class MouseButtonEvent extends MouseEvent {
	constructor(type, button, pressed, x, y, clickCount, modifiers, bubbles, cancelable) {
		super(type, x, y, button, modifiers, bubbles, cancelable);

		this.mouseButton = button;
		this.isDown = pressed;
		this.clickCount = ValueOrDefault(clickCount, 1);
	}
}

export default MouseButtonEvent;

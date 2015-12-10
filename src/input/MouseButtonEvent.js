import MouseEvent from "./MouseEvent";

class MouseButtonEvent extends MouseEvent {
	constructor(type, button, pressed, x, y, clickCount, modifiers, bubbles, cancelable) {
		super(type, x, y, button, modifiers, bubbles, cancelable);

		this.mouseButton = button;
		this.isDown = pressed;
		this.clickCount = astrid.valueOrDefault(clickCount, 1);
	}
}

export default MouseButtonEvent;

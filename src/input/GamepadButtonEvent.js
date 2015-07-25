import GamepadEvent from "./GamepadEvent";

class GamepadButtonEvent extends GamepadEvent {
	constructor(type, index, button, isDown, timestamp, bubbles, cancelable) {
		super(type, index, bubbles, cancelable);

		this.button = button;
		this.timestamp = timestamp;
		this.isDown = MoValueOrDefault(isDown, false);
	}

	getIsDown() {
		return this.isDown;
	}

	getTimestamp() {
		return this.timestamp;
	}

	getButton() {
		return this.button;
	}
}

GamepadButtonEvent.DOWN = "gamepadButtonDown";
GamepadButtonEvent.UP = "gamepadButtonUp";
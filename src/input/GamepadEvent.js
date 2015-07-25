import Event from "./../Event";

class GamepadEvent extends Event {
	constructor(type, index, bubbles, cancelable) {
		super(type, bubbles, cancelable);

		this.index = index;
	}

	getIndex() {
		return this.index;
	}
}

GamepadEvent.CONNECTED = "connected";
GamepadEvent.DISCONNECTED = "disconnected";

export default GamepadEvent;

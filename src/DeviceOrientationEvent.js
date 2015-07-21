import Event from "./Event";
import { ValueOrDefault } from "./Engine.js";

class DeviceOrientationEvent extends Event {
	constructor(type, alpha, beta, gamma, bubbles, cancelable) {
		super(type, ValueOrDefault(bubbles, false), ValueOrDefault(cancelable, false));

		this.alpha = alpha;
		this.beta = beta;
		this.gamma = gamma;
	}

	getAlpha() {
		return this.alpha;
	}

	getBeta() {
		return this.beta;
	}

	getGamma() {
		return this.gamma;
	}
}

DeviceOrientationEvent.CHANGE = "deviceOrientationChange";

export default DeviceOrientationEvent;

import EasingFunction from "./EasingFunction";

class CircEase extends EasingFunction {
	constructor(easingModeOrPercent) {
		super(easingModeOrPercent);
	}

	easeIn(t) {
		return -(Math.sqrt(1 - t * t) - 1);
	}

	easeOut(t) {
		return Math.sqrt(1 - (t = t - 1) * t);
	}
}

export default CircEase;

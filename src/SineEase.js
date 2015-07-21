import EasingFunction from "./EasingFunction";

class SineEase extends EasingFunction {
	constructor(easingModeOrPercent) {
		super(easingModeOrPercent);
	}

	easeIn(t) {
		return 1 - Math.cos(t * Math.PI / 2);
	}

	easeOut(t) {
		return Math.sin(t * Math.PI / 2);
	}
}

export default SineEase;

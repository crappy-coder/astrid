import EasingFunction from "./EasingFunction";

class ExpoEase extends EasingFunction {
	constructor(easingModeOrPercent) {
		super(easingModeOrPercent);
	}

	easeIn(t) {
		return (t == 0) ? t : Math.pow(2, 10 * (t - 1)) - 0.001;
	}
	
	easeOut(t) {
		return (t == 1) ? t : 1.001 * (-Math.pow(2, -10 * t) + 1);
	}
}

export default ExpoEase;

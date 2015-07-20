import PowerEase from "./PowerEase";

class QuintEase extends PowerEase {
	constructor(easingModeOrPercent) {
		super(easingModeOrPercent, 5);
	}
}

export default QuintEase;

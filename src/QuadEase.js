import PowerEase from "./PowerEase";

class QuadEase extends PowerEase {
	constructor(easingModeOrPercent) {
		super(easingModeOrPercent, 2);
	}
}

export default QuadEase;

import PowerEase from "./PowerEase";

class CubicEase extends PowerEase {
	constructor(easingModeOrPercent) {
		super(easingModeOrPercent, 3);
	}
}

export default CubicEase;

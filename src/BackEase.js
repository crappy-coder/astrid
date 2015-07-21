import EasingFunction from "./EasingFunction";

class BackEase extends EasingFunction {
	constructor(easingModeOrPercent, amplitude) {
		super(easingModeOrPercent);

		this.amplitude = MoValueOrDefault(amplitude, 1.2);
	}
	
	getAmplitude() {
		return this.amplitude;
	}
	
	setAmplitude(value) {
		this.amplitude = value;
	}
	
	easeIn(t) {
		return (t * t * ((this.getAmplitude() + 1) * t - this.getAmplitude()));
	}
	
	easeOut(t) {
		return (1 - (t = 1 - t) * t * ((this.getAmplitude() + 1) * t - this.getAmplitude()));
	}
}

export default BackEase;

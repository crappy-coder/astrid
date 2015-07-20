import { ValueOrDefault } from "./Engine";

class EasingFunction {
	constructor(easingModeOrPercent) {
	
		/** MoEasingMode / Number (0.0 - 1.0) **/
		this.easingPercent = ValueOrDefault(easingModeOrPercent, MoEasingMode.Out);
	}
	
	getEasingModeOrPercent() {
		return this.easingPercent;
	}
	
	setEasingModeOrPercent(value) {
		this.easingPercent = value;
	}
	
	ease(t) {
		var easeOutValue = 1 - this.easingPercent;
		
		if(t <= this.easingPercent && this.easingPercent > 0)
			return this.easingPercent * this.easeIn(t / this.easingPercent);

		return this.easingPercent + easeOutValue * this.easeOut((t - this.easingPercent) / easeOutValue);
	}
	
	easeIn(t) {
		return t;
	}
	
	easeOut(t) {
		return t;
	}
}

export default EasingFunction;

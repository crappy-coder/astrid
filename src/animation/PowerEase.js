import EasingFunction from "./EasingFunction";
import { ValueOrDefault } from "./../Engine";

class PowerEase extends EasingFunction {
	constructor(easingModeOrPercent, pow) {
		super(easingModeOrPercent);
		
		this.pow = ValueOrDefault(pow, 2);
	}
	
	getPow() {
		return this.pow;
	}
	
	setPow(value) {
		this.pow = value;
	}

	easeIn(t) {
		if(t < 0)
			return 0;
		
		if(t > 1)
			return 1;

		return Math.pow(t, this.getPow());
	}
	
	easeOut(t) {
		if(t < 0)
			return 0;
		
		if(t > 1)
			return 1;

		return 1 - Math.pow(1 - t, this.getPow());
	}
}

export default PowerEase;

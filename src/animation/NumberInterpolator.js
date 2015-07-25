import Interpolator from "./../Interpolator";

class NumberInterpolator extends Interpolator {
	constructor() {
		super();
	}

	interpolate(fraction, startValue, endValue) {
		if (fraction == 0) {
			return startValue;
		}
		else if (fraction == 1) {
			return endValue;
		}

		return startValue + (fraction * (endValue - startValue));
	}

	increment(baseValue, incrementValue) {
		return baseValue + incrementValue;
	}

	decrement(baseValue, decrementValue) {
		return baseValue - decrementValue;
	}

	static getInstance() {
		if (NumberInterpolator.Instance == null) {
			NumberInterpolator.Instance = new NumberInterpolator();
		}

		return NumberInterpolator.Instance;
	}
}

export default NumberInterpolator;

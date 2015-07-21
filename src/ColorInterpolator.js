import Interpolator from "./Interpolator";
import Color from "./Color";
import ColorInterpolator from "./ColorInterpolator";

class ColorInterpolator extends Interpolator {
	constructor() {
		super();
	}

	interpolate(fraction, startValue, endValue) {
		if (fraction == 0) {
			return startValue;
		} else if (fraction == 1) {
			return endValue;
		}

		var f = Math.min(1, Math.max(0, fraction));

		return new Color(
			startValue.r + (f * (endValue.r - startValue.r)),
			startValue.g + (f * (endValue.g - startValue.g)),
			startValue.b + (f * (endValue.b - startValue.b)), 1);
	}

	increment(baseValue, incrementValue) {
		return new Color(
			Math.min(baseValue.r + incrementValue.r, 1.0),
			Math.min(baseValue.g + incrementValue.g, 1.0),
			Math.min(baseValue.b + incrementValue.b, 1.0), 1);
	}

	decrement(baseValue, decrementValue) {
		return new Color(
			Math.min(baseValue.r - incrementValue.r, 0),
			Math.min(baseValue.g - incrementValue.g, 0),
			Math.min(baseValue.b - incrementValue.b, 0), 1);
	}

	static getInstance() {
		if (ColorInterpolator.Instance == null) {
			ColorInterpolator.Instance = new ColorInterpolator();
		}

		return ColorInterpolator.Instance;
	}
}

export default ColorInterpolator;

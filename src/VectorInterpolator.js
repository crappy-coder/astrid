import NumberInterpolator from "./NumberInterpolator";
import Vector2D from "./Vector2D";

class VectorInterpolator extends Interpolator {
	constructor() {
		super();

		this.numberInterpolator = NumberInterpolator.getInstance();
	}

	interpolate(fraction, startValue, endValue) {
		if (fraction == 0) {
			return startValue;
		}
		else if (fraction == 1) {
			return endValue;
		}

		return new Vector2D(
				this.numberInterpolator.interpolate(fraction, startValue.x, endValue.x),
				this.numberInterpolator.interpolate(fraction, startValue.y, endValue.y)
		);
	}

	increment(baseValue, incrementValue) {
		return new Vector2D(
				this.numberInterpolator.increment(baseValue.x, incrementValue.x),
				this.numberInterpolator.increment(baseValue.y, incrementValue.y));
	}

	decrement(baseValue, decrementValue) {
		return new Vector2D(
				this.numberInterpolator.decrement(baseValue.x, decrementValue.x),
				this.numberInterpolator.decrement(baseValue.y, decrementValue.y)
		);
	}

	static getInstance() {
		if (VectorInterpolator.Instance == null) {
			VectorInterpolator.Instance = new VectorInterpolator();
		}

		return VectorInterpolator.Instance;
	}
}

export default VectorInterpolator;

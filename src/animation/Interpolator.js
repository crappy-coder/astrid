class Interpolator {
	constructor() {}
	
	/** override **/
	interpolate(fraction, startValue, endValue) {}
	
	/** override **/
	increment(baseValue, incrementValue) {}
	
	/** override **/
	decrement(baseValue, decrementValue) {}
}

export default Interpolator;

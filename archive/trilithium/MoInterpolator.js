MoInterpolator = Class.create({
	initialize : function() { },
	
	/** override **/
	interpolate : function(fraction, startValue, endValue) {
		return null;
	},
	
	/** override **/
	increment : function(baseValue, incrementValue) {
		return null;
	},
	
	/** override **/
	decrement : function(baseValue, decrementValue) {
		return null;
	}
});

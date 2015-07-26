MoColorInterpolator = Class.create(MoInterpolator, {
	initialize : function($super) { 
		$super();
	},
	
	interpolate : function(fraction, startValue, endValue) {
		if(fraction == 0)
			return startValue;
		else if(fraction == 1)
			return endValue;
		
		var f = Math.min(1, Math.max(0, fraction));
		
		return new MoColor(
			startValue.r + (f * (endValue.r - startValue.r)),
			startValue.g + (f * (endValue.g - startValue.g)),
			startValue.b + (f * (endValue.b - startValue.b)), 1);
	},

	increment : function(baseValue, incrementValue) {
		return new MoColor(
			Math.min(baseValue.r + incrementValue.r, 1.0),
			Math.min(baseValue.g + incrementValue.g, 1.0),
			Math.min(baseValue.b + incrementValue.b, 1.0), 1);
	},
	
	decrement : function(baseValue, decrementValue) {
		return new MoColor(
			Math.min(baseValue.r - incrementValue.r, 0),
			Math.min(baseValue.g - incrementValue.g, 0),
			Math.min(baseValue.b - incrementValue.b, 0), 1);		
	}
});

Object.extend(MoColorInterpolator, {
	Instance : null,
	
	getInstance : function() {
		if(MoColorInterpolator.Instance == null)
			MoColorInterpolator.Instance = new MoColorInterpolator();
		
		return MoColorInterpolator.Instance;
	}
});

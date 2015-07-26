MoNumberInterpolator = Class.create(MoInterpolator, {
	initialize : function($super) { 
		$super();
	},
	
	interpolate : function(fraction, startValue, endValue) {
		if(fraction == 0)
			return startValue;
		else if(fraction == 1)
			return endValue;
		
		return startValue + (fraction * (endValue - startValue));
	},

	increment : function(baseValue, incrementValue) {
		return baseValue + incrementValue;
	},
	
	decrement : function(baseValue, decrementValue) {
		return baseValue - decrementValue;
	}
});

Object.extend(MoNumberInterpolator, {
	Instance : null,
	
	getInstance : function() {
		if(MoNumberInterpolator.Instance == null)
			MoNumberInterpolator.Instance = new MoNumberInterpolator();
		
		return MoNumberInterpolator.Instance;
	}
});

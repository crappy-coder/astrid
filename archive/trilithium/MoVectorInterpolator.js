MoVectorInterpolator = Class.create(MoInterpolator, {
	initialize : function($super) { 
		$super();
		
		this.numberInterpolator = MoNumberInterpolator.getInstance();
	},
	
	interpolate : function(fraction, startValue, endValue) {
		if(fraction == 0)
			return startValue;
		else if(fraction == 1)
			return endValue;

		return new MoVector2D(
			this.numberInterpolator.interpolate(fraction, startValue.x, endValue.x),
			this.numberInterpolator.interpolate(fraction, startValue.y, endValue.y));
	},

	increment : function(baseValue, incrementValue) {
		return new MoVector2D(
			this.numberInterpolator.increment(baseValue.x, incrementValue.x),
			this.numberInterpolator.increment(baseValue.y, incrementValue.y));	
	},
	
	decrement : function(baseValue, decrementValue) {
		return new MoVector2D(
			this.numberInterpolator.decrement(baseValue.x, incrementValue.x),
			this.numberInterpolator.decrement(baseValue.y, incrementValue.y));	
	}
});

Object.extend(MoVectorInterpolator, {
	Instance : null,
	
	getInstance : function() {
		if(MoVectorInterpolator.Instance == null)
			MoVectorInterpolator.Instance = new MoVectorInterpolator();
		
		return MoVectorInterpolator.Instance;
	}
});

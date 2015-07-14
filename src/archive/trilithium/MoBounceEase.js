MoBounceEase = Class.create(MoEasingFunction, {
	initialize : function($super, easingModeOrPercent) {
		$super(easingModeOrPercent);
	},
	
	easeIn : function(t) {
		return 1 - this.easeOut(1 - t);
	},
	
	easeOut : function(t) {
		if(t < (1 / 2.75))
			return 7.5625 * t * t;
		else if(t < (2 / 2.75))
			return (7.5625 * (t -= (1.5 / 2.75)) * t + .75);
		else if(t < (2.5 / 2.75))
			return (7.5625 * (t -= (2.25/2.75)) * t + .9375);
		else
			return (7.5625 * (t -= (2.625/2.75)) * t + .984375);
	}
});
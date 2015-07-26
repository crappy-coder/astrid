MoCircEase = Class.create(MoEasingFunction, {
	initialize : function($super, easingModeOrPercent) {
		$super(easingModeOrPercent);
	},

	easeIn : function(t) {
		return -(Math.sqrt(1 - t * t) - 1);
	},
	
	easeOut : function(t) {		
		return Math.sqrt(1 - (t = t - 1) * t);
	}
});
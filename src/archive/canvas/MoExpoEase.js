MoExpoEase = Class.create(MoEasingFunction, {
	initialize : function($super, easingModeOrPercent) {
		$super(easingModeOrPercent);
	},

	easeIn : function(t) {
		return (t == 0) ? t : Math.pow(2, 10 * (t - 1)) - 0.001;
	},
	
	easeOut : function(t) {		
		return (t == 1) ? t : 1.001 * (-Math.pow(2, -10 * t) + 1);
	}
});
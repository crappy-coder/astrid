MoSineEase = Class.create(MoEasingFunction, {
	initialize : function($super, easingModeOrPercent) {
		$super(easingModeOrPercent);
	},
	
	easeIn : function(t) {
		return 1 - Math.cos(t * Math.PI / 2);
	},
	
	easeOut : function(t) {
		return Math.sin(t * Math.PI / 2);
	}
});
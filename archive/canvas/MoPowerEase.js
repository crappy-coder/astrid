MoPowerEase = Class.create(MoEasingFunction, {
	initialize : function($super, easingModeOrPercent, pow) {
		$super(easingModeOrPercent);
		
		this.pow = MoValueOrDefault(pow, 2);
	},
	
	getPow : function() {
		return this.pow;
	},
	
	setPow : function(value) {
		this.pow = value;
	},

	easeIn : function(t) {
		if(t < 0)
			return 0;
		
		if(t > 1)
			return 1;

		return Math.pow(t, this.getPow());
	},
	
	easeOut : function(t) {
		if(t < 0)
			return 0;
		
		if(t > 1)
			return 1;

		return 1 - Math.pow(1 - t, this.getPow());
	}
});
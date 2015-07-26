MoEasingFunction = Class.create({
	initialize : function(easingModeOrPercent) {
	
		/** MoEasingMode / Number (0.0 - 1.0) **/
		this.easingPercent = MoValueOrDefault(easingModeOrPercent, MoEasingMode.Out);
	},
	
	getEasingModeOrPercent : function() {
		return this.easingPercent;
	},
	
	setEasingModeOrPercent : function(value) {
		this.easingPercent = value;
	},
	
	ease : function(t) {	
		var easeOutValue = 1 - this.easingPercent;
		
		if(t <= this.easingPercent && this.easingPercent > 0)
			return this.easingPercent * this.easeIn(t / this.easingPercent);

		return this.easingPercent + easeOutValue * this.easeOut((t - this.easingPercent) / easeOutValue);
	},
	
	easeIn : function(t) {
		return t;
	},
	
	easeOut : function(t) {
		return t;
	}
});
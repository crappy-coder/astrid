MoDeviceOrientationEvent = Class.create(MoEvent, {
	initialize : function($super, type, alpha, beta, gamma, bubbles, cancelable) {
		$super(type, MoValueOrDefault(bubbles, false), MoValueOrDefault(cancelable, false));
		
		this.alpha = alpha;
		this.beta = beta;
		this.gamma = gamma;
	},
	
	getAlpha : function() {
		return this.alpha;
	},
	
	getBeta : function() {
		return this.beta;
	},
	
	getGamma : function() {
		return this.gamma;
	}
});

Object.extend(MoDeviceOrientationEvent, {
	CHANGE : "deviceOrientationChange"
});
MoBackEase = Class.create(MoEasingFunction, {
	initialize : function($super, easingModeOrPercent, amplitude) {
		$super(easingModeOrPercent);

		this.amplitude = MoValueOrDefault(amplitude, 1.2);
	},
	
	getAmplitude : function() {
		return this.amplitude;
	},
	
	setAmplitude : function(value) {
		this.amplitude = value;
	},
	
	easeIn : function(t) {
		return (t * t * ((this.getAmplitude() + 1) * t - this.getAmplitude()));
	},
	
	easeOut : function(t) {		
		return (1 - (t = 1 - t) * t * ((this.getAmplitude() + 1) * t - this.getAmplitude()));
	}
});
MoElasticEase = Class.create(MoEasingFunction, {
	initialize : function($super, easingModeOrPercent, amplitude, period) {
		$super(easingModeOrPercent);
		
		this.amplitude = MoValueOrDefault(amplitude, 1);
		
		this.period = MoValueOrDefault(period, 0.45);
	},
	
	getAmplitude : function() {
		return this.amplitude;
	},
	
	setAmplitude : function(value) {
		this.amplitude = value;
	},
	
	getPeriod : function() {
		return this.period;
	},
	
	setPeriod : function(value) {
		this.period = value;
	},

	ease : function(t) {
		var b = 0;
		var c = 1;
		var d = 1;
		var a = this.getAmplitude();
		var p = this.getPeriod();

		if(t == 0)
			return b;

		if((t /= d) == 1)
			return b + c;

		if(!p)
			p = d * 0.3;

		var s;

		if(!a || a < Math.abs(c))
		{
			a = c;
			s = p / 4;
		}
		else
		{
			s = p / (2 * Math.PI) * Math.asin(c / a);
		}

		return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
	}
});
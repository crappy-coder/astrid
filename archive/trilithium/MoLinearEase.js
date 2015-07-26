MoLinearEase = Class.create({
	initialize : function(easeInFraction, easeOutFraction) {
		this.easeInFraction = MoValueOrDefault(easeInFraction, 0);
		this.easeOutFraction = MoValueOrDefault(easeOutFraction, 0);
	},
	
	getEaseInFraction : function() {
		return this.easeInFraction;
	},
	
	setEaseInFraction : function(value) {
		this.easeInFraction = value;
	},
	
	getEaseOutFraction : function() {
		return this.easeOutFraction;
	},
	
	setEaseOutFraction : function(value) {
		this.easeOutFraction = value;
	},
	
	ease : function(t) {
		if(this.easeInFraction == 0 && this.easeOutFraction == 0)
			return t;
		
		var runRate = 1 / (1 - this.easeInFraction / 2 - this.easeOutFraction / 2);
		
		if(t < this.easeInFraction)
			return t * runRate * (t / this.easeInFraction) / 2;
		
		if(t > (1 - this.easeOutFraction))
		{
			var decTime = t - (1 - this.easeOutFraction);
			var decProportion = decTime / this.easeOutFraction;
			
			return runRate * (1 - this.easeInFraction / 2 - this.easeOutFraction + decTime * (2 - decProportion) / 2);
		}
		
		return runRate * (t - this.easeInFraction / 2);
	}
});
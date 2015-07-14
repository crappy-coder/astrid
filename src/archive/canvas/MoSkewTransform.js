MoSkewTransform = Class.create(MoTransform, {
	initialize : function($super, skewX, skewY, centerX, centerY) {		
		$super();
		
		this.setSkewX(MoValueOrDefault(skewX, 0));
		this.setSkewY(MoValueOrDefault(skewY, 0));
		this.setCenterX(MoValueOrDefault(centerX, 0));
		this.setCenterY(MoValueOrDefault(centerY, 0));
	},
	
	initializeAnimatablePropertiesCore : function($super) {
		$super();
		
		this.enableAnimatableProperty("skewX", this.getSkewX, this.setSkewX, MoPropertyOptions.AffectsMeasure | MoPropertyOptions.AffectsLayout);
		this.enableAnimatableProperty("skewY", this.getSkewY, this.setSkewY, MoPropertyOptions.AffectsMeasure | MoPropertyOptions.AffectsLayout);
		this.enableAnimatableProperty("centerX", this.getCenterX, this.setCenterX, MoPropertyOptions.AffectsMeasure | MoPropertyOptions.AffectsLayout);
		this.enableAnimatableProperty("centerY", this.getCenterY, this.setCenterY, MoPropertyOptions.AffectsMeasure | MoPropertyOptions.AffectsLayout);
	},

	getValue : function() {
		var mx = new MoMatrix2D();
		var hasCenterPoint = (this.getCenterX() != 0 || this.getCenterY() != 0);
		
		if(hasCenterPoint)
			mx.translate(-this.getCenterX(), -this.getCenterY());
		
		mx.skew(this.getSkewX(), this.getSkewY());
		
		if(hasCenterPoint)
			mx.translate(this.getCenterX(), this.getCenterY());
			
		return mx;
	},
	
	getSkewX : function() {
		return this.getPropertyValue("skewX");
	},
	
	setSkewX : function(value) {
		this.setPropertyValue("skewX", value);
	},
	
	getSkewY : function() {
		return this.getPropertyValue("skewY");
	},
	
	setSkewY : function(value) {
		this.setPropertyValue("skewY", value);
	},
	
	getCenterX : function() {
		return this.getPropertyValue("centerX");
	},
	
	setCenterX : function(value) {
		this.setPropertyValue("centerX", value);
	},
	
	getCenterY : function() {
		return this.getPropertyValue("centerY");
	},
	
	setCenterY : function(value) {
		this.setPropertyValue("centerY", value);
	},

	isEqualTo : function(other) {
		return (this.getCenterX() == other.getCenterX() &&
				this.getCenterY() == other.getCenterY() &&
				this.getSkewX() == other.getSkewX() &&
				this.getSkewY() == other.getSkewY());
	}
});
	
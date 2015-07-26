MoGeneralTransform = Class.create(MoTransform, {
	initialize : function($super) {		
		$super();
		
		this.setCenterX(0);
		this.setCenterY(0);
		this.setX(0);
		this.setY(0);
		this.setSkewX(0);
		this.setSkewY(0);
		this.setScaleX(1);
		this.setScaleY(1);
		this.setRotation(0);
	},

	initializeAnimatablePropertiesCore : function($super) {
		$super();
		
		this.enableAnimatableProperty("x", this.getX, this.setX, MoPropertyOptions.AffectsLayout | MoPropertyOptions.AffectsMeasure);
		this.enableAnimatableProperty("y", this.getY, this.setY, MoPropertyOptions.AffectsLayout | MoPropertyOptions.AffectsMeasure);
		this.enableAnimatableProperty("centerX", this.getCenterX, this.setCenterX, MoPropertyOptions.AffectsLayout | MoPropertyOptions.AffectsMeasure);
		this.enableAnimatableProperty("centerY", this.getCenterY, this.setCenterY, MoPropertyOptions.AffectsLayout | MoPropertyOptions.AffectsMeasure);
		this.enableAnimatableProperty("scaleX", this.getScaleX, this.setScaleX, MoPropertyOptions.AffectsLayout | MoPropertyOptions.AffectsMeasure);
		this.enableAnimatableProperty("scaleY", this.getScaleY, this.setScaleY, MoPropertyOptions.AffectsLayout | MoPropertyOptions.AffectsMeasure);
		this.enableAnimatableProperty("skewX", this.getSkewX, this.setSkewX, MoPropertyOptions.AffectsLayout | MoPropertyOptions.AffectsMeasure);
		this.enableAnimatableProperty("skewY", this.getSkewY, this.setSkewY, MoPropertyOptions.AffectsLayout | MoPropertyOptions.AffectsMeasure);
		this.enableAnimatableProperty("rotation", this.getRotation, this.setRotation, MoPropertyOptions.AffectsLayout | MoPropertyOptions.AffectsMeasure);
	},

	getValue : function() {
		var mx = new MoMatrix2D();
		var hasCenterPoint = (this.getCenterX() != 0 || this.getCenterY() != 0);

		if(this.getScaleX() != 1 || this.getScaleY() != 1)
			mx.scaleAt(this.getScaleX(), this.getScaleY(), this.getCenterX(), this.getCenterY());

		if(this.getSkewX() != 0 || this.getSkewY() != 0)
		{
			if(hasCenterPoint)
				mx.translate(-this.getCenterX(), -this.getCenterY());

			mx.skew(this.getSkewX(), this.getSkewY());

			if(hasCenterPoint)
				mx.translate(this.getCenterX(), this.getCenterY());
		}

		if(this.getRotation() != 0)
			mx.rotateAt(this.getRotation(), this.getCenterX(), this.getCenterY());

		if(this.getX() != 0 || this.getY() != 0)
			mx.translate(this.getX(), this.getY());

		return mx;
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
	
	getX : function() {
		return this.getPropertyValue("x");
	},
	
	setX : function(value) {
		this.setPropertyValue("x", value);
	},
	
	getY : function() {
		return this.getPropertyValue("y");
	},
	
	setY : function(value) {
		this.setPropertyValue("y", value);
	},
	
	getScaleX : function() {
		return this.getPropertyValue("scaleX");
	},
	
	setScaleX : function(value) {
		this.setPropertyValue("scaleX", value);
	},
	
	getScaleY : function() {
		return this.getPropertyValue("scaleY");
	},
	
	setScaleY : function(value) {
		this.setPropertyValue("scaleY", value);
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
	
	getRotation : function() {
		return this.getPropertyValue("rotation");
	},
	
	setRotation : function(value) {
		this.setPropertyValue("rotation", value);
	},

	isEqualTo : function($super, other) {
		return (this.getCenterX() == other.getCenterX() &&
				this.getCenterY() == other.getCenterY() &&
				this.getX() == other.getX() &&
				this.getY() == other.getY() &&
				this.getSkewX() == other.getSkewX() &&
				this.getSkewY() == other.getSkewY() &&
				this.getScaleX() == other.getScaleX() &&
				this.getScaleY() == other.getScaleY() &&
				this.getRotation() == other.getRotation());
	}
});
	
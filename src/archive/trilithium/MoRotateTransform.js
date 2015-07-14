MoRotateTransform = Class.create(MoTransform, {
	initialize : function($super, angle, centerX, centerY) {
		$super();
		
		this.setAngle(MoValueOrDefault(angle, 0));
		this.setCenterX(MoValueOrDefault(centerX, 0));
		this.setCenterY(MoValueOrDefault(centerY, 0));
	},

	initializeAnimatablePropertiesCore : function($super) {
		$super();
		
		this.enableAnimatableProperty("angle", this.getAngle, this.setAngle, MoPropertyOptions.AffectsLayout | MoPropertyOptions.AffectsMeasure);
		this.enableAnimatableProperty("centerX", this.getCenterX, this.setCenterX, MoPropertyOptions.AffectsLayout | MoPropertyOptions.AffectsMeasure);
		this.enableAnimatableProperty("centerY", this.getCenterY, this.setCenterY, MoPropertyOptions.AffectsLayout | MoPropertyOptions.AffectsMeasure);
	},

	getValue : function() {
		var mx = MoMatrix2D.createIdentity();
		mx.rotateAt(this.getAngle(), this.getCenterX(), this.getCenterY());
		
		return mx;
	},
	
	getAngle : function() {
		return this.getPropertyValue("angle");
	},
	
	setAngle : function(value) {
		this.setPropertyValue("angle", value);
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
		return (this.getAngle() == other.getAngle() &&
				this.getCenterX() == other.getCenterX() &&
				this.getCenterY() == other.getCenterY());
	}
});
	
MoScaleTransform = Class.create(MoTransform, {
	initialize : function($super, scaleX, scaleY, centerX, centerY) {		
		$super();
		
		this.setScaleX(MoValueOrDefault(scaleX, 1));
		this.setScaleY(MoValueOrDefault(scaleY, 1));
		this.setCenterX(MoValueOrDefault(centerX, 0));
		this.setCenterY(MoValueOrDefault(centerY, 0));
	},

	initializeAnimatablePropertiesCore : function($super) {
		$super();
		
		this.enableAnimatableProperty("scaleX", this.getScaleX, this.setScaleX, MoPropertyOptions.AffectsMeasure | MoPropertyOptions.AffectsLayout);
		this.enableAnimatableProperty("scaleY", this.getScaleY, this.setScaleY, MoPropertyOptions.AffectsMeasure | MoPropertyOptions.AffectsLayout);
		this.enableAnimatableProperty("centerX", this.getCenterX, this.setCenterX, MoPropertyOptions.AffectsMeasure | MoPropertyOptions.AffectsLayout);
		this.enableAnimatableProperty("centerY", this.getCenterY, this.setCenterY, MoPropertyOptions.AffectsMeasure | MoPropertyOptions.AffectsLayout);
	},
	
	getValue : function() {
		var mx = MoMatrix2D.createIdentity();
		mx.scaleAt(this.getScaleX(), this.getScaleY(), this.getCenterX(), this.getCenterY());
		
		return mx;
	},
	
	transformRect : function(rect) {
		if(!rect.isEmpty())
		{
			var hasCenterPoint = (this.getCenterX() != 0 || this.getCenterY() != 0);

			if(hasCenterPoint)
			{
				rect.x -= this.getCenterX();
				rect.y -= this.getCenterY();
			}
			
			rect.scale(this.getScaleX(), this.getScaleY());
			
			if(hasCenterPoint)
			{
				rect.x += this.getCenterX();
				rect.y += this.getCenterY();
			}
		}
		
		return rect;
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
				this.getScaleX() == other.getScaleX() &&
				this.getScaleY() == other.getScaleY());
	}
});
	
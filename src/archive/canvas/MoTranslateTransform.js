MoTranslateTransform = Class.create(MoTransform, {
	initialize : function($super, x, y) {		
		$super();

		this.setX(MoValueOrDefault(x, 0));
		this.setY(MoValueOrDefault(y, 0));
	},

	initializeAnimatablePropertiesCore : function($super) {
		$super();
		
		this.enableAnimatableProperty("x", this.getX, this.setX, MoPropertyOptions.AffectsLayout | MoPropertyOptions.AffectsMeasure);
		this.enableAnimatableProperty("y", this.getY, this.setY, MoPropertyOptions.AffectsLayout | MoPropertyOptions.AffectsMeasure);
	},

	getValue : function() {
		var mx = MoMatrix2D.createIdentity();
		mx.translate(this.getX(), this.getY());

		return mx;
	},

	transformRect : function(rect) {
		if(!rect.isEmpty())
			rect.offset(this.getX(), this.getY());
			
		return rect;
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

	isEqualTo : function($super, other) {
		return (this.getX() == other.getX() &&
				this.getY() == other.getY());
	}
});
	
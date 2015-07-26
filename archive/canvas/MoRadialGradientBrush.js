MoRadialGradientBrush = Class.create(MoGradientBrush, {
	initialize : function($super) {
		$super();

		this.setStartPoint(new MoVector2D(0.5, 0.5));
		this.setEndPoint(new MoVector2D(0.5, 0.5));
		this.setStartRadius(0);
		this.setEndRadius(1);
	},

	initializeAnimatablePropertiesCore : function($super) {
		$super();

		this.enableAnimatableProperty("startPoint", this.getStartPoint, this.setStartPoint, MoPropertyOptions.AffectsLayout);
		this.enableAnimatableProperty("startRadius", this.getStartRadius, this.setStartRadius, MoPropertyOptions.AffectsLayout);
		this.enableAnimatableProperty("endPoint", this.getEndPoint, this.setEndPoint, MoPropertyOptions.AffectsLayout);
		this.enableAnimatableProperty("endRadius", this.getEndRadius, this.setEndRadius, MoPropertyOptions.AffectsLayout);
	},

	getStartPoint : function() {
		return this.getPropertyValue("startPoint");
	},
	
	setStartPoint : function(value) {
		this.setPropertyValue("startPoint", value);
	},
	
	getEndPoint : function() {
		return this.getPropertyValue("endPoint");
	},

	setEndPoint : function(value) {
		this.setPropertyValue("endPoint", value);
	},

	getStartRadius : function() {
		return this.getPropertyValue("startRadius");
	},
	
	setStartRadius : function(value) {
		this.setPropertyValue("startRadius", value);
	},

	getEndRadius : function() {
		return this.getPropertyValue("endRadius");
	},
	
	setEndRadius : function(value) {
		this.setPropertyValue("endRadius", value);
	},
	
	isEqualTo : function($super, other) {
		return ($super(other) &&
				MoAreEqual(this.getStartPoint(), other.getStartPoint()) &&
				MoAreEqual(this.getEndPoint(), other.getEndPoint()) &&
				this.getStartRadius() == other.getStartRadius() &&
				this.getEndRadius() == other.getEndRadius());
	}
});

Object.extend(MoRadialGradientBrush, {

	fromGradientStops : function(stops) {
		var brush = new MoRadialGradientBrush();
		brush.setColorStops(stops);
		
		return brush;
	},

	fromColors : function(startColor, endColor) {
		var stops = new Array(
			new MoGradientStop(startColor, 0), 
			new MoGradientStop(endColor, 1));

		return MoRadialGradientBrush.fromGradientStops(stops);
	}
});
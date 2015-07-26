MoPen = Class.create(MoEventDispatcher, MoAnimatable, {
	initialize : function($super, brush, thickness) {
		$super();
		
		this.setBrush(brush);
		this.setLineCap(MoPenLineCap.Flat);
		this.setLineJoin(MoPenLineJoin.Miter);
		this.setMiterLimit(10);
		this.setDashCap(MoPenLineCap.Square);
		this.setDashStyle(MoDashStyle.Solid);
		this.setThickness(MoValueOrDefault(thickness, 1));

		this.initializeAnimatableProperties();
	},

	initializeAnimatablePropertiesCore : function() {
		this.enableAnimatableProperty("brush", this.getBrush, this.setBrush, MoPropertyOptions.AffectsLayout);
		this.enableAnimatableProperty("lineCap", this.getLineCap, this.setLineCap, MoPropertyOptions.AffectsLayout);
		this.enableAnimatableProperty("lineJoin", this.getLineJoin, this.setLineJoin, MoPropertyOptions.AffectsLayout);
		this.enableAnimatableProperty("miterLimit", this.getMiterLimit, this.setMiterLimit, MoPropertyOptions.AffectsLayout);
		this.enableAnimatableProperty("dashCap", this.getDashCap, this.setDashCap, MoPropertyOptions.AffectsLayout);
		this.enableAnimatableProperty("dashStyle", this.getDashStyle, this.setDashStyle, MoPropertyOptions.AffectsLayout);
		this.enableAnimatableProperty("thickness", this.getThickness, this.setThickness, MoPropertyOptions.AffectsLayout | MoPropertyOptions.AffectsMeasure);
	},
	
	getBrush : function() {
		return this.getPropertyValue("brush");
	},
	
	setBrush : function(value) {
		this.setPropertyValue("brush", value);
	},

	getLineCap : function() {
		return this.getPropertyValue("lineCap");
	},
	
	setLineCap : function(value) {
		this.setPropertyValue("lineCap", value);
	},
	
	getLineJoin : function() {
		return this.getPropertyValue("lineJoin");
	},
	
	setLineJoin : function(value) {
		this.setPropertyValue("lineJoin", value);
	},
	
	getMiterLimit : function() {
		return this.getPropertyValue("miterLimit");
	},
	
	setMiterLimit : function(value) {
		this.setPropertyValue("miterLimit", value);
	},
	
	getDashCap : function() {
		return this.getPropertyValue("dashCap");
	},
	
	setDashCap : function(value) {
		this.setPropertyValue("dashCap", value);
	},
	
	getDashStyle : function() {
		return this.getPropertyValue("dashStyle");
	},
	
	setDashStyle : function(value) {
		this.setPropertyValue("dashStyle", value);
	},
	
	getThickness : function() {
		return this.getPropertyValue("thickness");
	},
	
	setThickness : function(value) {
		this.setPropertyValue("thickness", value);
	},

	isEqualTo : function(other) {
		return (this.getThickness() == other.getThickness() &&
				this.getMiterLimit() == other.getMiterLimit() &&
				this.getDashCap() == other.getDashCap() &&
				this.getDashStyle() == other.getDashStyle() &&
				this.getLineJoin() == other.getLineJoin() &&
				this.getLineCap() == other.getLineCap() &&
				MoAreEqual(this.getBrush(), other.getBrush()));
	}
});
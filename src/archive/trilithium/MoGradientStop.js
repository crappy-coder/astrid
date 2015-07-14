MoGradientStop = Class.create(MoEventDispatcher, MoAnimatable, {
	initialize : function($super, color, offset) {
		$super();

		this.setColor(MoValueOrDefault(color, MoColor.Transparent));
		this.setOffset(MoValueOrDefault(offset, 0));
		
		/** MoGradientBrush **/
		this.brush = null;
		
		this.initializeAnimatableProperties();
	},

	initializeAnimatablePropertiesCore : function() {
		this.enableAnimatableProperty("color", this.getColor, this.setColor, MoPropertyOptions.AffectsLayout);
		this.enableAnimatableProperty("offset", this.getOffset, this.setOffset, MoPropertyOptions.AffectsLayout);
	},

	getColor : function() {
		return this.getPropertyValue("color");
	},

	setColor : function(value) {
		this.setPropertyValue("color", value);
	},

	getOffset : function() {
		return this.getPropertyValue("offset");
	},
	
	setOffset : function(value) {
		this.setPropertyValue("offset", value);
	},
	
	isEqualTo : function(other) {
		return (MoAreEqual(this.getColor(), other.getColor()) && this.getOffset() && other.getOffset());
	},

	toString : function() {
		return "GradientStop[ offset=" + this.getOffset() + ", color=" + this.getColor() + " ]";
	}
});
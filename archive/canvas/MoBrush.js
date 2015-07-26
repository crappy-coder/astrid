MoBrush = Class.create(MoEventDispatcher, MoAnimatable, {
	initialize : function($super) {
		$super();
		
		/** Boolean **/
		this.isAvailable = false;
		
		/** CanvasGradient/CanvasPattern **/
		this.nativeBrushCache = null;
		
		this.setOpacity(1);
		this.initializeAnimatableProperties();
	},

	initializeAnimatablePropertiesCore : function() {		
		this.enableAnimatableProperty("transform", this.getTransform, this.setTransform, MoPropertyOptions.AffectsLayout | MoPropertyOptions.AffectsMeasure);
		this.enableAnimatableProperty("opacity", this.getOpacity, this.setOpacity, MoPropertyOptions.AffectsLayout);
	},

	getIsAvailable : function() {
		return this.isAvailable;
	},
	
	getTransform : function() {
		return this.getPropertyValue("transform");
	},
	
	setTransform : function(value) {
		this.setPropertyValue("transform", value);
	},
	
	getOpacity : function() {
		return this.getPropertyValue("opacity");
	},
	
	setOpacity : function(value) {
		this.setPropertyValue("opacity", Math.min(1, Math.max(0, value)));
	},

	raiseAvailableEvent : function() {
		this.isAvailable = true;
		this.dispatchEvent(new MoSourceEvent(MoSourceEvent.READY));
		this.raisePropertyChangedEvent("isAvailable", false, true);
	},

	isEqualTo : function(other) {
		if(this.getOpacity() == other.getOpacity())
			return MoAreEqual(this.getTransform(), other.getTransform());

		return false;
	}
});
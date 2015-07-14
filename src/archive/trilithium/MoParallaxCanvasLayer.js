MoParallaxCanvasLayer = Class.create(MoCanvas, {
	initialize : function($super, name) {
		$super(name);

		this.ratio = 0;
		this.offset = MoVector2D.Zero();
		this.limits = MoVector2D.NotSet();
	},

	getRatio : function() {
		return this.ratio;
	},

	setRatio : function(value) {
		this.ratio = value;
	},

	getOffset : function() {
		return this.offset;
	},

	setOffset : function(value) {
		this.offset = value;
	},

	getLimits : function() {
		return this.limits;
	},

	setLimits : function(value) {
		this.limits = value;

		// invalidate the parent limits so it
		// can re-compute if needed
		var parent = this.getParent();

		// make sure it is a parallax instance
		if(!MoIsNull(parent) && (parent instanceof MoParallaxCanvas))
			parent.invalidateLimits();
	}
});
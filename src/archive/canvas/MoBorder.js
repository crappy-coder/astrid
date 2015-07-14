MoBorder = Class.create(MoContentControl, {
	initialize : function($super, name) {
		$super(name);

		this.cornerRadius = MoCornerRadius.fromUniform(0);
	},

	getCornerRadius : function() {
		return this.cornerRadius;
	},

	setCornerRadius : function(value) {
		if(MoAreNotEqual(this.cornerRadius, value))
		{
			this.cornerRadius = value;

			if(MoIsNull(this.cornerRadius))
				this.cornerRadius = MoCornerRadius.fromUniform(0);

			this.requestLayout();
		}
	},

	layout : function($super, unscaledWidth, unscaledHeight) {			
		$super(unscaledWidth, unscaledHeight);

		if(this.getChild() == null || this.cornerRadius.isSquare())
			return;

		var thickness = this.getBorderThickness();
		var inset = thickness * 0.5;

		this.graphics.clear();
		this.graphics.beginPath();
		this.graphics.drawRoundRectComplex(inset, inset, Math.max(0, unscaledWidth - inset), Math.max(0, unscaledHeight - inset), this.cornerRadius);
		this.drawBackground();
		this.drawBorder();
	}
});
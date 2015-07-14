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
	}
});
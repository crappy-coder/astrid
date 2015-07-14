MoPanel = Class.create(MoDrawable, {
	initialize : function($super, name) {
		$super(name);
		
		this.background = null;
	},
	
	getBackground : function() {
		return this.background;
	},
	
	setBackground : function(value) {
		if(MoAreNotEqual(this.background, value))
		{
			this.background = value;
			this.requestLayout();
		}
	},
	
	layout : function($super, unscaledWidth, unscaledHeight) {
		$super(unscaledWidth, unscaledHeight);

		this.graphics.clear();

		if(this.background != null)
		{
			this.graphics.drawRect(0, 0, unscaledWidth, unscaledHeight);
			this.graphics.fill(this.background);
		}		
	}
});
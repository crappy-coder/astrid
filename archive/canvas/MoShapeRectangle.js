MoShapeRectangle = Class.create(MoShape, {
	initialize : function($super, name) {
		$super(name);

		this.radius = 0;
	},
	
	getRadius : function() {
		return this.radius;
	},
	
	setRadius : function(value) {
		if(this.radius != value)
		{
			this.radius = value;
			this.requestLayout();
		}
	},
	
	draw : function(gfx) {
		var strokeMetrics = this.getStrokeMetrics();
		var x = strokeMetrics.x;
		var y = strokeMetrics.y;
		var w = this.getWidth() - strokeMetrics.width;
		var h = this.getHeight() - strokeMetrics.height;
		
		if(this.radius == 0)
			gfx.drawRect(x, y, w, h);
		else
			gfx.drawRoundRect(x, y, w, h, this.radius);
	}
});
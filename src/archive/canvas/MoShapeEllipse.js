MoShapeEllipse = Class.create(MoShape, {
	initialize : function($super, name) {
		$super(name);
	},
	
	draw : function(gfx) {
		var strokeMetrics = this.getStrokeMetrics();
		var x = strokeMetrics.x;
		var y = strokeMetrics.y;
		var w = this.getWidth() - strokeMetrics.width;
		var h = this.getHeight() - strokeMetrics.height;
		
		gfx.drawEllipse(x, y, w, h, false);
	}
});
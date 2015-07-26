MoShapePath = Class.create(MoShape, {
	initialize : function($super, name) {
		$super(name);
		
		this.segments = null;
		this.data = null;
	},
	
	getData : function() {
		return this.data;
	},
	
	setData : function(value) {
		if(this.data != value)
		{
			this.data = value;
			this.segments = new MoPathSegmentCollection(this.data);
		}
	},
	
	draw : function(gfx) {
		var strokeMetrics = this.getStrokeMetrics();
		var x = strokeMetrics.x;
		var y = strokeMetrics.y;
		var w = this.getWidth() - strokeMetrics.width;
		var h = this.getHeight() - strokeMetrics.height;
		
		gfx.drawPath(this.segments);
	}
});
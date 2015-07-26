MoShapeLine = Class.create(MoShape, {
	initialize : function($super, name) {
		$super(name);
		
		/** Number **/
		this.x1 = 0;
		
		/** Number **/
		this.y1 = 0;
		
		/** Number **/
		this.x2 = 0;
		
		/** Number **/
		this.y2 = 0;
		
		this.alwaysMeasure = true;
	},

	getX1 : function() {
		return this.x1;
	},
	
	setX1 : function(value) {
		this.x1 = value;
	},

	getY1 : function() {
		return this.y1;
	},
	
	setY1 : function(value) {
		this.y1 = value;
	},
	
	getX2 : function() {
		return this.x2;
	},
	
	setX2 : function(value) {
		this.x2 = value;
	},

	getY2 : function() {
		return this.y2;
	},

	setY2 : function(value) {
		this.y2 = value;
	},
	
	measure : function() {
		var bounds = MoShape.computeLineBounds(this.x1, this.y1, this.x2, this.y2, Math.abs(this.getStrokeThickness()), this.getStrokeLineCap());
		
		this.setUnscaledWidth(bounds.right());
		this.setUnscaledHeight(bounds.bottom());
	},
	
	draw : function(gfx) {
		gfx.beginPath();
		gfx.drawLine(this.x1, this.y1, this.x2, this.y2);
	}
});
MoShapePolygon = Class.create(MoShape, {
	initialize : function($super, name) {
		$super(name);

		this.points = [];
		this.cachedPoints = [];
		this.alwaysMeasure = true;
	},
	
	getPoints : function() {
		return this.points;
	},

	setPoints : function(value) {
		// just clear out the points
		if(MoIsNull(value))
		{
			this.points.length = 0;
			return;
		}
	
		this.points = value;

		this.invalidateProperties();
		this.requestMeasure();
		this.requestLayout();
	},

	// TODO : add better measurement support for calculating the bounds with stroke and miter limit, different line caps/joins, etc..

	getShapeBounds : function() {	
		var xMin = 0;
		var xMax = 0;
		var yMin = 0;
		var yMax = 0;
		var thickness = Math.abs(this.getStrokeThickness());
		var thicknessH = thickness * 0.5;
		var len = this.cachedPoints.length;
		
		if(len > 1)
		{
			xMin = xMax = this.cachedPoints[0].x;
			yMin = yMax = this.cachedPoints[0].y;
			
			for(var i = 1; i < len; ++i)
			{
				xMin = Math.min(xMin, this.cachedPoints[i].x);
				xMax = Math.max(xMax, this.cachedPoints[i].x);
				yMin = Math.min(yMin, this.cachedPoints[i].y);
				yMax = Math.max(yMax, this.cachedPoints[i].y);
			}
			
			return MoShape.computeLineBounds(xMin, yMin, xMax, yMax, thickness, this.getStrokeLineCap());
		}
		
		return MoRectangle.fromPoints(
			new MoVector2D(xMin, yMin),
			new MoVector2D(xMax, yMax));
	},
	
	commitProperties : function($super) {
		$super();
		
		this.cachedPoints.length = 0;
		
		var len = this.points.length;
		var thickness = Math.abs(this.getStrokeThickness());
		var thicknessH = thickness * 0.5;
		var pt = null;
		
		for(var i = 0; i < len; ++i)
		{
			pt = this.points[i];
			this.cachedPoints.push(new MoVector2D(pt.x + thicknessH, pt.y + thicknessH));
		}
	},

	measure : function() {
		var bounds = this.getShapeBounds();
		
		this.setUnscaledWidth(bounds.right());
		this.setUnscaledHeight(bounds.bottom());
	},
	
	draw : function(gfx) {
		gfx.drawPoly(this.cachedPoints);
	}
});
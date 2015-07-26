MoShape = Class.create(MoDrawable, {
	initialize : function($super, name) {
		$super(name);
		
		/** MoBrush **/
		this.fill = null;
		
		/** MoBrush **/
		this.stroke = null;

		/** Number **/
		this.strokeThickness = 0;
		
		/** MoPenLineCap **/
		this.strokeLineCap = MoPenLineCap.Flat;
		
		/** MoPenLineJoin **/
		this.strokeLineJoin = MoPenLineJoin.Miter;
		
		/** Number **/
		this.strokeMiterLimit = 10;
		
		/** MoPenLineCap **/
		this.strokeDashCap = MoPenLineCap.Flat;
		
		/** MoDashStyle **/
		this.strokeDashStyle = MoDashStyle.Solid;
		
		this.penCache = null;
		this.strokeMetrics = new MoRectangle();
	},
	
	getFill : function() {
		return this.fill;
	},
	
	setFill : function(value) {
		if(MoAreNotEqual(this.fill, value))
		{
			this.fill = value;
			this.requestLayout();
		}
	},

	getStroke : function() {
		return this.stroke;
	},
	
	setStroke : function(value) {
		if(MoAreNotEqual(this.stroke, value))
		{
			this.stroke = value;
			this.invalidatePen();
		}
	},
	
	getStrokeThickness : function() {
		return this.strokeThickness;
	},
	
	setStrokeThickness : function(value) {
		if(this.strokeThickness != value)
		{
			this.strokeThickness = value;
			this.invalidatePen();
		}
	},
	
	getStrokeLineCap : function() {
		return this.strokeLineCap;
	},
	
	setStrokeLineCap : function(value) {
		if(this.strokeLineCap != value)
		{
			this.strokeLineCap = value;
			this.invalidatePen();
		}
	},
	
	getStrokeLineJoin : function() {
		return this.strokeLineJoin;
	},
	
	setStrokeLineJoin : function(value) {
		if(this.strokeLineJoin != value)
		{
			this.strokeLineJoin = value;
			this.invalidatePen();
		}
	},
	
	getStrokeMiterLimit : function() {
		return this.strokeMiterLimit;
	},
	
	setStrokeMiterLimit : function(value) {
		if(this.strokeMiterLimit != value)
		{
			this.strokeMiterLimit = value;
			this.invalidatePen();
		}
	},
	
	getStrokeDashCap : function() {
		return this.strokeDashCap;
	},
	
	setStrokeDashCap : function(value) {
		if(this.strokeDashCap != value)
		{
			this.strokeDashCap = value;
			this.invalidatePen();
		}
	},
	
	getStrokeDashStyle : function() {
		return this.strokeDashStyle;
	},
	
	setStrokeDashStyle : function(value) {
		if(this.strokeDashStyle != value)
		{
			this.strokeDashStyle = value;
			this.invalidatePen();
		}
	},
	
	getPen : function() {
		if(this.stroke == null || Math.abs(this.strokeThickness) == 0)
			return null;

		if(this.penCache == null)
		{
			this.penCache = new MoPen(this.getStroke(), Math.abs(this.getStrokeThickness()));
			this.penCache.setLineCap(this.getStrokeLineCap());
			this.penCache.setLineJoin(this.getStrokeLineJoin());
			this.penCache.setMiterLimit(this.getStrokeMiterLimit());
			this.penCache.setDashStyle(this.getStrokeDashStyle());
			this.penCache.setDashCap(this.getStrokeDashCap());
		}

		return this.penCache;
	},
	
	invalidatePen : function() {
		this.penCache = null;
		this.requestMeasure();
		this.requestLayout();
	},
	
	getStrokeMetrics : function() {
	
		if(this.stroke == null || this.strokeThickness == 0)
		{
			this.strokeMetrics.x = 0;
			this.strokeMetrics.y = 0;
			this.strokeMetrics.width = 0;
			this.strokeMetrics.height = 0;
		}
		else
		{
			var thickness = this.strokeThickness;
			
			this.strokeMetrics.x = thickness * 0.5;
			this.strokeMetrics.y = thickness * 0.5;
			this.strokeMetrics.width = thickness;
			this.strokeMetrics.height = thickness;
		}

		return this.strokeMetrics;
	},
	
	layout : function($super, unscaledWidth, unscaledHeight) {
		$super(unscaledWidth, unscaledHeight);
	
		var gfx = this.getGraphics();
		var pen = this.getPen();
		
		// reset the graphics
		gfx.clear();
		
		// draw the shape, this should be overridden
		this.draw(gfx);

		// fill and stroke
		if(this.fill != null)
			gfx.fill(this.fill);

		if(pen != null)
			gfx.stroke(pen);
	},
	
	draw : function(gfx) {
		/** override **/
	}
});

Object.extend(MoShape, {
	UseExactBounds : true,
	
	computeLineBounds : function(x1, y1, x2, y2, thickness, lineCap) {
		var bounds = MoRectangle.Zero();
		
		// vertical
		if(x1 == x2)
		{
			bounds.x = x1;
			bounds.y = Math.min(y1, y2) - (y1 < y2 && lineCap != MoPenLineCap.Flat ? thickness * 0.5 : 0) - (y1 >= y2 && lineCap != MoPenLineCap.Flat ? thickness * 0.5 : 0);
			bounds.width = thickness;
			bounds.height = Math.abs(y2 - y1) + (lineCap != MoPenLineCap.Flat ? thickness * 0.5 : 0) + (lineCap != MoPenLineCap.Flat ? thickness * 0.5 : 0);
		}
		
		// horizontal
		else if(y1 == y2)
		{
			bounds.x = Math.min(x1, x2) - (x1 < x2 && lineCap != MoPenLineCap.Flat ? thickness * 0.5 : 0) - (x1 >= x2 && lineCap != MoPenLineCap.Flat ? thickness * 0.5 : 0);
			bounds.y = y1 - thickness / 2;
			bounds.width = Math.abs(x2 - x1) + (lineCap != MoPenLineCap.Flat ? thickness * 0.5 : 0) + (lineCap != MoPenLineCap.Flat ? thickness * 0.5 : 0);
			bounds.height = thickness;
		}

		// diagonal
		else
		{
			var m = Math.abs((y1 - y2) / (x1 - x2));
			var dx = (MoShape.UseExactBounds ? Math.sin(Math.atan(m)) * thickness : ((m > 1.0) ? thickness : thickness * m));
			var dy = (MoShape.UseExactBounds ? Math.cos(Math.atan(m)) * thickness : ((m < 1.0) ? thickness : thickness / m));
			
			if(x1 < x2)
			{
				switch(lineCap)
				{
					case MoPenLineCap.Square:
						bounds.x = Math.min(x1, x2) - (dx + dy) * 0.5;
						break;
					case MoPenLineCap.Round:
						bounds.x = Math.min(x1, x2) - thickness * 0.5;
						break;
					case MoPenLineCap.Flat:
						bounds.x = Math.min(x1, x2) - dx * 0.5;
						break;
				}
			}
			else
			{
				switch(lineCap)
				{
					case MoPenLineCap.Square:
						bounds.x = Math.min(x1, x2) - (dx + dy) * 0.5;
						break;
					case MoPenLineCap.Round:
						bounds.x = Math.min(x1, x2) - thickness * 0.5;
						break;
					case MoPenLineCap.Flat:
						bounds.x = Math.min(x1, x2) - dx * 0.5;
						break;
				}
			}
			
			if(y1 < y2)
			{
				switch(lineCap)
				{
					case MoPenLineCap.Square:
						bounds.y = Math.min(y1, y2) - (dx + dy) * 0.5;
						break;
					case MoPenLineCap.Round:
						bounds.y = Math.min(y1, y2) - thickness * 0.5;
						break;
					case MoPenLineCap.Flat:
						bounds.y = Math.min(y1, y2) - dy * 0.5;
						break;
				}
			}
			else
			{
				switch(lineCap)
				{
					case MoPenLineCap.Square:
						bounds.y = Math.min(y1, y2) - (dx + dy) * 0.5;
						break;
					case MoPenLineCap.Round:
						bounds.y = Math.min(y1, y2) - thickness * 0.5;
						break;
					case MoPenLineCap.Flat:
						bounds.y = Math.min(y1, y2) - dy * 0.5;
						break;
				}			
			}
			
			bounds.width = Math.abs(x2 - x1);
			bounds.height = Math.abs(y2 - y1);
			
			switch(lineCap)
			{
				case MoPenLineCap.Square:
					bounds.width += (dx + dy) * 0.5;
					bounds.height += (dx + dy) * 0.5;
					break;
				case MoPenLineCap.Round:
					bounds.width += thickness * 0.5;
					bounds.height += thickness * 0.5;
					break;
				case MoPenLineCap.Flat:
					bounds.width += dx * 0.5;
					bounds.height += dy * 0.5;
					break;		
			}
			
			switch(lineCap)
			{
				case MoPenLineCap.Square:
					bounds.width += (dx + dy) * 0.5;
					bounds.height += (dx + dy) * 0.5;
					break;
				case MoPenLineCap.Round:
					bounds.width += thickness * 0.5;
					bounds.height += thickness * 0.5;
					break;
				case MoPenLineCap.Flat:
					bounds.width += dx * 0.5;
					bounds.height += dy * 0.5;
					break;		
			}

		}
		
		return bounds;
	}
});
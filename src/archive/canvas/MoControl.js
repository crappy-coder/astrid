MoControl = Class.create(MoDrawable, {
	initialize : function($super, name) {
		$super(name);
		
		this.background = null;
		this.foreground = null;
		this.borderBrush = null;
		this.borderThickness = 0;
		this.pen = null; // cached pen for strokes
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

	getForeground : function() {
		return this.foreground;
	},
	
	setForeground : function(value) {
		if(MoAreNotEqual(this.foreground, value))
		{
			this.foreground = value;
			this.requestLayout();
		}
	},

	getBorderBrush : function() {
		return this.borderBrush;
	},

	setBorderBrush : function(value) {
		if(MoAreNotEqual(this.borderBrush, value))
		{
			this.borderBrush = value;
			
			this.invalidateProperties();
			this.requestLayout();
		}
	},

	getBorderThickness : function() {
		return this.borderThickness;
	},

	setBorderThickness : function(value) {
		if(this.borderThickness != value)
		{
			this.borderThickness = value;
			
			this.invalidateProperties();
			this.requestMeasure();
			this.requestLayout();
		}
	},
	
	commitProperties : function($super) {
		$super();

		if(this.borderBrush != null && this.borderThickness > 0)
		{
			if(this.pen == null)
			{
				this.pen = new MoPen(this.borderBrush, this.borderThickness);
			}
			else
			{
				this.pen.setBrush(this.borderBrush);
				this.pen.setThickness(this.borderThickness);
			}
		}
		else
		{
			this.pen = null;
		}
	},
	
	layout : function($super, unscaledWidth, unscaledHeight) {
		$super(unscaledWidth, unscaledHeight);
		
		this.graphics.clear();

		if(this.background != null || (this.borderBrush != null && this.borderThickness > 0))
		{
			var thickness = this.getBorderThickness();
			var inset = thickness * 0.5;
			
			this.graphics.drawRect(inset, inset, Math.max(0, unscaledWidth - thickness), Math.max(0, unscaledHeight - thickness));
			this.drawBackground();
			this.drawBorder();
		}
	},
	
	drawBackground : function() {
		if(this.background != null)
			this.graphics.fill(this.background);
	},
	
	drawBorder : function() {
		if(this.pen != null)
			this.graphics.stroke(this.pen);
	}
});
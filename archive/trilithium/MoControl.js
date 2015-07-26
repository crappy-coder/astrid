MoControl = Class.create(MoDrawable, {
	initialize : function($super, name) {
		$super(name);
		
		this.background = null;
		this.backgroundSlate = null;
		this.foreground = null;
		this.borderBrush = null;
		this.borderThickness = 0;
		this.borderSlate = null;
	},

	getBackground : function() {
		return this.background;
	},

	setBackground : function(value) {
		if(MoAreNotEqual(this.background, value))
		{
			if(!MoIsNull(this.backgroundSlate))
			{
				this.removeFromGraphicsContainer(this.backgroundSlate);
				this.backgroundSlate = null;
			}

			this.background = value;
			
			if(!MoIsNull(this.background))
			{
				this.backgroundSlate = engine.createSlate();
				this.backgroundSlate.shader = this.createShaderFromBrush(this.background);
			}

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
			if(!MoIsNull(this.borderSlate))
			{
				this.removeFromGraphicsContainer(this.borderSlate);
				this.borderSlate = null;
			}

			this.borderBrush = value;
			
			if(!MoIsNull(this.borderBrush))
			{
				this.borderSlate = engine.createSlate();
				this.borderSlate.shader = this.createShaderFromBrush(this.borderBrush);
			}
			
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

	removeFromGraphicsContainer : function(slate) {
		var container = this.getGraphicsContainer();

		if(container.contains(slate))
		{
			container.removeChild(slate);
			
			if(!MoIsNull(slate.shader))
				slate.unload();
		}
	},
	
	updateSlates : function() {
		if(MoIsNull(this.borderSlate) && MoIsNull(this.backgroundSlate))
			return;

		var container = this.getGraphicsContainer();
		
		if(!MoIsNull(this.borderSlate))
		{
			if(!container.contains(this.borderSlate))
				container.addChildAt(this.borderSlate, 0);
		}

		if(!MoIsNull(this.backgroundSlate))
		{
			if(!container.contains(this.backgroundSlate))
				container.addChildAt(this.backgroundSlate, MoIsNull(this.borderSlate) ? 0 : 1);
		}
	},

	layout : function($super, unscaledWidth, unscaledHeight) {
		$super(unscaledWidth, unscaledHeight);

		var thickness = this.getBorderThickness();
		var inset = thickness * 0.5;

		if(!MoIsNull(this.borderSlate))
		{
			this.borderSlate.x = 0;
			this.borderSlate.y = 0;
			this.borderSlate.width = unscaledWidth;
			this.borderSlate.height = unscaledHeight;
		}
		
		if(!MoIsNull(this.backgroundSlate))
		{			
			this.backgroundSlate.x = inset;
			this.backgroundSlate.y = inset;
			this.backgroundSlate.width = Math.max(0, unscaledWidth - thickness);
			this.backgroundSlate.height = Math.max(0, unscaledHeight - thickness);
		}
		
		this.updateSlates();
	},
	
	drawBackground : function() {

	},
	
	drawBorder : function() {

	}
});
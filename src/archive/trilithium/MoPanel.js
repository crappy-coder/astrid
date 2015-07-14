MoPanel = Class.create(MoDrawable, {
	initialize : function($super, name) {
		$super(name);
		
		this.background = null;
		this.backgroundSlate = null;
	},
	
	getBackground : function() {
		return this.background;
	},
	
	setBackground : function(value) {
		if(MoAreNotEqual(this.background, value))
		{
			if(!MoIsNull(this.backgroundSlate))
			{
				var container = this.getGraphicsContainer();
				
				if(container.contains(this.backgroundSlate))
				{
					container.removeChild(this.backgroundSlate);
					
					if(!MoIsNull(this.backgroundSlate.shader))
						this.backgroundSlate.unload();
				}
				
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
	
	applyAlpha : function(alpha) {		
		if(!MoIsNull(this.backgroundSlate))
		{
			if(this.background instanceof MoSolidColorBrush)
			{
				var fillColor = this.backgroundSlate.shader.fillColor;
				
				this.backgroundSlate.shader.fillColor = [fillColor[0], fillColor[1], fillColor[2], alpha * this.background.getOpacity()];
			}
			else
				this.backgroundSlate.shader.opacity = [alpha, 0, 0, 0];
		}
	},

	layout : function($super, unscaledWidth, unscaledHeight) {
		$super(unscaledWidth, unscaledHeight);

		if(!MoIsNull(this.backgroundSlate))
		{
			var container = this.getGraphicsContainer();
			
			this.backgroundSlate.x = 0;
			this.backgroundSlate.y = 0;
			this.backgroundSlate.width = unscaledWidth;
			this.backgroundSlate.height = unscaledHeight;

			if(!container.contains(this.backgroundSlate))
				container.addChildAt(this.backgroundSlate, 0);
		}
	}
});
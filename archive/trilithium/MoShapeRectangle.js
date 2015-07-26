MoShapeRectangle = Class.create(MoShape, {
	initialize : function($super, name) {
		$super(name);

		this.radius = 0;
		this.fillSlate = null;
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

	setFill : function(value) {		
		if(MoAreNotEqual(this.fill, value))
		{
			var container = this.getGraphicsContainer();
			
			this.fill = value;
			
			if(!MoIsNull(this.fillSlate))
			{
				if(container.contains(this.fillSlate))
				{
					container.removeChild(this.fillSlate);
					
					if(!MoIsNull(this.fillSlate.shader))
					{
						this.fillSlate.shader.unload();
						this.fillSlate.unload();
					}
				}

				this.fillSlate = null;
			}
			
			this.requestLayout();
		}
	},

	layout : function($super, unscaledWidth, unscaledHeight) {
		$super(unscaledWidth, unscaledHeight);

		var container = this.getGraphicsContainer();

		if(!MoIsNull(this.fill))
		{
			if(MoIsNull(this.fillSlate))
			{
				this.fillSlate = engine.createSlate();
				this.fillSlate.shader = this.createShaderFromBrush(this.fill);

				container.addChildAt(this.fillSlate, 0);
			}

			this.fillSlate.x = 0;
			this.fillSlate.y = 0;
			this.fillSlate.width = unscaledWidth;
			this.fillSlate.height = unscaledHeight;
		}
		else
		{
			if(!MoIsNull(this.fillSlate))
			{
				container.removeChild(this.fillSlate);
				
				if(!MoIsNull(this.fillSlate.shader))
				{
					this.fillSlate.shader.unload();
					this.fillSlate.unload();
				}
				
				this.fillSlate = null;
			}
		}
	}
});
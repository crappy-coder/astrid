MoCanvas = Class.create(MoPanel, {
	initialize : function($super, name) {
		$super(name);
	},
	
	measure : function($super) {
		$super();

		var len = this.getCount();
		var child = null;
		var maxWidth = 0;
		var maxHeight = 0;
		
		for(var i = 0; i < len; ++i)
		{
			child = this.getAt(i);

			if(!child.getIsLayoutVisible())
				continue;
			
			maxWidth = Math.max(maxWidth, child.getX() + child.getExactOrMeasuredWidth());
			maxHeight = Math.max(maxHeight, child.getY() + child.getExactOrMeasuredHeight());
		}
		
		this.setMeasuredWidth(maxWidth);
		this.setMeasuredHeight(maxHeight);
	},

	layout : function($super, unscaledWidth, unscaledHeight) {
		$super(unscaledWidth, unscaledHeight);
		
		var len = this.getCount();
		var child = null;
		var childX = 0;
		var childY = 0;
		var childWidth = 0;
		var childHeight = 0;
		var needsWidthValidation = false;
		var needsHeightValidation = false;

		for(var i = 0; i < len; ++i)
		{
			child = this.getAt(i);

			if(!child.getIsLayoutVisible())
				continue;

			childX = child.getX();
			childY = child.getY();
			childWidth = child.getExactOrMeasuredWidth();
			childHeight = child.getExactOrMeasuredHeight();

			needsWidthValidation = false;
			needsHeightValidation = false;

			// first, see if we need to calculate the size from
			// a percentage value, this becomes our used value, which
			// will need to be checked once we have the computed value
			if(!isNaN(child.getPercentWidth()))
			{
				childWidth = unscaledWidth * (child.getPercentWidth() / 100);
				needsWidthValidation = true;
			}

			if(!isNaN(child.getPercentHeight()))
			{
				childHeight = unscaledHeight * (child.getPercentHeight() / 100);
				needsHeightValidation = true;
			}

			// finally, since we have the final position and size, it needs to 
			// be validated against the available size
			if(needsWidthValidation && (childX + childWidth) > unscaledWidth)
				childWidth = unscaledWidth - childX;

			if(needsHeightValidation && (childY + childHeight) > unscaledHeight)
				childHeight = unscaledHeight - childY;
			
			// update the child
			child.setLayoutPosition(childX, childY);
			child.setActualSize(childWidth, childHeight);
		}
	}
});
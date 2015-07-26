MoStackPanel = Class.create(MoPanel, {
	initialize : function($super, name) {
		$super(name);

		this.orientation = MoOrientation.Vertical;
		this.gap = 0;
	},
	
	getOrientation : function() {
		return this.orientation;
	},

	setOrientation : function(value) {
		if(this.orientation != value)
		{
			this.orientation = value;

			this.requestMeasure();
			this.requestParentMeasureAndLayout();
		}
	},
	
	getGap : function() {
		return this.gap;
	},
	
	setGap : function(value) {
		if(this.gap != value)
		{
			this.gap = value;
			
			this.requestMeasure();
			this.requestParentMeasureAndLayout();
		}
	},
	
	measure: function($super) {
		$super();
	
		var isHorizontal = (this.getOrientation() == MoOrientation.Horizontal);
		var child = null;
		var childMargin = null;
		var maxWidth = 0;
		var maxHeight = 0;
		var actualChildCount = 0;
		
		for(var i = 0, len = this.getCount(); i < len; ++i)
		{
			child = this.getAt(i);

			if(!child.getIsLayoutVisible())
				continue;
				
			actualChildCount++;
			childMargin = child.getMargin();

			if(isHorizontal)
			{
				maxWidth += child.getExactOrMeasuredWidth() + childMargin.getSizeX();
				maxHeight = Math.max(maxHeight, child.getExactOrMeasuredHeight() + childMargin.getSizeY());
			}
			else
			{
				maxHeight += child.getExactOrMeasuredHeight() + childMargin.getSizeY();
				maxWidth = Math.max(maxWidth, child.getExactOrMeasuredWidth() + childMargin.getSizeX());
			}
		}
		
		if(isHorizontal)
			maxWidth += ((actualChildCount * this.gap) - this.gap);
		else
			maxHeight += ((actualChildCount * this.gap) - this.gap);
		
		this.setMeasuredWidth(maxWidth);
		this.setMeasuredHeight(maxHeight);
	},
	
	layout : function($super, unscaledWidth, unscaledHeight) {
		$super(unscaledWidth, unscaledHeight);

		var isHorizontal = (this.getOrientation() == MoOrientation.Horizontal);
		var child = null;
		var childWidth = 0;
		var childHeight = 0;
		var childX = 0;
		var childY = 0;
		var childMargin = null;
		var marginX = 0;
		var marginY = 0;

		for(var i = 0, len = this.getCount(); i < len; ++i)
		{
			child = this.getAt(i);

			if(!child.getIsLayoutVisible())
				continue;

			childMargin = child.getMargin();
			childWidth = child.getExactOrMeasuredWidth();
			childHeight = child.getExactOrMeasuredHeight();

			// compute the actual sizes from the percentages, if
			// they are being used
			if(!isNaN(child.getPercentWidth()))
				childWidth = unscaledWidth * (child.getPercentWidth() / 100);
		
			if(!isNaN(child.getPercentHeight()))
				childHeight = unscaledHeight * (child.getPercentHeight() / 100);
			
			
			// layout the children horizontally
			if(isHorizontal)
			{
				// calculate the vertical alignment position
				childY = ((unscaledHeight - (childHeight + childMargin.getSizeY())) * child.getVerticalAlignment());

				// update the childs layout position and actual size, with the margins
				child.setLayoutPosition(childX + childMargin.getLeft(), childY + childMargin.getTop());
				child.setActualSize(childWidth, childHeight);

				// set the start position of the next child
				childX += childWidth + childMargin.getSizeX() + this.gap;
			}

			// otherwise, layout vertically
			else
			{
				// calculate the horizontal alignment position
				childX = ((unscaledWidth - (childWidth + childMargin.getSizeX())) * child.getHorizontalAlignment());
				
				// update the childs layout position and actual size, with the margins				
				child.setLayoutPosition(childX + childMargin.getLeft(), childY + childMargin.getTop());
				child.setActualSize(childWidth, childHeight);

				// set the start position of the next child
				childY += childHeight + childMargin.getSizeY() + this.gap;
			}
		}
	}
});
MoWrapPanel = Class.create(MoPanel, {
	initialize : function($super, name) {
		$super(name);
		
		this.itemWidth = NaN;
		this.itemHeight = NaN;
		this.horizontalGap = 0;
		this.verticalGap = 0;
		this.orientation = MoOrientation.Horizontal;
		this.actualItemWidth = NaN;
		this.actualItemHeight = NaN;
	},
	
	getOrientation : function() {
		return this.orientation;
	},
	
	setOrientation : function(value) {
		if(this.orientation != value)
		{
			this.orientation = value;
			
			this.requestMeasure();
			this.requestLayout();
		}
	},
	
	getHorizontalGap : function() {
		return this.horizontalGap;
	},
	
	setHorizontalGap : function(value) {
		if(this.horizontalGap != value)
		{
			this.horizontalGap = value;
			
			this.requestMeasure();
			this.requestLayout();
		}
	},
	
	getVerticalGap : function() {
		return this.verticalGap;
	},
	
	setVerticalGap : function(value) {
		if(this.verticalGap != value)
		{
			this.verticalGap = value;
			
			this.requestMeasure();
			this.requestLayout();
		}
	},
	
	getItemWidth : function() {
		return this.itemWidth;
	},
	
	setItemWidth : function(value) {
		if(this.itemWidth != value)
		{
			this.itemWidth = value;
			this.requestMeasure();
		}
	},
	
	getItemHeight : function() {
		return this.itemHeight;
	},
	
	setItemHeight : function(value) {
		if(this.itemHeight != value)
		{
			this.itemHeight = value;
			this.requestMeasure();
		}
	},
	
	measure : function($super) {
		$super();
		
		// calculate the actual size of an item
		this.calculateActualItemSize();
		
		// measure at least to the actual item size
		var measuredWidth = this.actualItemWidth;
		var measuredHeight = this.actualItemHeight;
		var childCount = this.getCount();
		
		for(var i = 0, len = this.getCount(); i < len; ++i)
		{
			if(!this.getAt(i).getIsLayoutVisible())
				childCount--;
		}
		
		if(childCount > 0)
		{
			var minor = 0;
			var major = NaN;
			
			if(this.orientation == MoOrientation.Horizontal)
			{
				var exactWidth = this.getExactWidth();
				
				if(!isNaN(exactWidth))
					major = Math.floor((exactWidth + this.horizontalGap) / (this.actualItemWidth + this.horizontalGap));
			}
			else
			{
				var exactHeight = this.getExactHeight();
				
				if(!isNaN(exactHeight))
					major = Math.floor((exactHeight + this.verticalGap) / (this.actualItemHeight + this.verticalGap));
			}
			
			// we don't have an exact dimension so
			// use the square root of our child count
			if(isNaN(major))
				major = Math.ceil(Math.sqrt(childCount));
				
			// make sure we have at least one item
			if(major < 1)
				major = 1;

			minor = Math.ceil(childCount / major);

			var xAxis = (this.orientation == MoOrientation.Horizontal ? major : minor);
			var yAxis = (this.orientation == MoOrientation.Horizontal ? minor : major);
			
			measuredWidth = xAxis * this.actualItemWidth + ((xAxis - 1) * this.horizontalGap);
			measuredHeight = yAxis * this.actualItemHeight + ((yAxis - 1) * this.verticalGap);
		}

		this.setMeasuredWidth(measuredWidth);
		this.setMeasuredHeight(measuredHeight);
	},
	
	layout : function($super, unscaledWidth, unscaledHeight) {
		$super(unscaledWidth, unscaledHeight);
	
		if(isNaN(this.actualItemWidth) || isNaN(this.actualItemHeight))
			this.calculateActualItemSize();
			
		var xPos = 0;
		var xOffset = 0;
		var yPos = 0;
		var yOffset = 0;
		var child = null;
		
		if(this.orientation == MoOrientation.Horizontal)
		{
			var xEnd = Math.ceil(unscaledWidth);
			
			for(var i = 0, len = this.getCount(); i < len; ++i)
			{
				child = this.getAt(i);
				
				if(!child.getIsLayoutVisible())
					continue;
					
				if((xPos + this.actualItemWidth) > xEnd && xPos != 0)
				{
					xPos = 0;
					yPos += this.actualItemHeight + this.verticalGap;
				}
				
				this.updateChildSize(child);
				
				xOffset = Math.floor((this.actualItemWidth - child.getWidth()) * child.getHorizontalAlignment());
				yOffset = Math.floor((this.actualItemHeight - child.getHeight()) * child.getVerticalAlignment());
				
				child.setLayoutPosition(xPos + xOffset, yPos + yOffset);
				
				xPos += (this.actualItemWidth + this.horizontalGap);
			}
		}
		else
		{
			var yEnd = Math.ceil(unscaledHeight);
			
			for(var i = 0, len = this.getCount(); i < len; ++i)
			{
				child = this.getAt(i);
				
				if(!child.getIsLayoutVisible())
					continue;
					
				if((yPos + this.actualItemHeight) > yEnd && yPos != 0)
				{
					xPos += this.actualItemWidth + this.horizontalGap;
					yPos = 0;
				}
				
				this.updateChildSize(child);
				
				xOffset = Math.floor((this.actualItemWidth - child.getWidth()) * child.getHorizontalAlignment());
				yOffset = Math.floor((this.actualItemHeight - child.getHeight()) * child.getVerticalAlignment());
				
				child.setLayoutPosition(xPos + xOffset, yPos + yOffset);
				
				yPos += (this.actualItemHeight + this.verticalGap);
			}
		}

		this.actualItemWidth = NaN;
		this.actualItemHeight = NaN;
	},
	
	updateChildSize : function(child) {
		var childWidth = child.getExactOrMeasuredWidth();
		var childExactWidth = child.getExactWidth();
		var childHeight = child.getExactOrMeasuredHeight();
		var childExactHeight = child.getExactHeight();
		
		if(isNaN(childExactWidth))
			childExactWidth = 0;
			
		if(isNaN(childExactHeight))
			childExactHeight = 0;
		
		if(!isNaN(child.getPercentWidth()))
			childWidth = Math.min(this.actualItemWidth, this.actualItemWidth * (child.getPercentWidth() / 100));
		else
		{
			if(childWidth > this.actualItemWidth)
				childWidth = (childExactWidth > this.actualItemWidth ? childExactWidth : this.actualItemWidth);
		}
		
		if(!isNaN(child.getPercentHeight()))
			childHeight = Math.min(this.actualItemHeight, this.actualItemHeight * (child.getPercentHeight() / 100));
		else
		{
			if(childHeight > this.actualItemHeight)
				childHeight = (childExactHeight > this.actualItemHeight ? childExactHeight : this.actualItemHeight);
		}
		
		child.setActualSize(childWidth, childHeight);
	},
	
	calculateActualItemSize : function() {
		var hasWidth = !isNaN(this.itemWidth);
		var hasHeight = !isNaN(this.itemHeight);
		
		// use the explicit item size
		if(hasWidth && hasHeight)
		{
			this.actualItemWidth = this.itemWidth;
			this.actualItemHeight = this.itemHeight;
			
			return;
		}
		
		// compute the max child size
		var maxWidth = 0;
		var maxHeight = 0;
		var child = null;
		
		for(var i = 0, len = this.getCount(); i < len; ++i)
		{
			child = this.getAt(i);
			
			if(!child.getIsLayoutVisible())
				continue;
				
			maxWidth = Math.max(maxWidth, child.getExactOrMeasuredWidth());
			maxHeight = Math.max(maxHeight, child.getExactOrMeasuredHeight());
		}
		
		// use the explicit size (if one was set) otherwise use the max size
		this.actualItemWidth = (hasWidth ? this.itemWidth : maxWidth);
		this.actualItemHeight = (hasHeight ? this.itemHeight : maxHeight);
	}
	
/* 	measure : function($super) {
		$super();
		
		var itemWidth = this.itemWidth;
		var itemHeight = this.itemHeight;
		var blockSize = new MoWrapPanel.ItemSize(this.orientation);
		var measuredSize = new MoWrapPanel.ItemSize(this.orientation);
		var containerSize = new MoWrapPanel.ItemSize(this.orientation, this.getWidth(), this.getHeight());
		var hasWidth = !isNaN(itemWidth);
		var hasHeight = !isNaN(itemHeight);
		var child = null;
		var blockCount = 0;

		for(var i = 0, len = this.getCount(); i < len; ++i)
		{
			child = this.getAt(i);

			// don't include children that are not participating
			// in layout, however, we ignore whether or not a child
			// is visible, hidden children should still take up space
			if(!child.getIsLayoutVisible())
				continue;

			var childSize = new MoWrapPanel.ItemSize(this.orientation, 
				hasWidth ? itemWidth : child.getExactOrMeasuredWidth(),
				hasHeight ? itemHeight : child.getExactOrMeasuredHeight());

			// at the end of the block
			if((blockSize.hsize + childSize.hsize) > containerSize.hsize)
			{
				// add last block to our currently measured size
				measuredSize.hsize = Math.max(blockSize.hsize, measuredSize.hsize);
				measuredSize.vsize += blockSize.vsize;
				
				// start new block
				blockSize.copyFrom(childSize);

				// the child is bigger than the container so assume
				// it will be on it's own
				if(childSize.hsize > containerSize.hsize)
				{
					// add this child to our measured size
					blockCount++;
					measuredSize.hsize = Math.max(childSize.hsize, measuredSize.hsize);
					measuredSize.vsize += childSize.vsize;
					
					// start a new block
					blockSize.orientation = this.orientation;
					blockSize.hsize = blockSize.vsize = 0;
				}
			}

			// otherwise add to the end
			else
			{
				blockSize.hsize += childSize.hsize;
				blockSize.vsize = Math.max(childSize.vsize, blockSize.vsize);
			}
		}

		// add last block to our currently measured size
		measuredSize.hsize = Math.max(blockSize.hsize, measuredSize.hsize);
		measuredSize.vsize += blockSize.vsize;
console.log(measuredSize.getWidth(), measuredSize.getHeight());
		// update final measured size
		this.setMeasuredWidth(measuredSize.getWidth());
		this.setMeasuredHeight(measuredSize.getHeight());
	},
	
	layout : function($super, unscaledWidth, unscaledHeight) {
		$super(unscaledWidth, unscaledHeight);

		var itemWidth = this.itemWidth;
		var itemHeight = this.itemHeight;
		var isHorizontal = (this.orientation == MoOrientation.Horizontal);
		var itemU = isHorizontal ? itemWidth : itemHeight;
		var blockSize = new MoWrapPanel.ItemSize(this.orientation);
		var containerSize = new MoWrapPanel.ItemSize(this.orientation, unscaledWidth, unscaledHeight);
		var hasWidth = !isNaN(itemWidth);
		var hasHeight = !isNaN(itemHeight);
		var delta = isHorizontal ? (hasWidth ? itemWidth : null) : (hasHeight ? itemHeight : null);
		var offset = 0;
		var start = 0;
		var end = 0;
		var count = this.getCount();
		var child = null;

		while(end < count)
		{
			child = this.getAt(end);
			
			// don't include children that are not participating
			// in layout
			if(!child.getIsLayoutVisible())
				return;

			var childSize = new MoWrapPanel.ItemSize(this.orientation, 
				hasWidth ? itemWidth : child.getExactOrMeasuredWidth(), 
				hasHeight ? itemHeight : child.getExactOrMeasuredHeight());

			// the end of the block as been reached
			if((blockSize.hsize + childSize.hsize) > containerSize.hsize)
			{
				// finish current block
				this.arrangeLine(start, end, delta, offset, blockSize.vsize);
				
				// move to a new block
				offset += blockSize.vsize;
				blockSize.copyFrom(childSize);
				
				// the child is bigger than the container so it
				// will consume an entire block
				if(childSize.hsize > containerSize.hsize)
				{
					// arrange full block
					this.arrangeLine(end, ++end, delta, offset, childSize.vsize);
					
					// move to a new block
					offset += childSize.vsize;
					blockSize.hsize = blockSize.vsize = 0;
					blockSize.orientation = this.orientation;
				}
				
				// update index to new block
				start = end;
			}
			
			// otherwise we add to end of current block
			else
			{
				blockSize.hsize += childSize.hsize;
				blockSize.vsize = Math.max(childSize.vsize, blockSize.vsize);
			}
			
			end++;
		}

		// make sure to update the last block if needed
		if(start < count)
			this.arrangeLine(start, count, delta, offset, blockSize.vsize);
	},
	
	arrangeLine : function(start, end, delta, offset, vsize) {
		var idx = 0;
		var isHorizontal = (this.orientation == MoOrientation.Horizontal);
		var child = null;
		
		for(var i = start; i < end; ++i)
		{
			child = this.getAt(i);

			if(child.getIsLayoutVisible())
			{
				var childSize = new MoWrapPanel.ItemSize(this.orientation, child.getExactOrMeasuredWidth(), child.getExactOrMeasuredHeight());
				var hsize = MoIsNull(delta) ? childSize.hsize : delta;

				child.setLayoutPosition((isHorizontal ? idx : offset), (isHorizontal ? offset : idx));
				child.setActualSize((isHorizontal ? hsize : vsize), (isHorizontal ? vsize : hsize));

				idx += hsize;
			}
		}
	},
	
	isValidItemSize : function(size) {
		return (isNaN(size) || (size >= 0 && !MoMath.isPositiveInfinity(size)));
	} */
});

/* MoWrapPanel.ItemSize = Class.create({
	initialize : function(orientation, width, height) {
		this.hsize = 0;
		this.vsize = 0;
		this.orientation = orientation;

		this.setWidth(MoValueOrDefault(width, 0));
		this.setHeight(MoValueOrDefault(height, 0));
	},
	
	getWidth : function() {
		return (this.orientation == MoOrientation.Horizontal ? this.hsize : this.vsize);
	},
	
	setWidth : function(value) {
		if(this.orientation == MoOrientation.Horizontal)
			this.hsize = value;
		else
			this.vsize = value;
	},
	
	getHeight : function() {
		return (this.orientation == MoOrientation.Horizontal ? this.vsize : this.hsize);
	},
	
	setHeight : function(value) {
		if(this.orientation == MoOrientation.Horizontal)
			this.vsize = value;
		else
			this.hsize = value;
	},

	copyFrom : function(value) {
		this.hsize = value.hsize;
		this.vsize = value.vsize;
		this.orientation = value.orientation;
	},
	
	toString : function() {
		return "WrapPanel.ItemSize [hsize: " + 
			this.hsize + ", vsize: " + 
			this.vsize + ", orientation: " + 
			this.orientation + ", width: " + 
			this.getWidth() + ", height: " + 
			this.getHeight() + " ]";
	}
}); */
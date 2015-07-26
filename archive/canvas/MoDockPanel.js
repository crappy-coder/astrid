MoDock = {
	None	: 0,
	Top		: 1,
	Right	: 2,
	Bottom	: 3,
	Left	: 4
};

MoDockPanel = Class.create(MoPanel, {
	initialize : function($super, name) {
		$super(name);
		
		this.fillLastChild = true;
	},
	
	getFillLastChild : function() {
		return this.fillLastChild;
	},
	
	setFillLastChild : function(value) {
		this.fillLastChild = value;
	},
	
	measure: function($super) {
		var idx = 0;
		var count = this.getCount();
		var child = null;
		var maxWidth = 0;
		var maxHeight = 0;
		var lastWidth = 0;
		var lastHeight = 0;

		while(idx < count)
		{
			child = this.getAt(idx);
			
			if(child == null || !child.getIsLayoutVisible())
				continue;

			var dock = child.getDock();
			
			if(dock == MoDock.None)
				throw new Error("Child of MoDockPanel must have a dock value, use setDock to set the docking type.");

			switch(dock)
			{
				case MoDock.Left:
					maxHeight = Math.max(maxHeight, lastHeight + child.getExactOrMeasuredHeight());
					lastWidth += child.getExactOrMeasuredWidth();
					break;
				case MoDock.Top:
					maxWidth = Math.max(maxWidth, lastWidth + child.getExactOrMeasuredWidth());
					lastHeight += child.getExactOrMeasuredHeight();
					break;
			}
			
			idx++;
		}

		this.setMeasuredWidth(Math.max(maxWidth, lastWidth));
		this.setMeasuredHeight(Math.max(maxHeight, lastHeight));
	},
	
	layout : function($super, unscaledWidth, unscaledHeight) {
		$super(unscaledWidth, unscaledHeight);

		var count = this.getCount();
		var lastFillIdx = count - (this.fillLastChild ? 1 : 0);
		var child = null;
		var left = 0;
		var right = 0;
		var top = 0;
		var bottom = 0;
		var width = this.getExactOrMeasuredWidth();
		var height = this.getExactOrMeasuredHeight();

		for(var i = 0; i < count; ++i)
		{	
			child = this.getAt(i);
	
			if(child == null || !child.getIsLayoutVisible())
				continue;

			childWidth = child.getExactOrMeasuredWidth();
			childHeight = child.getExactOrMeasuredHeight();

			if(!isNaN(child.getPercentWidth()))
				childWidth = unscaledWidth * (child.getPercentWidth() / 100);
			
			if(!isNaN(child.getPercentHeight()))
				childHeight = unscaledHeight * (child.getPercentHeight() / 100);
			
			var rect = new MoRectangle(left, top, Math.max(0, width - (left + right)), Math.max(0, height - (top + bottom)));
			
			if(i < lastFillIdx)
			{
				var dock = child.getDock();
				
				if(dock == MoDock.None)
					throw new Error("Child of MoDockPanel must have a dock value, use setDock to set the docking type.");

				switch(dock)
				{
					case MoDock.Top:
						top += childHeight;
						rect.height = childHeight;
						break;
					case MoDock.Right:
						right += childWidth;
						rect.x = Math.max(0, width - right);
						rect.width = childWidth;
						break;
					case MoDock.Bottom:
						bottom += childHeight;
						rect.y = Math.max(0, height - bottom);
						rect.height = childHeight;
						break;
					case MoDock.Left:
						left += childWidth;
						rect.width = childWidth;
						break;
				}
			}
			
			child.setLayoutPosition(rect.x, rect.y);
			
			if(!isNaN(rect.width) && !isNaN(rect.height))
				child.setActualSize(rect.width, rect.height);
		}
	}
});
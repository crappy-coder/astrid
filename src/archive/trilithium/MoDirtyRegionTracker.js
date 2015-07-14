MoDirtyRegionTracker = Class.create(
// @PRIVATE
{
	initialize : function() {
		this.regions = [];
	},
	
	clear : function() {
		this.regions = [];
	},
	
	isEmpty : function() {
		return (this.regions.length == 0);
	},
	
	add : function(x, y, width, height) {
		var len = this.regions.length;
		var newRegion = new MoRectangle(Math.floor(x), Math.floor(y), Math.ceil(width), Math.ceil(height));
		var currentRect = null;
		var hasIntersect = false;
		
		// don't add an empty region
		if(newRegion.isEmpty() || newRegion.isZero())
			return;
		
		for(var i = 0; i < len; ++i)
		{
			currentRect = this.regions[i];
			
			if(newRegion.intersects(currentRect))
			{
				currentRect.unionWithRect(newRegion);
				hasIntersect = true;
			}
		}

		if(!hasIntersect)
			this.regions.push(newRegion);
	},
	
	getAll : function() {
		return this.regions;
	}
});

Object.extend(MoDirtyRegionTracker, 
// @PRIVATE
{
	Instance : null,
	
	current : function() {
		if(MoDirtyRegionTracker.Instance == null)
			MoDirtyRegionTracker.Instance = new MoDirtyRegionTracker();

		return MoDirtyRegionTracker.Instance;
	}
});
MoDirtyRegion = Class.create(MoEquatable, {
	initialize : function() {
		this.x1 = MoMaxInt;
		this.y1 = MoMaxInt;
		this.x2 = MoMinInt;
		this.y2 = MoMinInt;
	},
	
	clear : function() {
		this.x1 = MoMaxInt;
		this.y1 = MoMaxInt;
		this.x2 = MoMinInt;
		this.y2 = MoMinInt;
	},
	
	isEmpty : function() {
		return (this.x1 == MoMaxInt); // only need to check one
	},
	
	getRect : function() {
		return new MoRectangle(this.x1, this.y1, this.getWidth(), this.getHeight());
	},
	
	getWidth : function() {
		return (this.x2 - this.x1);
	},
	
	getHeight : function() {
		return (this.y2 - this.y1);
	},
	
	grow : function(x1, y1, x2, y2) {
		this.x1 = Math.min(x1, this.x1);
		this.y1 = Math.min(y1, this.y1);
		this.x2 = Math.max(x2, this.x2);
		this.y2 = Math.max(y2, this.y2);
		
		MoDirtyRegionTracker.current().add(this);
	},

	inflate : function(amount) {
		this.x1 -= amount;
		this.y1 -= amount;
		this.x2 += amount;
		this.y2 += amount;
	},

	combine : function(other) {
		this.grow(other.x1, other.y1, other.x2, other.y2);
	},

	combineRect : function(rect) {
		this.grow(rect.x, rect.y, rect.x + rect.width, rect.y + rect.height);
	},

	translate : function(x, y) {
		if(this.x1 != MoMaxInt) 
		{
			this.x1 += x;
			this.x2 += x;
			
			this.y1 += y;
			this.y2 += y;
		}
	},
	
	toString : function() {
		return "DirtyRegion(x1: " + this.x1 + ", y1: " + this.y1 + ", x2: " + this.x2 + ", y2: " + this.y2 + ")";
	}
});

MoDirtyRegionTracker = Class.create(
// @PRIVATE
{
	initialize : function() {
		this.regionCache = [];
	},
	
	clear : function() {
		this.regionCache = [];
	},
	
	isEmpty : function() {
		return (this.regionCache.length == 0);
	},
	
	getRects : function() {
		return this.regionCache;
	},
	
	add : function(dirtyRegion) {
		if(MoIsNull(dirtyRegion) || dirtyRegion.isEmpty())
			return;

		var regions = [];
		var rect = dirtyRegion.getRect().round().inflate(4, 4);
		var isLoner = true;
		
		for(var i = this.regionCache.length-1; i >= 0; --i)
		{
			var region = this.regionCache[i];

			if(rect.intersects(region))
				this.regionCache[i] = rect.unionWithRect(region);
			else
				regions.push(region);
		}
		
		regions.push(rect);
		
		this.regionCache = regions;
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
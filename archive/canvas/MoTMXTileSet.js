MoTMXTileSet = Class.create({
	initialize : function() {
		this.firstGid = 0;
		this.name = "";
		this.tileWidth = 0;
		this.tileHeight = 0;
		this.spacing = 0;
		this.margin = 0;
		this.imageSource = null;
	},
	
	getFirstGID : function() {
		return this.firstGid;
	},
	
	getName : function() {
		return this.name;
	},
	
	getTileWidth : function() {
		return this.tileWidth;
	},
	
	getTileHeight : function() {
		return this.tileHeight;
	},
	
	getSpacing : function() {
		return this.spacing;
	},
	
	getMargin : function() {
		return this.margin;
	},
	
	getImageSource : function() {
		return this.imageSource;
	}
});
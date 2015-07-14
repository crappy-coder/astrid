MoTMXLayer = Class.create({
	initialize : function() {
		this.name = "";
		this.opacity = 1;
		this.visible = true;
		this.tiles = new Array();
	},
	
	getName : function() {
		return this.name;
	},
	
	getOpacity : function() {
		return this.opacity;
	},
	
	getVisible : function() {
		return this.visible;
	},
	
	getTiles : function() {
		return this.tiles;
	}
});
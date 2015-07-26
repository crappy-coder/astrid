MoTMXObject = Class.create({
	initialize : function() {
		this.name = "";
		this.type = "";
		this.x = 0;
		this.y = 0;
		this.width = 0;
		this.height = 0;
		this.gid = 0;
		this.properties = null;
	},
	
	getName : function() {
		return this.name;
	},
	
	getType : function() {
		return this.type;
	},
	
	getX : function() {
		return this.x;
	},
	
	getY : function() {
		return this.y;
	},
	
	getWidth : function() {
		return this.width;
	},
	
	getHeight : function() {
		return this.height;
	},
	
	getGID: function() {
		return this.gid;
	},
	
	getProperties : function() {
		return this.properties;
	}
});
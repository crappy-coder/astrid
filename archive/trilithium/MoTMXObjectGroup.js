MoTMXObjectGroup = Class.create({
	initialize : function() {
		this.name = "";
		this.objects = new Array();
	},
	
	getName : function() {
		return this.name;
	},
	
	getObjects : function() {
		return this.objects;
	}
});
MoTransformSet = Class.create(MoTransform, {
	initialize : function($super) {		
		$super();
		
		this.setChildren(new Array());
	},
	
	initializeAnimatablePropertiesCore : function($super) {
		$super();
		
		this.enableAnimatableProperty("children", this.getChildren, this.setChildren, MoPropertyOptions.AffectsLayout | MoPropertyOptions.AffectsMeasure);
	},

	getValue : function() {
		var mx = MoMatrix2D.createIdentity();
		var len = this.getChildren().length;
		
		if(len > 0)
		{
			var xform = null;
		
			for(var i = 0; i < len; i++)
			{
				xform = this.getChildren()[i];
				
				if(xform != null)
					mx.append(xform.getValue());
			}
		}

		return mx;
	},
	
	add : function(transform) {
		var children = this.getChildren();
		children.push(transform);
		
		this.setChildren(children);
	},
	
	remove : function(transform) {
		var children = this.getChildren();
		children.remove(transform);
		
		this.setChildren(children);
	},
	
	removeAt : function(index) {
		var children = this.getChildren();
		children.removeAt(index);

		this.setChildren(children);
	},
	
	getAt : function(index) {
		return this.getChildren()[index];
	},
	
	getChildren : function() {
		return this.getPropertyValue("children");
	},
	
	setChildren : function(value) {
		if(value == null)
			value = new Array();
			
		this.setPropertyValue("children", value);
	},
	
	clear : function() {
		this.setChildren(null);
	},
	
	getForType : function(type) {
		var len = this.getChildren().length;
		var xform = null;
		
		for(var i = 0; i < len; i++)
		{
			xform = this.getChildren()[i];
			
			if(xform != null && xform instanceof type)
				return xform;
		}
		
		return null;
	},
	
	isEqualTo : function(other) {
		if(this.getChildren().length == other.getChildren().length)
		{
			var len = this.getChildren().length;
			var c1 = null;
			var c2 = null;
			
			for(var i = 0; i < len; ++i)
			{
				c1 = this.getChildren()[i];
				c2 = other.getChildren()[i];
				
				if(MoAreNotEqual(c1, c2))
					return false;
			}

			return true;
		}
		
		return false;
	}
});
	
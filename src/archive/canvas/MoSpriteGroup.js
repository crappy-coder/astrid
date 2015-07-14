MoSpriteGroup = Class.create(MoCanvas, {
	initialize : function($super, name, groupName, textureAtlas) {
		$super(name);

		this.textureAtlas = textureAtlas;
		this.setGroupName(groupName);
	},
	
	getGroupName : function() {
		return this.groupName;
	},
	
	setGroupName : function(value) {
		if(MoIsNull(value))
			throw new Error("Sprite must have a group.");

		if(this.groupName != value)
		{
			this.groupName = value;
			this.reset();
		}
	},
	
	getTextureAtlas : function() {
		return this.textureAtlas;
	},
	
	getSprite : function(id) {
		return this.getByName("sprite-" + id);
	},
	
	play : function(name) {
		if(MoIsNull(name))
			this.playAll();
		else
			this.forEach("play", this.getAnimationIdForAnimationGroup(name));
	},
	
	playAll : function() {
		this.forEach("play");
	},
	
	pause : function(name) {
		if(MoIsNull(name))
			this.pauseAll();
		else
			this.forEach("pause", this.getAnimationIdForAnimationGroup(name));
	},
	
	pauseAll : function() {
		this.forEach("pause");
	},
	
	resume : function(name) {
		if(MoIsNull(name))
			this.resumeAll();
		else
			this.forEach("resume", this.getAnimationIdForAnimationGroup(name));
	},
	
	resumeAll : function() {
		this.forEach("resume");
	},
	
	stop : function(name) {
		if(MoIsNull(name))
			this.stopAll();
		else
			this.forEach("stop", this.getAnimationIdForAnimationGroup(name));
	},
	
	stopAll : function() {
		this.forEach("stop");
	},
	
	forEach : function(funcName, ids) {
		ids = MoValueOrDefault(ids, null);
		
		if(MoIsNull(ids))
		{
			var len = this.getCount();
			var child = null;
			
			for(var i = 0; i < len; ++i)
			{
				child = this.getAt(i);
				
				if(child instanceof MoSprite)
					child[funcName]();
			}
		}
		else
		{
			var len = ids.length;
			var sprite = null;
			
			for(var i = 0; i < len; ++i)
			{
				sprite = this.getSprite(ids[i]);
				sprite[funcName]();
			}
		}
	},
	
	getAnimationIdForAnimationGroup : function(name) {
		var group = this.textureAtlas.getGroupAnimations(this.groupName);
		var len = group.length;
		var names = [];

		for(var i = 0; i < len; ++i)
		{
			if(group[i].name.toLowerCase() == name.toLowerCase())
				names.push(group[i].id);
		}

		return names;
	},

	reset : function() {
		this.stopAll();
		this.clear();

		var group = this.textureAtlas.getGroupAnimations(this.groupName);
		var len = group.length;
		var sprite = null;
		var animation = null;

		for(var i = 0; i < len; ++i)
		{
			animation = group[i];
			sprite = this.textureAtlas.getSprite("sprite-" + animation.id, animation.ref);
			sprite.setX(animation.x);
			sprite.setY(animation.y);
			
			if(animation.width > 0)
				sprite.setWidth(animation.width);
			
			if(animation.height > 0)
				sprite.setHeight(animation.height);
			
			this.add(sprite);
		}
		
		this.requestMeasure();
		this.requestLayout();
	}
});

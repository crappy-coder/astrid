MoGameObject = Class.create(MoAIEntity, {
	initialize : function($super, name, container, surface) {
		$super(name);

		this.surface = surface;
		this.container = container;
		this.sprite = null;
		this.entity = null;
	},
	
	setup : function() {
		/** override **/
	},
	
	getSurface : function() {
		return this.surface;
	},
	
	getSprite : function() {
		return this.sprite;
	},
	
	getContainer : function() {
		return this.container;
	},
	
	getEntity : function() {
		return this.entity;
	},
	
	getIsPlayingAnimation : function(name) {
		if(MoIsNull(name))
			return this.sprite.getIsRunning();

		return (this.sprite.getIsRunning() && this.sprite.getAnimationName() == name);
	},
	
	playAnimation : function(name) {
		this.sprite.play(name);
	},
	
	stopAnimation : function() {
		this.sprite.stop();
	},
	
	pauseAnimation : function() {
		this.sprite.pause();
	},
	
	resumeAnimation : function() {
		this.sprite.resume();
	}
});

Object.extend(MoGameObject, {
	create : function(surface, name, container, objectType) {
		var obj = new objectType(name, container, surface);

		obj.setup();
		surface.addAIEntity(obj);

		return obj;
	}
});
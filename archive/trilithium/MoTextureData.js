MoTextureData = Class.create(MoEventDispatcher, {
	initialize : function($super) {
		$super();

		this.image = null;
		this.loader = null;
		this.url = "";
		this.isLoaded = false;
		this.isCancelled = false;
	},
	
	cancel : function() {
		if(this.loader != null && !this.isCancelled)
		{
			this.isCancelled = true;
			this.loader.cancel();
		}
	},

	load : function(url) {
		this.url = url;
		this.isLoaded = false;
		this.isCancelled = false;

		this.loader = engine.loadImage(url, this.handleLoadEvent.d(this), this.handleErrorEvent.d(this));
	},

	handleLoadEvent : function(imageNode) {
		this.image = imageNode;
		this.loader = null;
		this.isLoaded = true;
		this.isCancelled = false;
		
		this.dispatchEvent(new MoLoadEvent(MoLoadEvent.SUCCESS));
	},

	handleErrorEvent : function(msg) {
		this.loader = null;
		this.isLoaded = false;
		this.isCancelled = false;

		this.dispatchEvent(new MoLoadEvent(MoLoadEvent.FAILURE));
	}
});
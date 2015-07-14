MoTextureData = Class.create(MoEventDispatcher, {
	initialize : function($super) {
		$super();

		this.image = null;
		this.isLoaded = false;
	},

	load : function(url) {
		this.image = new Image();
		this.image.addEventListener("load", this.handleLoadEvent.asDelegate(this), false);
		this.image.addEventListener("error", this.handleErrorEvent.asDelegate(this), false);
		this.image.src = url;

		this.isLoaded = false;
	},

	handleLoadEvent : function(e) {
		this.isLoaded = true;
		this.dispatchEvent(new MoLoadEvent(MoLoadEvent.SUCCESS));
	},

	handleErrorEvent : function(e) {
		this.isLoaded = false;
		this.dispatchEvent(new MoLoadEvent(MoLoadEvent.FAILURE));
	}
});
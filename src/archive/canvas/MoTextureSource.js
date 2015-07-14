MoTextureSource = Class.create(MoImageSource, {
	initialize : function($super, path, autoload, cachePolicy) {
		$super();

		this.url = null;
		this.autoload = MoValueOrDefault(autoload, true);
		this.cachePolicy = MoValueOrDefault(cachePolicy, MoTextureCachePolicy.Cache);
		this.hasError = false;
		this.error = null;
		this.setUrl(path);
	},

	getIsValid : function() {
		return !this.getHasError();
	},

	getHasError : function() {
		return this.hasError;
	},
	
	getError : function() {
		return this.error;
	},
	
	getCachePolicy : function() {
		return this.cachePolicy;
	},

	getUrl : function() {
		return this.url;
	},

	setUrl : function(value) {
		if(this.url != value)
		{
			this.reset();
			this.url = value;
			
			if(this.autoload)
				this.load();
		}
	},

	raiseLoadCompletedEvent : function() {
		this.dispatchEvent(new MoLoadEvent(MoLoadEvent.SUCCESS));
		this.raiseSourceReadyEvent();
	},

	raiseLoadFailedEvent : function() {
		this.dispatchEvent(new MoLoadEvent(MoLoadEvent.FAILURE));
	},
	
	raiseLoadProgressEvent : function() {
		// TODO : need to figure out a good way to dispatch actual progress info
		this.dispatchEvent(new MoProgressEvent(MoProgressEvent.PROGRESS, 100, 100));
	},

	reset : function() {		
		this.data = null;
		this.size = MoSize.Zero();
		this.isSourceReady = false;
		this.hasError = false;
		this.error = "";
		this.url = null;
	},

	load : function() {
		if(this.isSourceReady)
		{
			this.raiseLoadCompletedEvent();
			return;
		}

		var url = this.url;
		var cacheKey = this.url.toLowerCase();
		var textureData = MoTextureCacheGet(cacheKey);

		// no cached texture, load from the server
		if(textureData == null)
		{
			// add a random number to the url so we can bypass the browser cache
			if(this.shouldAlwaysLoadFromServer())
			{
				var str = "s2=" + MoMath.randomIntTo(1000);

				if(url.indexOf("?") == -1)
					url += "?" + str;
				else
					url += "&" + str;
			}

			// create the texture data proxy and load in the data
			textureData = new MoTextureData();
			textureData.addEventHandler(MoLoadEvent.SUCCESS, this.handleLoadEvent.asDelegate(this));
			textureData.addEventHandler(MoLoadEvent.FAILURE, this.handleErrorEvent.asDelegate(this));
			textureData.load(url);

			// cache this texture now so that it can be re-used right away, even before it's fully loaded
			if(this.shouldCacheTexture())
				MoTextureCacheAdd(cacheKey, textureData);
		}

		// the texture is cached, load from memory
		else
		{
			// the texture data is already loaded, so just finish up as usual
			if(textureData.isLoaded)
				this.finishLoad(textureData);
			else
			{
				// since the data is not yet loaded, we still need to listen for the events even
				// through we are not the original loader so that everything will get setup correctly
				textureData.addEventHandler(MoLoadEvent.SUCCESS, this.handleLoadEvent.asDelegate(this));
				textureData.addEventHandler(MoLoadEvent.FAILURE, this.handleErrorEvent.asDelegate(this));
			}
		}
	},

	finishLoad : function(textureData) {
		// keep a reference to the native image and sizes
		this.data = textureData.image;
		this.size.width = this.data.width;
		this.size.height = this.data.height;
		
		// notify this source is now ready to use
		this.isSourceReady = true;
		this.raiseLoadCompletedEvent();
	},

	handleLoadEvent : function(event) {
		this.removeEventHandlers(event.getTarget());
		this.finishLoad(event.getTarget());
	},

	handleErrorEvent : function(event) {
		// loading failed, notify this source cannot be used
		//
		// TODO : need to see about using more informative error messages
		//        about that actual reason, response code, etc... that was
		//        returned from the server.
		//
		this.hasError = true;
		this.error = "Texture failed to load.";
		this.isSourceReady = false;

		this.removeEventHandlers(event.getTarget());
		this.raiseLoadFailedEvent();
	},

	shouldAlwaysLoadFromServer : function() {
		return (this.getCachePolicy() == MoTextureCachePolicy.InMemory || this.getCachePolicy() == MoTextureCachePolicy.NoCache);
	},
	
	shouldCacheTexture : function() {
		return (this.getCachePolicy() == MoTextureCachePolicy.InMemory || this.getCachePolicy() == MoTextureCachePolicy.Cache);
	},
	
	removeEventHandlers : function(textureData) {
		if(textureData == null)
			return;

		textureData.removeEventHandler(MoLoadEvent.SUCCESS, this.handleLoadEvent.asDelegate(this));
		textureData.removeEventHandler(MoLoadEvent.FAILURE, this.handleErrorEvent.asDelegate(this));
	}
});

Object.extend(MoTextureSource, {
	fromFile : function(path, cachePolicy) {
		return new MoTextureSource(path, true, cachePolicy);
	}
});

MoPS3VideoSourceElement = Class.create(MoEventDispatcher, {
	initialize : function($super) {
		$super();
		
		this.nativeVideo = null;
		this.paused = false;
		this.duration = 0;
		this.preload = "";
		this.readyState = 0;		
		this.width = NaN;
		this.height = NaN;
		this.videoWidth = 0;
		this.videoHeight = 0;
		this.hasFirstFrame = false;
		this.isOpened = false;
		this.bestContentType = "";
		this.error = {
			code : -1
		};
		
		this.isSeeking = false;
		this.wasPlayingBeforeSeek = false;
		this.hasPlayed = false;
		this.lastVolume = 1;
		this._volume = 1;
		this._autoplay = false;
		this._src = null;
		
		Object.defineProperty(this, "muted", { get : this.getMuted.bind(this), set : this.setMuted.bind(this), enumerable : true });
		Object.defineProperty(this, "volume", { get : this.getVolume.bind(this), set : this.setVolume.bind(this), enumerable : true });
		Object.defineProperty(this, "currentTime", { get : this.getCurrentTime.bind(this), set : this.setCurrentTime.bind(this), enumerable : true });
		Object.defineProperty(this, "autoplay", { get : this.getAutoPlay.bind(this), set : this.setAutoPlay.bind(this), enumerable : true });
		Object.defineProperty(this, "src", { get : this.getSrc.bind(this), set : this.setSrc.bind(this), enumerable : true });
	},

	getMuted : function() {
		if(MoIsNull(this.nativeVideo))
			return false;
			
		return (this.nativeVideo.volume == 0);
	},
	
	setMuted : function(value) {
		if(MoIsNull(this.nativeVideo))
			return;
		
		this.lastVolume = this.nativeVideo.volume;
		this.nativeVideo.volume = (value ? 0 : this.lastVolume);
	},
	
	getVolume : function() {
		return this._volume;
	},
	
	setVolume : function(value) {
		this._volume = value;
	},
	
	getCurrentTime : function() {
		if(MoIsNull(this.nativeVideo))
			return 0;
			
		return this.nativeVideo.currentTime;
	},

	setCurrentTime : function(value) {
		if(MoIsNull(this.nativeVideo) || !this.isOpened || this.isSeeking)
			return;

		if(this.nativeVideo.currentTime != value)
		{			
			this.isSeeking = true;
			this.wasPlayingBeforeSeek = !this.nativeVideo.paused;

			if(this.nativeVideo.paused)
				this.nativeVideo.play();

			this.nativeVideo.currentTime = parseFloat(value);
			this.dispatchEvent(new MoEvent("seeked"));
		}
	},

	getAutoPlay : function() {
		return this._autoplay;
	},
	
	setAutoPlay : function(value) {
		this._autoplay = value;
	},
	
	getSrc : function() {
		return this._src;
	},
	
	setSrc : function(value) {
		this._src = value;
	},
	
	close : function() {
		if(!MoIsNull(this.nativeVideo))
		{
				
			try
			{
				if(this.isOpened)
				{
					this.nativeVideo.stop();
					this.nativeVideo.close();
				}

				this.nativeVideo.resetMemoryContainer();
			} 
			catch(e) 
			{ 

			}
			finally
			{
				this.isOpened = false;
			}
		}
	},
	
	stop : function() {
		this.isSeeking = false;

		if(!MoIsNull(this.nativeVideo) && this.isOpened)
			this.nativeVideo.stop();
	},

	seek : function(position) {
		if(position < 0)
			position = 0;
		
		if(position > this.nativeVideo.duration)
			position = this.nativeVideo.duration;

		this.setCurrentTime(position);
	},

	play : function() {		
		if(!MoIsNull(this.nativeVideo) && this.isOpened)
		{			
			this.isSeeking = false;
			this.paused = false;

			if(!this.hasPlayed || this.nativeVideo.paused)
				this.nativeVideo.play();
				
			this.hasPlayed = true;
		}
	},

	pause : function() {		
		if(!MoIsNull(this.nativeVideo))
		{
			this.paused = true;
			this.isSeeking = false;
			
			if(!this.nativeVideo.paused)
			{
				this.nativeVideo.pause();
				this.dispatchEvent(new MoEvent("pause"));
			}
		}
	},

	canPlayType : function(type) {
		type = MoValueOrDefault(type, "");
		type = type.toLowerCase();

		if(type == "video/mp4" || type == "video/mp2t")
		{
			this.bestContentType = type;
			
			return "probably";
		}

		return "maybe";
	},
	
	load : function(container) {
		
		this.close();
		this.readyState = MoPS3VideoSourceElement.HAVE_NOTHING;
		this.hasFirstFrame = false;
		this.isSeeking = false;
		this.hasPlayed = false;
		this.isOpened = false;
		this.duration = 0;
		this.dispatchEvent(new MoEvent("loadstart"));

		var config = {
			"Audio-ChannelCount" : "2",
			"Content-Type" : this.bestContentType,
			"Encryption-Type" : (this.isMp2t() ? "aes-encryption" : "none"),
			"Transfer-Type" : (this.isMp2t() ? "adaptive-streaming" : "progressive-download")
		};

		if(MoIsNull(this.nativeVideo))
		{
			this.nativeVideo = engine.createVideo(config);
			this.nativeVideo.onEnded = this.onEnded.bind(this);
			this.nativeVideo.onStalled = this.onStalled.bind(this);
			this.nativeVideo.onPlaying = this.onPlaying.bind(this);
			this.nativeVideo.onTimeUpdate = this.onTimeUpdate.bind(this);
			this.nativeVideo.onError = this.onError.bind(this);
			this.nativeVideo.onOpened = this.onOpened.bind(this);
		}

		if(!container.contains(this.nativeVideo))
			container.addChild(this.nativeVideo);
		
		this.nativeVideo.open(this.getSrc(), {
			"Video-BufferSize": 20480
		});
	},

	isMp4 : function() {
		return (this.bestContentType == "video/mp4");
	},

	isMp2t : function() {
		return (this.bestContentType == "video/mp2t");
	},
	
	addEventListener : function(name, callback, useCapture) {
		this.addEventHandler(name, callback, useCapture);
	},

	removeEventListener : function(name, callback, useCapture) {
		this.removeEventHandler(name, callback, useCapture);
	},
	
	onOpened : function(success) {
	
		// video has already opened, this seems to occur when a video is opened
		// then immediately closed but never played and then re-opened... so
		// in this case we just try to play it
		if(this.isOpened && success)
		{			
			this.play();
			return;
		}
	
		if(success)
		{
			this.isOpened = true;
			this.dispatchEvent(new MoEvent("canplay"));
		}
		else
		{
			this.error.code = 2;
			this.dispatchEvent(new MoEvent("error"));
		}
	},
	
	onStalled : function() {
		//this.dispatchEvent(new MoEvent("suspend"));
	},
	
	onEnded : function() {
		this.isSeeking = false;
		this.dispatchEvent(new MoEvent("ended"));
	},
	
	onError : function() {
		this.error.code = 3;
		this.dispatchEvent(new MoEvent("error"));
	},
	
	onPlaying : function() {
		//if(!this.isSeeking)
			this.dispatchEvent(new MoEvent("playing"));
	},
	
	onTimeUpdate : function() {
	
		// we need to wait for a time update when seeking before allowing a new seek, this
		// way we get a new frame on the screen so it actually looks like something is happening
		if(this.isSeeking)
		{
			this.isSeeking = false;
		
			if(!this.wasPlayingBeforeSeek)
				this.pause();
		}
		
	
		if(this.nativeVideo.duration != this.duration)
		{
			this.duration = this.nativeVideo.duration;
			this.dispatchEvent(new MoEvent("durationchange"));
		}

		if(!this.hasFirstFrame && this.duration > 0)
		{
			this.hasFirstFrame = true;
			this.readyState = MoPS3VideoSourceElement.HAVE_ENOUGH_DATA;
			this.dispatchEvent(new MoEvent("loadeddata"));
			
			this.videoWidth = this.nativeVideo.naturalWidth;
			this.videoHeight = this.nativeVideo.naturalHeight;			
		}
	}
});

Object.extend(MoPS3VideoSourceElement, {
	HAVE_NOTHING : 0,
	HAVE_METADATA : 1,
	HAVE_CURRENT_DATA : 2,
	HAVE_FUTURE_DATA : 3,
	HAVE_ENOUGH_DATA : 4
});

MoVideo = Class.create(MoDrawable, MoMediaBase, {
	initialize : function($super, name, sourceElement) {
		$super(name);

		this.alwaysDirty = false;
		this.hasLayout = false;
		this.addEventHandler(MoEvent.ADDED_TO_SCENE, this.handleAddedToSceneEvent.asDelegate(this));
		this.frameChangeEvent = new MoVideoEvent(MoVideoEvent.FRAME_CHANGE);
		
		this.initializeMedia(MoValueOrDefault(sourceElement, new MoPS3VideoSourceElement()));
	},

	getNaturalSize : function() {
		return new MoSize(this.getSourceElement().videoWidth, this.getSourceElement().videoHeight);
	},
	
	stopImpl : function() {
		this.isPendingStop = false;
		this.sourceElement.stop();
		this.setCurrentState(MoMediaState.Stopped);
	},
	
	close : function() {
		if(MoIsNativeHost())
			this.sourceElement.close();

		this.frameUpdateTimer.stop();
	},

	frameReady : function() {
		this.requestMeasure();
		this.requestLayout();
		
		this.raiseFrameChangeEvent();
	},

	frameUpdate : function() 
	{ 
		if(!this.hasLayout)
			this.requestLayout();
		
		this.raiseFrameChangeEvent();
	},

	measure : function($super) {
		var naturalSize = this.getNaturalSize();
		var measuredWidth = 0;
		var measuredHeight = 0;
		var exactWidth = this.getExactWidth();
		var exactHeight = this.getExactHeight();
		
		if(isNaN(naturalSize.width))
			naturalSize.width = 0;
			
		if(isNaN(naturalSize.height))
			naturalSize.height = 0;

		measuredWidth = naturalSize.width;
		measuredHeight = naturalSize.height;
		
		if(!isNaN(exactWidth) && isNaN(exactHeight) && measuredWidth > 0)
			measuredHeight = this.getExactWidth() * measuredHeight / measuredWidth;
		else if(!isNaN(exactHeight) && isNaN(exactWidth) && measuredHeight > 0)
			measuredWidth = this.getExactHeight() * measuredWidth / measuredHeight;

		this.setMeasuredWidth(measuredWidth);
		this.setMeasuredHeight(measuredHeight);
	},
	
	layout : function($super, unscaledWidth, unscaledHeight) {
		$super(unscaledWidth, unscaledHeight);

		var v = this.sourceElement.nativeVideo;

		if(!MoIsNull(v))
		{
			if(v.width != unscaledWidth || v.height != unscaledHeight)
			{
				v.width = unscaledWidth;
				v.height = unscaledHeight;

				this.hasLayout = true;
			}
		}
	},
	
	handleAddedToSceneEvent : function(event) {
		this.load();
	},

	raiseFrameChangeEvent : function() {
		this.frameChangeEvent.reuse();
		this.dispatchEvent(this.frameChangeEvent, true);
	}
});

Object.extend(MoVideo, {

	// TODO : need to add the video element sources
	fromVideoElement : function(videoElement) {
		var name = (videoElement.id != null ? videoElement.id : (videoElement.name != null ? videoElement.name : ""));
		
		return new MoVideo(name, videoElement);
	}
	
});
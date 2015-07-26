MoVideo = Class.create(MoDrawable, MoMediaBase, {
	initialize : function($super, name, sourceElement) {
		$super(name);

		this.alwaysDirty = true;		
		this.addEventHandler(MoEvent.ADDED_TO_SCENE, this.handleAddedToSceneEvent.asDelegate(this));
		
		this.initializeMedia(MoValueOrDefault(sourceElement, document.createElement("video")));
		this.videoSourceCache = new MoVideoSource(this.getSourceElement());
	},
	
	close : function() {
		
	},

	getNaturalSize : function() {
		return new MoSize(this.getSourceElement().videoWidth, this.getSourceElement().videoHeight);
	},

	frameReady : function() {
		this.requestMeasure();
		this.requestLayout();
		this.raiseFrameChangeEvent();
	},

	frameUpdate : function() 
	{ 
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
		
		this.graphics.clear();
		this.graphics.beginPath();
		this.graphics.drawImage(this.videoSourceCache, 0, 0, unscaledWidth, unscaledHeight);
	},
	
	handleAddedToSceneEvent : function(event) {
		this.load();
	},

	raiseFrameChangeEvent : function() {
		this.dispatchEvent(new MoVideoEvent(MoVideoEvent.FRAME_CHANGE));
	}
});

Object.extend(MoVideo, {

	// TODO : need to add the video element sources
	fromVideoElement : function(videoElement) {
		var name = (videoElement.id != null ? videoElement.id : (videoElement.name != null ? videoElement.name : ""));
		
		return new MoVideo(name, videoElement);
	}
	
});
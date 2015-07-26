MoVideoSource = Class.create(MoImageSource, {
	initialize : function($super, videoElement) {
		$super();
		
		this.videoElement = null;
		
		this.reset();
		this.setVideoElement(videoElement);
	},

	getVideoElement : function() {
		return this.videoElement;
	},

	setVideoElement : function(value) {
		if(this.videoElement != value)
		{
			this.reset();
			this.videoElement = value;
			this.load();
		}
	},
	
	reset : function() {
		this.data = null;
		this.size = MoSize.Zero();
		this.isSourceReady = false;
		this.videoElement = null;
	},

	load : function() {	
		if(this.isSourceReady)
		{
			this.raiseSourceReadyEvent();
			return;
		}

		var duration = this.videoElement.duration;

		if(isNaN(duration) || duration == 0)
			this.videoElement.addEventListener("durationchange", this.handleDurationChangeEvent.bind(this), false);
		else
			this.update();
	},

	update : function() {
		this.data = this.videoElement;
		this.size.width = this.videoElement.videoWidth;
		this.size.height = this.videoElement.videoHeight;
		this.isSourceReady = true;

		this.raiseSourceReadyEvent();
	},

	handleDurationChangeEvent : function(e) {
		this.update();
	}
});

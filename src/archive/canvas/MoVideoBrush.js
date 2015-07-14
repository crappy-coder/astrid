MoVideoBrush = Class.create(MoBrush, {
	initialize : function($super, sourceElement) {
		$super();

		this.sourceElement = sourceElement;
		this.sourceElement.addEventHandler(MoVideoEvent.FRAME_CHANGE, this.handleFrameChangeEvent.asDelegate(this));
		this.isFirstFrame = false;
		
		this.setHorizontalAlignment(MoHorizontalAlignment.Center);
		this.setVerticalAlignment(MoVerticalAlignment.Center);
		this.setStretch(MoStretch.Fill);
		this.setFrame(0);
	},

	getNaturalSize : function() {
		return this.sourceElement.getNaturalSize();
	},

	getSourceElement : function() {
		return this.sourceElement.getSourceElement();
	},
	
	getCurrentPosition : function() {
		return this.sourceElement.getCurrentPosition();
	},
	
	getStretch : function() {
		return this.getPropertyValue("stretch");
	},
	
	setStretch : function(value) {
		this.setPropertyValue("stretch", value);
	},
	
	getHorizontalAlignment : function() {
		return this.getPropertyValue("horizontalAlignment");
	},
	
	setHorizontalAlignment : function(value) {
		this.setPropertyValue("horizontalAlignment", value);
	},
	
	getVerticalAlignment : function() {
		return this.getPropertyValue("verticalAlignment");
	},
	
	setVerticalAlignment : function(value) {
		this.setPropertyValue("verticalAlignment", value);
	},
	
	getFrame : function() {
		return this.getPropertyValue("frame");
	},
	
	setFrame : function(value) {
		this.setPropertyValue("frame", value);
	},

	handleFrameChangeEvent : function(event) {
		if(!this.isFirstFrame)
		{
			this.isFirstFrame = true;
			this.raiseAvailableEvent();
		}

		this.setFrame(this.getFrame() + 1);
	},
	
	isEqualTo : function($super, other) {
		return ($super(other) && this.sourceElement == other.sourceElement);
	}
});
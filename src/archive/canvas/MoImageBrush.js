MoImageBrush = Class.create(MoBrush, {
	initialize : function($super) {
		$super();
		
		/** MoTextureSource **/
		this.texture = null;
		
		this.setHorizontalAlignment(MoHorizontalAlignment.Center);
		this.setVerticalAlignment(MoVerticalAlignment.Center);
		this.setStretch(MoStretch.Fill);
	},

	getSourceUrl : function() {
		return this.getPropertyValue("sourceUrl");
	},

	setSourceUrl : function(value) {
		if(this.setPropertyValue("sourceUrl", value))
			this.loadImage();
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
	
	getStretch : function() {
		return this.getPropertyValue("stretch");
	},
	
	setStretch : function(value) {
		this.setPropertyValue("stretch", value);
	},

	loadImage : function() {
	
		this.texture = null;

		if(this.getSourceUrl() != null)
		{
			this.texture = new MoTextureSource();
			this.texture.addEventHandler(MoSourceEvent.READY, this.onTextureSourceReady.asDelegate(this));
			this.texture.setUrl(this.getSourceUrl());

			this.raisePropertyChangedEvent("texture");
		}
	},
	
	onTextureSourceReady : function(event) {
		this.raiseAvailableEvent();
	},
	
	isEqualTo : function($super, other) {
		return ($super(other) && this.getSourceUrl() == other.getSourceUrl());
	}
});

Object.extend(MoImageBrush, {
	
	fromUrl : function(url) {
		var brush = new MoImageBrush();
		brush.setSourceUrl(url);
		
		return brush;
	}
});
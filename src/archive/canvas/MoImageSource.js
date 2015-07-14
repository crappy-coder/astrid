MoImageSource = Class.create(MoEventDispatcher, {
	initialize : function($super) {
		$super();

		this.isSourceReady = false;
		this.size = MoSize.Zero();
		this.data = null;
	},

	getIsValid : function() {
		return true;
	},

	getNativeData : function() {
		return this.data;
	},

	getIsSourceReady : function() {
		return this.isSourceReady;
	},

	getWidth : function() {
		return this.getSize().width;
	},
	
	getHeight : function() {
		return this.getSize().height;
	},
	
	getSize : function() {
		return this.size;
	},
	
	load : function() {
	
	},

	raiseSourceReadyEvent : function(args) {
		this.dispatchEvent(new MoSourceEvent(MoSourceEvent.READY));
	}
});

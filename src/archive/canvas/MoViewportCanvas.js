MoViewportCanvas = Class.create(MoCanvas, {
	initialize : function($super, name) {
		$super(name);

		this.viewportContent = new MoCanvas(name + "_content");
		this.viewportContent.setPercentWidth(100);
		this.viewportContent.setPercentHeight(100);
		this.isPanning = false;
		this.originX = 0;
		this.originY = 0;
		this.autoPan = true;

		this.setIsHitTestChildrenEnabled(false);
		this.add(this.viewportContent);

		this.addEventHandler(MoMouseEvent.MOUSE_DOWN, this.handleMouseDownEvent.asDelegate(this));
		this.addEventHandler(MoMouseEvent.MOUSE_UP, this.handleMouseUpEvent.asDelegate(this));
		this.addEventHandler(MoMouseEvent.MOUSE_UP_OUTSIDE, this.handleMouseUpOutsideEvent.asDelegate(this));
		this.addEventHandler(MoMouseEvent.MOUSE_LEAVE, this.handleMouseLeaveEvent.asDelegate(this));
		this.addEventHandler(MoMouseEvent.MOUSE_MOVE, this.handleMouseMoveEvent.asDelegate(this));
	},
	
	addContent : function(content) {
		this.viewportContent.add(content);
	},
	
	addContentAt : function(content, idx) {
		this.viewportContent.addAt(content, idx);
	},
	
	removeContent : function(content) {
		return this.viewportContent.remove(content);
	},
	
	removeContentAt : function(idx) {
		return this.viewportContent.removeAt(idx);
	},
	
	removeContentByName : function(name) {
		return this.viewportContent.removeByName(name);
	},
	
	getContentAt : function(idx) {
		return this.viewportContent.getAt(idx);
	},
	
	getContentByName : function(name) {
		return this.viewportContent.getByName(name);
	},
	
	indexOfContent : function(content) {
		return this.viewportContent.indexOf(content);
	},
	
	clearContent : function() {
		this.viewportContent.clear();
	},
	
	isContentEmpty : function() {
		return this.viewportContent.isEmpty();
	},
	
	contentExists : function(content) {
		return this.viewportContent.exists(content);
	},
	
	getContentCount : function() {
		return this.viewportContent.getCount();
	},

	getAutoPan : function() {
		return this.autoPan;
	},

	setAutoPan : function(value) {
		this.autoPan = value;
	},

	getContent : function() {
		return this.viewportContent;
	},

	setContentOffset : function(x, y) {
		this.viewportContent.setX(x);
		this.viewportContent.setY(y);
	},

	getContentOffset : function() {
		return new MoVector2D(this.viewportContent.getX(), this.viewportContent.getY());
	},
	
	handleMouseDownEvent : function(event) {
		if(!this.getAutoPan())
			return;

		var offset = this.getContentOffset();

		this.isPanning = true;
		this.originX = event.x - offset.x;
		this.originY = event.y - offset.y;
	},

	handleMouseUpEvent : function(event) {
		this.isPanning = false;
	},
	
	handleMouseUpOutsideEvent : function(event) {
		this.isPanning = false;
	},
	
	handleMouseLeaveEvent : function(event) {
		this.isPanning = false;
	},

	handleMouseMoveEvent : function(event) {
		if(this.getAutoPan() && this.isPanning)
		{
			var x = event.x - this.originX;
			var y = event.y - this.originY;

			this.setContentOffset(x, y);
		}
	}
});
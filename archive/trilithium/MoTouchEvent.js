MoTouchEvent = Class.create(MoEvent, {
	initialize : function($super, type, touchPoints, scale, rotation, bubbles, cancelable) {
		$super(type, MoValueOrDefault(bubbles, true), MoValueOrDefault(cancelable, true));

		this.points = touchPoints;
		this.scale = scale;
		this.rotation = rotation;
	},
	
	getScale : function() {
		return this.scale;
	},
	
	getRotation : function() {
		return this.rotation;
	},
	
	getAllTouches : function() {
		return this.points;
	}
});

Object.extend(MoTouchEvent, {
	TOUCH_START : "touchStart",
	TOUCH_END : "touchEnd",
	TOUCH_MOVE : "touchMove",
	TOUCH_CANCEL : "touchCancel"
});
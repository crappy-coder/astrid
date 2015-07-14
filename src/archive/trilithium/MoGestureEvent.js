MoGestureEvent = Class.create(MoEvent, {
	initialize : function($super, type, rotation, scale, bubbles, cancelable) {
		$super(type, MoValueOrDefault(bubbles, true), MoValueOrDefault(cancelable, true));
		
		this.rotation = rotation;
		this.scale = scale;
	},
	
	getRotation : function() {
		return this.rotation;
	},
	
	getScale : function() {
		return this.scale;
	}
});

Object.extend(MoGestureEvent, {
	GESTURE_START : "gestureStart",
	GESTURE_CHANGE : "gestureChange",
	GESTURE_END : "gestureEnd"
});
MoDeviceMotionEvent = Class.create(MoEvent, {
	initialize : function($super, type, acceleration, interval, bubbles, cancelable) {
		$super(type, MoValueOrDefault(bubbles, false), MoValueOrDefault(cancelable, false));
		
		this.x = acceleration.x;
		this.y = acceleration.y;
		this.z = acceleration.z;
		this.interval = interval;
	},
	
	getX : function() {
		return this.x;
	},
	
	getY : function() {
		return this.y;
	},
	
	getZ : function() {
		return this.z;
	},
	
	getInterval : function() {
		return this.interval;
	}
});

Object.extend(MoDeviceMotionEvent, {
	CHANGE : "deviceMotionChange"
});
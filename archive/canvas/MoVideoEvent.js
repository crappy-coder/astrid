MoVideoEvent = Class.create(MoEvent, {
	initialize : function($super, type, bubbles, cancelable) {
		$super(type, bubbles, cancelable);
	}
});

Object.extend(MoVideoEvent, {
	FRAME_CHANGE : "videoFrameChange"
});
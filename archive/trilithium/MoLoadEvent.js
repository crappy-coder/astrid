MoLoadEvent = Class.create(MoEvent, {
	initialize : function($super, type, bubbles, cancelable) {
		$super(type, bubbles, cancelable);
	}
});

Object.extend(MoLoadEvent, {
	SUCCESS : "loadSuccess",
	FAILURE : "loadFailure"
});
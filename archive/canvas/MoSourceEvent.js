MoSourceEvent = Class.create(MoEvent, {
	initialize : function($super, type, bubbles, cancelable) {
		$super(type, bubbles, cancelable);
	}
});

Object.extend(MoSourceEvent, {
	READY : "sourceReady",
	CHANGE : "sourceChange"
});
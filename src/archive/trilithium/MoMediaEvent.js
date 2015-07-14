MoMediaEvent = Class.create(MoEvent, {
	initialize : function($super, type, bubbles, cancelable) {
		$super(type, bubbles, cancelable);
	}
});

Object.extend(MoMediaEvent, {
	OPENED : "mediaOpened",
	ENDED : "mediaEnded"
});
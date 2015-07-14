MoFrameEvent = Class.create(MoEvent, {
	initialize : function($super, type, deltaTime, bubbles, cancelable) {
		$super(type, bubbles, cancelable);

		this.deltaTime = deltaTime;
	},

	getDeltaTime : function() {
		return this.deltaTime;
	}
});

Object.extend(MoFrameEvent, {
	ENTER : "enter"
});
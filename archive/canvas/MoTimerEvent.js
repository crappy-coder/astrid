MoTimerEvent = Class.create(MoEvent, {
	initialize : function($super, type, currentTickTime, lastTickTime, bubbles, cancelable) {
		$super(type, bubbles, cancelable);

		this.currentTickTime = MoValueOrDefault(currentTickTime, 0);
		this.lastTickTime = MoValueOrDefault(lastTickTime, 0);
	},
	
	getTickTime : function() {
		return this.currentTickTime;
	},
	
	getLastTickTime : function() {
		return this.lastTickTime;
	},

	getTickDelta : function() {
		return (this.getTickTime() - this.getLastTickTime());
	}
});

Object.extend(MoTimerEvent, {
	TICK : "timerTick",
	COMPLETE : "timerComplete"
});
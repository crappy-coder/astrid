MoNavigationEvent = Class.create(MoEvent, {
	initialize : function($super, type, direction, targetFrom, targetTo, bubbles, cancelable) {
		$super(type, bubbles, cancelable);
		
		this.direction = direction;
		this.targetFrom = MoValueOrDefault(targetFrom, null);
		this.targetTo = MoValueOrDefault(targetTo, null);
	},

	getDirection : function() {
		return this.direction;
	},

	getTargetFrom : function() {
		return this.targetFrom;
	},
	
	getTargetTo : function() {
		return this.targetTo;
	}
});

Object.extend(MoNavigationEvent, {
	ENTER	: "navigationEnter",
	LEAVE	: "navigationLeave"
});
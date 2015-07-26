MoGamepadButtonEvent = Class.create(MoGamepadEvent, {
	initialize : function($super, type, index, button, isDown, timestamp, bubbles, cancelable) {
		$super(type, index, bubbles, cancelable);
		
		this.button = button;
		this.timestamp = timestamp;
		this.isDown = MoValueOrDefault(isDown, false);
	},

	getIsDown : function() {
		return this.isDown;
	},

	getTimestamp : function() {
		return this.timestamp;
	},
	
	getButton : function() {
		return this.button;
	}
});

Object.extend(MoGamepadButtonEvent, {
	DOWN	: "gamepadButtonDown",
	UP		: "gamepadButtonUp"
});
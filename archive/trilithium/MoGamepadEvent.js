MoGamepadEvent = Class.create(MoEvent, {
	initialize : function($super, type, index, bubbles, cancelable) {
		$super(type, bubbles, cancelable);
		
		this.index = index;
	},

	getIndex : function() {
		return this.index;
	}
});

Object.extend(MoGamepadEvent, {
	CONNECTED 		: "connected",
	DISCONNECTED	: "disconnected"
});
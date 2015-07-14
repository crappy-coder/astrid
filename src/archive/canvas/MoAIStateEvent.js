MoAIStateEvent = Class.create(MoEvent, {
	initialize : function($super, type, bubbles, cancelable) {
		$super(type, bubbles, cancelable);
	}
});

Object.extend(MoAIStateEvent, {
	ENTER 	: "aiStateEventEnter",
	EXIT 	: "aiStateEventExit"
});
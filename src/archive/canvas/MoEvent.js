
MoEventPhase = {
	"CAPTURING"	: 1,
	"BUBBLING"	: 2,
	"TARGET"	: 3
};

MoEvent = Class.create(MoEquatable, {
	initialize : function($super, type, bubbles, cancelable) {
		this.type = type;
		this.phase = MoEventPhase.TARGET;
		this.canBubble = MoValueOrDefault(bubbles, false);
		this.canCancel = MoValueOrDefault(cancelable, false);
		this.target = null;
		this.currentTarget = null;
		this.isPropagationStopped = false;
		this.isPropagationStoppedNow = false;
		this.isCanceled = false;
		this.isDispatching = false;
	},
	
	getType : function() {
		return this.type;
	},
	
	getPhase : function() {
		return this.phase;
	},
	
	getCanBubble : function() {
		return this.canBubble;
	},
	
	getCanCancel : function() {
		return this.canCancel;
	},
	
	getTarget : function() {
		return this.target;
	},
	
	getCurrentTarget : function() {
		return this.currentTarget;
	},
	
	getIsDefaultPrevented : function() {
		return this.isCanceled;
	},
	
	preventDefault : function() {
		if(this.canCancel)
			this.isCanceled = true;
	},
	
	stopPropagation : function() {
		this.isPropagationStopped = true;
	},
	
	stopImmediatePropagation : function() {
		this.isPropagationStopped = true;
		this.isPropagationStoppedNow = true;
	},
	
	reuse : function() {
		this.phase = MoEventPhase.TARGET;
		this.target = null;
		this.currentTarget = null;
		this.isPropagationStopped = false;
		this.isPropagationStoppedNow = false;
		this.isCanceled = false;
		this.isDispatching = false;

		return this;
	},
	
	toString : function() {
		return this.getType();
	}
});

Object.extend(MoEvent, {
	APPLICATION_START : "applicationStart",
	APPLICATION_EXIT : "applicationExit",
	RENDER : "render",
	RENDER_COMPLETE : "renderComplete",
	PRE_INIT : "preInit",
	INIT_COMPLETE : "initComplete",
	CHILDREN_CREATED : "childrenCreated",
	SHOW : "show",
	HIDE : "hide",
	CREATED : "created",
	UPDATED : "updated",
	LAYOUT_UPDATED : "layoutUpdated",
	PARENT_CHANGED : "parentChanged",
	POSITION_CHANGED : "positionChanged",
	RESIZED : "resized",
	FOCUS_IN : "focusIn",
	FOCUS_OUT : "focusOut",
	ADDED_TO_SCENE : "addedToScene",
	REMOVED_FROM_SCENE : "removedFromScene",
	CHANGE : "change",
	UI_ORIENTATION_CHANGE : "uiOrientationChange"
});

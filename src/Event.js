import Equatable from "./Equatable";

var EventPhase = {
	"CAPTURING"	: 1,
	"BUBBLING"	: 2,
	"TARGET"	: 3
};

class Event extends Equatable {
	constructor(type, bubbles, cancelable) {
		super();
		this.type = type;
		this.phase = EventPhase.TARGET;
		this.canBubble = MoValueOrDefault(bubbles, false);
		this.canCancel = MoValueOrDefault(cancelable, false);
		this.target = null;
		this.currentTarget = null;
		this.isPropagationStopped = false;
		this.isPropagationStoppedNow = false;
		this.isCanceled = false;
		this.isDispatching = false;
	}
	
	getType() {
		return this.type;
	}
	
	getPhase() {
		return this.phase;
	}
	
	getCanBubble() {
		return this.canBubble;
	}
	
	getCanCancel() {
		return this.canCancel;
	}
	
	getTarget() {
		return this.target;
	}
	
	getCurrentTarget() {
		return this.currentTarget;
	}
	
	getIsDefaultPrevented() {
		return this.isCanceled;
	}
	
	preventDefault() {
		if(this.canCancel)
			this.isCanceled = true;
	}
	
	stopPropagation() {
		this.isPropagationStopped = true;
	}
	
	stopImmediatePropagation() {
		this.isPropagationStopped = true;
		this.isPropagationStoppedNow = true;
	}
	
	reuse() {
		this.phase = EventPhase.TARGET;
		this.target = null;
		this.currentTarget = null;
		this.isPropagationStopped = false;
		this.isPropagationStoppedNow = false;
		this.isCanceled = false;
		this.isDispatching = false;

		return this;
	}
	
	toString() {
		return this.getType();
	}
}

Event.APPLICATION_START = "applicationStart";
Event.APPLICATION_EXIT = "applicationExit";
Event.RENDER = "render";
Event.RENDER_COMPLETE = "renderComplete";
Event.PRE_INIT = "preInit";
Event.INIT_COMPLETE = "initComplete";
Event.CHILDREN_CREATED = "childrenCreated";
Event.SHOW = "show";
Event.HIDE = "hide";
Event.CREATED = "created";
Event.UPDATED = "updated";
Event.LAYOUT_UPDATED = "layoutUpdated";
Event.PARENT_CHANGED = "parentChanged";
Event.POSITION_CHANGED = "positionChanged";
Event.RESIZED = "resized";
Event.FOCUS_IN = "focusIn";
Event.FOCUS_OUT = "focusOut";
Event.ADDED_TO_SCENE = "addedToScene";
Event.REMOVED_FROM_SCENE = "removedFromScene";
Event.CHANGE = "change";
Event.UI_ORIENTATION_CHANGE = "uiOrientationChange";

export { EventPhase };
export default Event;

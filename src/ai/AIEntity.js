import EventDispatcher from "./../EventDispatcher";
import AIStateMachine from "./AIStateMachine";
import Event from "./../Event";

/**
 * SUMMARY:
 *	This class implements the minimum for an AI Entity, by itself it does nothing
 *	useful, however, when subclassed you can take advantage of the finite state
 *	machine and update processing.
 *
 * REMARKS:
 *	To allow for an instance of this class to be updated during the core application's
 *	update cycle, it will need to be added to a DisplaySurface by using the addAIEntity
 *	method. However, it's more convienent to just use the DisplaySurface.createAIEntity
 *	method instead, which will create an instance of your object and add it to the main
 *	update loop.
 *
 * @EVENT Event.CHANGE
 *
 * SUMMARY:
 *	Dispatched when the state has changed.
 *
 */
class AIEntity extends EventDispatcher {
	constructor(name) {
		/**
		 * SUMMARY:
		 *	Initializes a new instance of this class with the specified name.
		 *	You should not initialize this class directly.
		 *
		 * PARAMS:
		 *	String name:
		 *		Any name to identify this instance by.
		 */
		super();

		this.name = name;
		this.stateMachine = new AIStateMachine();
	}

	getName() {
		/**
		 * SUMMARY:
		 *	Gets the name of this entity.
		 *
		 * RETURNS (String):
		 *	The entity's name.
		 */
		return this.name;
	}

	update(t) {
		/**
		 * SUMMARY:
		 *	The default behaviour of this method is to simply update
		 *	this entity's state machine. Subclasses should override this
		 *	method to provide their own update logic, which is called once
		 *	per frame, before rendering occurs.
		 *
		 *	When overriding from a subclass, you should always call super.
		 *
		 * PARAMS:
		 *	Number t:
		 *		The time delta between frame updates.
		 *
		 * RETURNS (void):
		 */
		this.stateMachine.update(t);
	}

	goToState(newState) {
		/**
		 * SUMMARY:
		 *	Changes the state of this entity and dispatches a change event
		 *	to registered listeners.
		 *
		 * PARAMS:
		 *	AIState newState:
		 *		A new AI state to enter into.
		 *
		 * RETURNS (void):
		 */
		if (newState != null) {
			newState.target = this;
		}

		this.getStateMachine().goToState(newState);
		this.dispatchEvent(new Event(Event.CHANGE));
	}

	getCurrentState() {
		/**
		 * SUMMARY:
		 *	Gets the state that this entity is currently in.
		 *
		 * RETURNS (AIState):
		 *	Returns a state object representing the entity's current state.
		 */
		return this.getStateMachine().getState();
	}

	getStateMachine() {
		/**
		 * SUMMARY:
		 *	Gets the instance of the state machine used by this entity.
		 *
		 * RETURNS (AIStateMachine):
		 */
		return this.stateMachine;
	}

	static create(name, objectType) {
		/**
		 * SUMMARY:
		 *	Creates a new instance of your AI entity, if this method is used then
		 *	you should call addAIEntity on a DisplaySurface if you need it's update
		 *	method called.
		 *
		 * PARAMS:
		 *	String name:
		 *		Any name to identify this instance by, this will be sent into the
		 *		constructor.
		 *
		 *	Any objectType:
		 *		The class type you wish to create, this must be a subclass of AIEntity.
		 *
		 * RETURNS (Any):
		 *	A new instance of your AIEntity.
		 */
		return new objectType(name);
	}
}

export default AIEntity;

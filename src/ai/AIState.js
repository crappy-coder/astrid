import EventDispatcher from "../EventDispatcher";
import AIStateEvent from "./AIStateEvent";

class AIState extends EventDispatcher {
	constructor(name) {
		super();

		this.name = name;
		this.target = null;
	}

	getName() {
		return this.name;
	}

	getTarget() {
		return this.target;
	}

	enter(fromState) {
		/** override **/
		this.dispatchEvent(new AIStateEvent(AIStateEvent.ENTER));
	}

	exit(toState) {
		/** override **/
		this.dispatchEvent(new AIStateEvent(AIStateEvent.EXIT));

		return true;
	}

	update(t) {
		/** override **/
	}
}

export default AIState;

import EventDispatcher from "./../EventDispatcher";

class AIStateMachine extends EventDispatcher {
	constructor() {
		super();

		this.state = AIStateMachine.AI_STATE_UNKNOWN;
	}

	update(t) {
		if (this.hasState()) {
			this.state.update(t);
		}
	}

	getState() {
		return this.state;
	}

	hasState() {
		return (this.state != AIStateMachine.AI_STATE_UNKNOWN);
	}

	goToState(newState) {
		if (this.state == newState) return;

		var previousState = this.state;
		var canSwitch = true;

		if (this.hasState()) {
			canSwitch = this.state.exit(newState);
		}

		if (canSwitch) {
			if (previousState != null) {
				previousState.target = null;
			}

			this.state = newState;

			if (this.hasState()) {
				this.state.enter(previousState);
			}
		}
	}
}

AIStateMachine.AI_STATE_UNKNOWN = null;

export default AIStateMachine;

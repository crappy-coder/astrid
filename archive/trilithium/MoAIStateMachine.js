MoAIStateMachine = Class.create(MoEventDispatcher, {
	initialize : function($super) {
		$super();
		
		this.state = MoAIStateMachine.AI_STATE_UNKNOWN;
	},
	
	update : function(t) {
		if(this.hasState())
			this.state.update(t);
	},
	
	getState : function() {
		return this.state;
	},
	
	hasState : function() {
		return (this.state != MoAIStateMachine.AI_STATE_UNKNOWN);
	},

	goToState : function(newState) {
		if(this.state == newState)
			return;
	
		var previousState = this.state;
		var canSwitch = true;
		
		if(this.hasState())
		{
			canSwitch = this.state.exit(newState);
		}

		if(canSwitch)
		{
			if(previousState != null)
				previousState.target = null;
		
			this.state = newState;

			if(this.hasState())
				this.state.enter(previousState);
		}
	}
});

Object.extend(MoAIStateMachine, {
	AI_STATE_UNKNOWN : null
});
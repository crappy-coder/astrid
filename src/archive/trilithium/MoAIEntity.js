MoAIEntity = Class.create(MoEventDispatcher, {
	initialize : function($super, name) {
		$super();
		
		this.name = name;
		this.stateMachine = new MoAIStateMachine();
	},
	
	getName : function() {
		return this.name;
	},
	
	update : function(t) {
		this.stateMachine.update(t);
	},
	
	goToState : function(newState) {
		if(!MoIsNull(newState))
			newState.target = this;

		this.getStateMachine().goToState(newState);
		this.dispatchEvent(new MoEvent(MoEvent.CHANGE));
	},

	getCurrentState : function() {
		return this.getStateMachine().getState();
	},
	
	getStateMachine : function() {
		return this.stateMachine;
	}
});

Object.extend(MoAIEntity, {
	create : function(name, objectType) {
		return new objectType(name);
	}
});
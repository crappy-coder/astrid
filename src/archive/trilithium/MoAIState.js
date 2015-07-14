MoAIState = Class.create(MoEventDispatcher, {
	initialize : function($super, name) {
		$super();

		this.name = name;
		this.target = null;
	},

	getName : function() {
		return this.name;
	},
	
	getTarget : function() {
		return this.target;
	},

	enter : function(fromState) {
		/** override **/
		this.dispatchEvent(new MoAIStateEvent(MoAIStateEvent.ENTER));
	},
	
	exit : function(toState) {
		/** override **/
		this.dispatchEvent(new MoAIStateEvent(MoAIStateEvent.EXIT));
		
		return true;
	},

	update : function(t) {
		/** override **/
	}
});
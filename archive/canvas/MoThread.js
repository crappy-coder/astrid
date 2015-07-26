MoThread = Class.create({
	initialize : function(callback) {
		this.threadCallback = callback;
		this.threadTarget = null;
		this.threadArgs = null;
	},
	
	getCallback : function() {
		return this.threadCallback;
	},

	setCallback : function(value) {
		this.threadCallback = value;
	},

	start : function(target) {
		this.threadTarget = target;

		// remove the target from the arguments
		if(arguments.length > 1)
			this.threadArgs = $A(arguments).slice(1);

		return window.setTimeout((function() {
			return this.threadCallback.apply(this.threadTarget, this.threadArgs);
		}).bind(this), 0);
	}
});
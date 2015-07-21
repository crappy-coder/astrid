class Thread {
	constructor(callback) {
		this.threadCallback = callback;
		this.threadTarget = null;
		this.threadArgs = null;
	}

	getCallback() {
		return this.threadCallback;
	}

	setCallback(value) {
		this.threadCallback = value;
	}

	start(target) {
		this.threadTarget = target;

		// remove the target from the arguments
		if (arguments.length > 1) {
			this.threadArgs = $A(arguments).slice(1);
		}

		return window.setTimeout((function () {
			return this.threadCallback.apply(this.threadTarget, this.threadArgs);
		}).bind(this), 0);
	}
}

export default Thread;

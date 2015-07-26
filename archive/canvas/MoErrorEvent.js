MoErrorEvent = Class.create(MoEvent, {
	initialize : function($super, type, code, message, bubbles, cancelable) {
		$super(type, bubbles, cancelable);

		/** Number **/
		this.errorCode = MoValueOrDefault(code, 0);

		/** String **/
		this.errorMessage = MoValueOrDefault(message, null);
	},

	getErrorCode : function() {
		return this.errorCode;
	},

	getErrorMessage : function() {
		return this.errorMessage;
	},

	toString : function() {
		return "ErrorEvent[ code=" + this.getErrorCode() + ", message=" + this.getErrorMessage() + " ]";
	}
});

Object.extend(MoErrorEvent, {
	ERROR : "error"
});

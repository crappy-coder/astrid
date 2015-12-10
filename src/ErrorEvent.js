import Event from "./Event"

class ErrorEvent extends Event {
	constructor(type, code, message, bubbles, cancelable) {
		super(type, bubbles, cancelable);

		/** Number **/
		this.errorCode = astrid.valueOrDefault(code, 0);

		/** String **/
		this.errorMessage = astrid.valueOrDefault(message, null);
	}

	getErrorCode() {
		return this.errorCode;
	}

	getErrorMessage() {
		return this.errorMessage;
	}

	toString() {
		return "ErrorEvent[ code=" + this.getErrorCode() + ", message=" + this.getErrorMessage() + " ]";
	}
}

ErrorEvent.ERROR = "error";

export default ErrorEvent;

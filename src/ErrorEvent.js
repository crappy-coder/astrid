import { ValueOrDefault } from "./Engine";

class ErrorEvent extends Event {
	constructor(type, code, message, bubbles, cancelable) {
		super(type, bubbles, cancelable);

		/** Number **/
		this.errorCode = ValueOrDefault(code, 0);

		/** String **/
		this.errorMessage = ValueOrDefault(message, null);
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

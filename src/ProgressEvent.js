import Event from "./Event";

class ProgressEvent extends Event {
	constructor(type, current, total, bubbles, cancelable) {
		super(type, bubbles, cancelable);

		/** Number **/
		this.current = astrid.valueOrDefault(current, 0);

		/** Number **/
		this.total = astrid.valueOrDefault(total, 0);
	}

	getPercentage() {
		if (this.getTotal() == 0) {
			return 0;
		}

		return (this.getCurrent() / this.getTotal());
	}

	getCurrent() {
		return this.current;
	}

	getTotal() {
		return this.total;
	}

	toString() {
		return "ProgressEvent[ current=" + this.getCurrent() + ", total=" + this.getTotal() + " ]";
	}
}

ProgressEvent.PROGRESS = "progress";

export default ProgressEvent;

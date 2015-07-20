import { ValueOrDefault } from "./Engine";

class DashStyle {
	constructor(dashes, offset) {

		/** Number[] **/
		this.dashes = ValueOrDefault(dashes, []);

		/** Number **/
		this.offset = ValueOrDefault(offset, 0);
	}

	getDashes() {
		return this.dashes;
	}

	setDashes(value) {
		this.dashes = value;
	}

	getOffset() {
		return this.offset;
	}

	setOffset(value) {
		this.offset = value;
	}
}

// ----
DashStyle.Solid = new DashStyle();

// * * * *
DashStyle.Dot = new DashStyle([1, 2], 0);

// - - - -
DashStyle.Dash = new DashStyle([2, 2], 2);

// - * - * - * -
DashStyle.DashDot = new DashStyle([2, 2, 1, 2], 1);

// - * * - * * -
DashStyle.DashDotDot = new DashStyle([2, 2, 1, 2, 1, 2, 1], 1);

export default DashStyle;

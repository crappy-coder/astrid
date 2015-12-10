import Equatable from "../Equatable";

class BorderMetrics extends Equatable {
	constructor(left, top, right, bottom) {
		super();
		this.left = astrid.valueOrDefault(left, 0);
		this.top = astrid.valueOrDefault(top, 0);
		this.right = astrid.valueOrDefault(right, 0);
		this.bottom = astrid.valueOrDefault(bottom, 0);
	}

	getLeft() {
		return this.left;
	}

	setLeft(value) {
		this.left = value;
	}

	getTop() {
		return this.top;
	}

	setTop(value) {
		this.top = value;
	}

	getRight() {
		return this.right;
	}

	setRight(value) {
		this.right = value;
	}

	getBottom() {
		return this.bottom;
	}

	setBottom(value) {
		this.bottom = value;
	}

	getSizeX() {
		return this.left + this.right;
	}

	getSizeY() {
		return this.top + this.bottom;
	}

	isZero() {
		return (this.left == 0 &&
		this.top == 0 &&
		this.right == 0 &&
		this.bottom == 0);
	}

	isEqualTo(obj) {
		return (this.left == obj.left && this.top == obj.top && this.right == obj.right && this.bottom == obj.bottom);
	}

	toString() {
		return ("left:" + this.left + ", top:" + this.top + ", right:" + this.right + ", bottom:" + this.bottom);
	}

	static Zero() {
		return new BorderMetrics(0, 0, 0, 0);
	}

	static fromUniform(value) {
		return new BorderMetrics(value, value, value, value);
	}
}

export default BorderMetrics;

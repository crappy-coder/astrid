import Equatable from "../Equatable";

class CornerRadius extends Equatable {
	constructor(tl, tr, bl, br) {
		super();

		this.topLeft = tl;
		this.topRight = tr;
		this.bottomLeft = bl;
		this.bottomRight = br;
	}

	getTopLeft() {
		return this.topLeft;
	}

	setTopLeft(value) {
		this.topLeft = value;
	}

	getTopRight() {
		return this.topRight;
	}

	setTopRight(value) {
		this.topRight = value;
	}

	getBottomLeft() {
		return this.bottomLeft;
	}

	setBottomLeft(value) {
		this.bottomLeft = value;
	}

	getBottomRight() {
		return this.bottomRight;
	}

	setBottomRight(value) {
		this.bottomRight = value;
	}

	isUniform() {
		return (this.topLeft == this.topRight &&
			this.topLeft == this.bottomLeft &&
			this.topLeft == this.bottomRight);
	}

	isSquare() {
		return (this.isUniform() && this.topLeft == 0);
	}

	isEqualTo(obj) {
		return (this.topLeft == obj.topLeft &&
			this.topRight == obj.topRight &&
			this.bottomLeft == obj.bottomLeft &&
			this.bottomRight == obj.bottomRight);
	}

	toString() {
		return "CornerRadius[ tl=" + this.getTopLeft() + ", tr=" + this.getTopRight() + ", bl=" +
			this.getBottomLeft() + ", br=" + this.getBottomRight() + " ]";
	}

	static fromUniform(value) {
		return new CornerRadius(value, value, value, value);
	}
}

export default CornerRadius;

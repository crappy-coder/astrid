import Equatable from "./Equatable";

class Size extends Equatable {
	constructor(width, height) {
		super();

		this.width = astrid.valueOrDefault(width, 0);
		this.height = astrid.valueOrDefault(height, 0);

		if (this.width < 0 || this.height < 0) {
			throw new Error("width and height must be a non-negative value.");
		}
	}

	isEmpty() {
		return (this.width < 0);
	}

	isEqualTo(obj) {
		return (this.width == obj.width && this.height == obj.height);
	}

	toString() {
		return ("width:" + this.width + ", height:" + this.height);
	}

	static Empty() {
		var s = Size.Zero();
		s.width = astrid.math.NegativeInfinity;
		s.height = astrid.math.NegativeInfinity;

		return s;
	}

	static Zero() {
		return new Size(0, 0);
	}
}

export default Size;

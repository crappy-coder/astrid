import Equatable from "./Equatable";
import { NegativeInfinity } from "./EngineMath";
import { ValueOrDefault } from "./Engine";

class Size extends Equatable {
	constructor(width, height) {
		super();

		this.width = ValueOrDefault(width, 0);
		this.height = ValueOrDefault(height, 0);

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
		s.width = NegativeInfinity;
		s.height = NegativeInfinity;

		return s;
	}

	static Zero() {
		return new Size(0, 0);
	}
}

export default Size;

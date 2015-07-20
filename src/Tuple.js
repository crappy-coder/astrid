class Tuple {
	constructor(first, second, third) {
		this.first = first;
		this.second = second;
		this.third = third;
	}

	getFirst() {
		return this.first;
	}

	setFirst(value) {
		this.first = value;
	}

	getSecond() {
		return this.second;
	}

	setSecond(value) {
		this.second = value;
	}

	getThird() {
		return this.third;
	}

	setThird(value) {
		this.third = value;
	}

	toString() {
		return "Tuple[ first: " + this.first + ", second: " + this.second + ", third: " + this.third + " ]";
	}
}

export default Tuple;

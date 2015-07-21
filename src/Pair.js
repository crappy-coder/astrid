class Pair {
	constructor(first, second) {
		this.first = first;
		this.second = second;
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

	toString() {
		return "Pair[ first: " + this.first + ", second: " + this.second + " ]";
	}
}

export default Pair;

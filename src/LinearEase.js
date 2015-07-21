import { ValueOrDefault } from "./Engine";

class LinearEase {
	constructor(easeInFraction, easeOutFraction) {
		this.easeInFraction = ValueOrDefault(easeInFraction, 0);
		this.easeOutFraction = ValueOrDefault(easeOutFraction, 0);
	}

	getEaseInFraction() {
		return this.easeInFraction;
	}

	setEaseInFraction(value) {
		this.easeInFraction = value;
	}

	getEaseOutFraction() {
		return this.easeOutFraction;
	}

	setEaseOutFraction(value) {
		this.easeOutFraction = value;
	}

	ease(t) {
		if (this.easeInFraction == 0 && this.easeOutFraction == 0) {
			return t;
		}

		var runRate = 1 / (1 - this.easeInFraction / 2 - this.easeOutFraction / 2);

		if (t < this.easeInFraction) {
			return t * runRate * (t / this.easeInFraction) / 2;
		}

		if (t > (1 - this.easeOutFraction)) {
			var decTime = t - (1 - this.easeOutFraction);
			var decProportion = decTime / this.easeOutFraction;

			return runRate * (1 - this.easeInFraction / 2 - this.easeOutFraction + decTime * (2 - decProportion) / 2);
		}

		return runRate * (t - this.easeInFraction / 2);
	}
}

export default LinearEase;

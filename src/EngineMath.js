import Vector2D from "./Vector2D";

export var NegativeInfinity = Number.NEGATIVE_INFINITY;
export var PositiveInfinity = Number.POSITIVE_INFINITY;
export var Epsilon = Math.pow(2, -52);
export var DegreeToRadian = Math.PI / 180;
export var RadianToDegree = 180 / Math.PI;
export var MaxInt = 0x7fffffff;
export var MinInt = -2147483648;
export var MaxFloat = Number.MAX_VALUE;
export var MinFloat = Number.MIN_VALUE;
export var MaxShort = 0x7fff;
export var MinShort = -32768;
export var MaxByte = 255;
export var MinByte = 0;

export default {

	isNaN: function (num) {
		return isNaN(num);
	},

	isInfinity: function (num) {
		return (this.isPositiveInfinity(num) ||
		this.isNegativeInfinity(num));
	},

	isPositiveInfinity: function (num) {
		return (num == PositiveInfinity);
	},

	isNegativeInfinity: function (num) {
		return (num == NegativeInfinity);
	},

	isZero: function (num) {
		return (Math.abs(num) <= Epsilon);
	},

	signum: function (num) {
		if (num > 0) {
			return 1.0;
		}

		if (num < 0) {
			return -1.0;
		}

		return 0.0;
	},

	signEpsilon: function (num) {
		if (num > Epsilon) {
			return 1.0;
		}

		if (num < -Epsilon) {
			return -1.0;
		}

		return 0.0;
	},

	clamp: function (value, min, max) {
		return Math.max(Math.min(value, max), min);
	},

	normalize: function (value, start, end) {
		if (start == end) {
			throw new Error("start must not be equal to end");
		}

		var delta = end - start;
		var offset = value - start;

		return (offset - (Math.floor(offset / delta) * delta) + start);
	},

	normalizeAngle: function (angle) {
		return (angle % 360);
	},

	normalizeZero: function (num) {
		if (num <= 0 || EngineMath.isZero(num)) {
			return 0;
		}

		return num;
	},

	pointOfAngle: function (radians) {
		return new Vector2D(
			Math.cos(radians),
			Math.sin(radians));
	},

	hypot: function (x, y) {
		return Math.sqrt(x * x + y * y) || 0;
	},

	degreesToRadians: function (degrees) {
		return ((degrees * Math.PI) / 180);
	},

	radiansToDegrees: function (radians) {
		return ((radians * 180) / Math.PI);
	},

	randomTo: function (max) {
		return (Math.random() * max);
	},

	randomIntTo: function (max) {
		return Math.round(EngineMath.randomTo(max));
	},

	randomInRange: function (min, max) {
		return (Math.random() * (max - min)) + min;
	},

	randomIntInRange: function (min, max) {
		return Math.round(EngineMath.randomInRange(min, max));
	},

	round: function (value) {
		// a fast rounding technique via bitwise truncation
		// TODO : fix negative values, for the most part they work fine, however if
		//		  the value is directly on the .5 boundary it rounds in the wrong direction,
		//		  should be a simple fix, but i need sleep, revisit this later. -JT

		return ((value + (value >= 0 ? 0.5 : -0.5)) | 0);
	},

	evenRoundDown: function (value) {
		return (value & ~1);
	},

	evenRoundUp: function (value) {
		return ((value + 1) & ~1);
	},

	toInt: function (value) {
		return this.toPrecision(value, 0);
	},

	toPrecision: function (value, n) {
		return Number(value.toFixed(n));
	}
};

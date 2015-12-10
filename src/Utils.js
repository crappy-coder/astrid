import Equatable from "./Equatable"
import Vector2D from "./Vector2D"

const Utils = {
	format: function(str) {
		var i = 1;
		var args = arguments;
		var argsLen = args.length;

		var formatValue = function(value) {
			if(Utils.isDate(value)) {
				return Date.prototype.toString.call(value);
			}
			else if(Utils.isError(value)) {
				return Error.prototype.toString.call(value);
			}
			else if(Utils.isFunction(value)) {
				return "[Function" + (value.name ? ": " + value.name : "") + "]";
			}
			else {
				return "" + value;
			}
		};


		if(!Utils.isString(str)) {
			var objs = [];

			for(i = 0; i < argsLen; ++i) {
				objs.push(formatValue(args[i]));
			}

			return objs.join(" ");
		}

		str = String(str).replace(/%[sdijxX%]/g, function(m) {
			if(m === "%%") {
				return "%";
			}

			if(i >= argsLen) {
				return m;
			}

			switch(m) {
				case "%s":
					return String(args[i++]);
				case "%d":
					return Number(args[i++]);
				case "%i":
					return Math.floor(Number(args[i++]));
				case "%x":
					return "0x" + Number(args[i++]).toString(16);
				case "%X":
					return "0x" + Number(args[i++]).toString(16).toUpperCase();
				case "%j":
					try {
						return JSON.stringify(args[i++]);
					}
					catch(e) {
						void(e);
						return "[...]";
					}
				default:
					return m;
			}
		});

		for(var a = args[i]; i < argsLen; a = args[++i]) {
			str += " " + formatValue(a);
		}

		return str;
	},

	valueOrDefault: function(value, defaultValue) {
		return (Utils.isNullOrUndefined(value) ? defaultValue : value);
	},

	argumentOrDefault: function(args, index, defaultValue) {
		if(args && args.length > index)
			return Utils.valueOrDefault(args[index], defaultValue);

		return defaultValue;
	},

	toString: function(value) {
		return Object.prototype.toString.call(value);
	},

	toInt: function(value) {
		return (value >> 0);
	},

	isUndefined: function(value) {
		return (value === void(0));
	},

	isNotUndefined: function(value) {
		return !Utils.isUndefined(value);
	},

	isNull: function(value, includeUndefined) {
		includeUndefined = Utils.valueOrDefault(includeUndefined, true);

		return (includeUndefined ? Utils.isNullOrUndefined(value) : value === null);
	},

	isNotNull: function(value, includeUndefined) {
		return !Utils.isNull(value, includeUndefined);
	},

	isNullOrUndefined: function(value) {
		return (value === null || Utils.isUndefined(value));
	},

	isNotNullOrUndefined: function(value) {
		return !Utils.isNullOrUndefined(value);
	},

	isStringNullOrEmpty: function(value) {
		return (Utils.isNullOrUndefined(value) || (Utils.isString(value) && value.length === 0));
	},

	isStringNotNullOrEmpty: function(value) {
		return !Utils.isStringNullOrEmpty(value);
	},

	isArray: function(value) {
		return Array.isArray(value);
	},

	isBoolean: function(value) {
		return (typeof value === "boolean");
	},

	isDate: function(value) {
		return (Utils.isObject(value) && Utils.toString(value) === "[object Date]");
	},

	isError: function(value) {
		return (Utils.isObject(value) && (Utils.toString(value) === "[object Error]" || value instanceof Error));
	},

	isFunction: function(value) {
		return (typeof value === "function");
	},

	isNumber: function(value) {
		return (typeof value === "number");
	},

	isInteger: function(value) {
		if(Number.isInteger)
			return Number.isInteger(value);

		return (Utils.isNumber(value) && isFinite(value) && value > -9007199254740992 && value < 9007199254740992 && Math.floor(value) === value);
	},

	isObject: function(value) {
		return (typeof value === "object" && !Utils.isNull(value));
	},

	isString: function(value) {
		return (typeof value === "string");
	},

	areEqual: function(a, b) {
		if (a != null && b != null) {
			if ((a instanceof Equatable) && (b instanceof Equatable)) {
				if (a.constructor === b.constructor) {
					return a.isEqualTo(b);
				}
			}
			else if ((a instanceof Array) && (b instanceof Array)) {
				if (a.length != b.length) {
					return false;
				}

				var arrLen = a.length;
				var arrItemA = null;
				var arrItemB = null;

				for (var i = 0; i < arrLen; ++i) {
					arrItemA = a[i];
					arrItemB = b[i];

					if (!Utils.areEqual(arrItemA, arrItemB)) {
						return false;
					}
				}

				return true;
			}
		}

		return (a == b);
	},

	areNotEqual: function(a, b) {
		return !Utils.areEqual(a, b);
	},

	mixin: function(parentClass, objMixin) {
		class Mixed extends parentClass {}
		Object.assign(Mixed.prototype, objMixin);

		return Mixed;
	},

	// common math constants and utils
	math: {
		NegativeInfinity: Number.NEGATIVE_INFINITY,
		PositiveInfinity: Number.POSITIVE_INFINITY,
		Epsilon: Math.pow(2, -52),
		DegreeToRadian: Math.PI / 180,
		RadianToDegree: 180 / Math.PI,
		MinInt: -2147483648,
		MaxInt: 0x7fffffff,
		MinFloat: Number.MIN_VALUE,
		MaxFloat: Number.MAX_VALUE,
		MinShort: -32768,
		MaxShort: 0x7fff,
		MinByte: 0,
		MaxByte: 255,

		isNaN: function (num) {
			return isNaN(num);
		},

		isInfinity: function (num) {
			return (Utils.math.isPositiveInfinity(num) || Utils.math.isNegativeInfinity(num));
		},

		isPositiveInfinity: function (num) {
			return (num === Utils.math.PositiveInfinity);
		},

		isNegativeInfinity: function (num) {
			return (num === Utils.math.NegativeInfinity);
		},

		isZero: function (num) {
			return (Math.abs(num) <= Utils.math.Epsilon);
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
			if (num > Utils.math.Epsilon) {
				return 1.0;
			}

			if (num < -Utils.math.Epsilon) {
				return -1.0;
			}

			return 0.0;
		},

		clamp: function (value, min, max) {
			return Math.max(Math.min(value, max), min);
		},

		normalize: function (value, start, end) {
			if (start === end) {
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
			if (num <= 0 || Utils.math.isZero(num)) {
				return 0;
			}

			return num;
		},

		pointOfAngle: function (radians) {
			return new Vector2D(Math.cos(radians), Math.sin(radians));
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
			return Math.round(Utils.math.randomTo(max));
		},

		randomInRange: function (min, max) {
			return (Math.random() * (max - min)) + min;
		},

		randomIntInRange: function (min, max) {
			return Math.round(Utils.math.randomInRange(min, max));
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
			return Utils.math.toPrecision(value, 0);
		},

		toPrecision: function (value, n) {
			return Number(value.toFixed(n));
		}
	}
};

export default Utils;

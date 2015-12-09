
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
	}
};

export default Utils;

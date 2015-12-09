import DebugLevel from "./DebugLevel"

const Debug = {
	write: function write(msg, level) {
		if (!Debug.hasConsole()) {
			return;
		}

		var args = Array.prototype.splice.call(arguments, 2);
		var fmsg = String.format(msg, args);

		switch (level) {
			case DebugLevel.INFO:
				console.info(fmsg);
				break;
			case DebugLevel.WARNING:
				console.warn(fmsg);
				break;
			case DebugLevel.ERROR:
				console.error(fmsg);
				break;
			case DebugLevel.NORMAL:
			default:
				console.log(fmsg);
				break;
		}
	},

	info: function info(msg) {
		Debug.write.apply(null, [msg, DebugLevel.INFO].concat(Array.prototype.slice.call(arguments, 1)));
	},

	warn: function warn(msg) {
		Debug.write.apply(null, [msg, DebugLevel.WARNING].concat(Array.prototype.slice.call(arguments, 1)));
	},

	error: function eror(msg) {
		Debug.write.apply(null, [msg, DebugLevel.ERROR].concat(Array.prototype.slice.call(arguments, 1)));
	},

	hasConsole: function hasConsole() {
		return !!(window.console && window.console.log);
	},

	logEvents: function logEvents(domElement /** ... **/) {
		var len = arguments.length;
		var extraData, arg, obj;

		if (len > 0 && arguments[len - 1] instanceof Array) {
			extraData = arguments[len - 1];
			len -= 1;
		}

		obj = {
			callback: function (e) {
				var str = "";

				if (this.extraData != null) {
					for (var i = 0; i < this.extraData.length; ++i) {
						str += this.extraData[i] + "=" + e.target[this.extraData[i]];

						if (i < this.extraData.length - 1) {
							str += ", ";
						}
					}
				}

					if (Debug.hasConsole()) {
						console.log("%c[EVENT] - %s (%s)", "color:blue;font-weight:bold", e.type, str);
					}
			},
			extraData: extraData
		};

		for (var i = 1; i < len; ++i) {
			arg = arguments[i];
			domElement.addEventListener(arg, obj.callback.bind(obj), false);
		}
	}
};

export default Debug;

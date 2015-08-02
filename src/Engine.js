import Stack from "./Stack";
import Application from "./Application";
import System from "./System";
import Equatable from "./Equatable";

/*
 *  astrid
 *
 *  Graphics development engine for building cross platform games and applications.
 *
 *  Created by Justin Thomas on 04/04/2010
 *  Copyright 2010-2012 Justin Thomas. All rights reserved.
 *
 */

export var Version = "1.0";
export var PrintMeasureOrder = false;
export var PrintLayoutOrder = false;

export var DebugLevel = {
	"Normal": 1,
	"Info": 2,
	"Warning": 3,
	"Error": 4
};

var NullGamepads = [null, null, null, null];
var TraceElement = null;
var PerformanceMarks = null;
var CachedTextures = null;

export var PerfMark = function (name) {
	if (PerformanceMarks == null) {
		PerformanceMarks = new Stack();
	}

	PerformanceMarks.push({
		t: new Date(),
		id: name
	});
};

export var PerfUnmark = function () {
	if (PerformanceMarks == null) {
		PerformanceMarks = new Stack();
	}

	if (PerformanceMarks.isEmpty()) {
		return;
	}

	var d = new Date();
	var mark = PerformanceMarks.pop();
	var t = (d - mark.t);

	console.log("@@ " + mark.id + ": " + t);
};

export function EnsureTextureCache() {
	if (CachedTextures == null) {
		CachedTextures = new Dictionary();
	}
}

export function TextureCacheAdd(path, data) {
	EnsureTextureCache();
	CachedTextures.set(path, data);
}

export function TextureCacheRemove(path) {
	EnsureTextureCache();
	CachedTextures.remove(path);
}

export function TextureCacheGet(path) {
	EnsureTextureCache();
	return CachedTextures.get(path);
}

export function TextureCacheClear() {
	EnsureTextureCache();
	CachedTextures.clear();
}

// TODO: refactor all this ugly debug/trace

export function DebugWrite(msg, level) {
	if (console) {
		console.log("DebugWrite");
		console.log(msg);
		return;

		var arr = [];
		arr.push(msg);

		for (var i = 2; i < arguments.length; ++i) {
			arr.push(arguments[i]);
		}

		var fmsg = String.formatWithObjects(msg, arr);


		// TODO : need to add better console support to the
		// 		  native host, for now, only log is supported
		if (IsNativeHost()) {
			console.log(fmsg);
		} else {
			switch (level) {
			case DebugLevel.Info:
				console.info(fmsg);
				break;
			case DebugLevel.Warning:
				console.warn(fmsg);
				break;
			case DebugLevel.Error:
				console.error(fmsg);
				break;
			default:
				console.log(fmsg);
				break;
			}
		}
	}
}

export function DebugClear() {
	if (console) {
		console.clear();
	}
}

export function TraceWrite(msg) {
	if (TraceElement == null) {
		TraceElement = document.createElement("div");
		TraceElement.style.border = "solid 2px #CCCCCC";
		TraceElement.style.padding = "5px";
		TraceElement.style.backgroundColor = "#FBFBEF";
		TraceElement.style.overflow = "auto";
		TraceElement.style.height = "200px";
		TraceElement.style.fontFamily = "Arial";
		TraceElement.style.fontSize = "12px";

		document.body.appendChild(TraceElement);
	}

	var span = document.createElement("span");
	span.innerHTML = String.formatWithObjects(msg, arguments);

	//TraceElement.appendChild(document.createTextNode(String.formatWithObjects(msg, arguments)));
	TraceElement.appendChild(span);
	TraceElement.scrollTop = TraceElement.scrollHeight;
}

export function TraceWriteLine(msg) {
	TraceWrite(String.formatWithObjects(msg, arguments));
	TraceElement.appendChild(document.createElement("br"));
}

export function TraceClear() {
	if (TraceElement != null) {
		document.body.removeChild(TraceElement);
		TraceElement = null;
	}
}

export function LogEvents(domElement /** ... **/) {
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

			console.log("%c[EVENT] - %s (%s)", "color:blue;font-weight:bold", e.type, str);
		},
		extraData: extraData
	};

	for (var i = 1; i < len; ++i) {
		arg = arguments[i];
		domElement.addEventListener(arg, obj.callback.bind(obj), false);
	}
}

export function IsNativeHost() {
	return (window.isNativeHost != null);
}

export function IsWindows() {
	return (System.getPlatformName() == "Windows");
}

export function IsMac() {
	return (System.getPlatformName() == "Macintosh");
}

export function IsLinux() {
	return (System.getPlatformName() == "Linux");
}

export function IsChrome() {
	return (System.getSystemModel() == "Chrome");
}

export function IsFirefox() {
	return (System.getSystemModel() == "Firefox");
}

export function IsIE() {
	return (System.getSystemModel() == "Internet Explorer");
}

export function IsSafari() {
	return (System.getSystemModel() == "Safari");
}

export function GetPlatformType() {
	if (IsNativeHost()) {
		return window.nativePlatformName;
	}

	// check for mobile browser
	var ua = (navigator.userAgent || navigator.vendor || window.opera);

	if (/android.+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(ua) ||
		/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|e\-|e\/|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|xda(\-|2|g)|yas\-|your|zeto|zte\-/i.test(ua.substr(0, 4))) {
		return "mobile-web";
	}

	return "web";
}

export function GetTimer() {
	return Application.getInstance().getRunningTime();
}

export function CreateHttpRequestObject() {
	if (window.XMLHttpRequest) {
		return new XMLHttpRequest();
	} else {
		return new ActiveXObject("Microsoft.XMLHTTP");
	}
}

export function RequestAnimationFrame(callback, element) {

	// TODO : need to fix for native platform
	//return window.requestAnimationFrame(callback);

	var nativeFunc =
		window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||

		function (callback) {
			return window.setTimeout(function () {
				callback(Date.now());
			}, 0);
		};

	return nativeFunc(callback);
}

export function Gamepads() {
	return (navigator.getGamepads ? navigator.getGamepads() : (navigator.gamepads || navigator.webkitGamepads ||
	navigator.mozGamepads || NullGamepads));
}

export function ValueOrDefault(value, defaultValue) {
	return ((value == null) ? defaultValue : value);
}

export function StringContains(str, value) {
	return (str.indexOf(value) != -1);
}

export function AreEqual(a, b) {
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

				if (AreNotEqual(arrItemA, arrItemB)) {
					return false;
				}
			}

			return true;
		}
	}

	return (a == b);
}

export function AreNotEqual(a, b) {
	return !AreEqual(a, b);
}

export function EnableLocalReadPermission() {
	try {
		if (netscape.security.PrivilegeManager.enablePrivilege) {
			netscape.security.PrivilegeManager.enablePrivilege("UniversalFileRead");
		}
	}
	catch (e) {
		DebugWrite("Unable to give local read access.", DebugLevel.Error);
	}
}

export function Mixin(Parent, mixin) {
	class Mixed extends Parent {}
	Object.assign(Mixed.prototype, mixin);
	return Mixed;
}

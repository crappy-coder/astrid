import Application from "./Application"
import Debug from "./Debug"

const VERSION = "1.1";
const MAX_DEFAULT_TEXTURE_SIZE = 16384;
const EMPTY_GAMEPADS = [null, null, null, null];

const SystemInfo = {
	"Name": 1,
	"Model": 2,
	"Version": 3,
	"Architecture": 4,
	"PlatformName": 5,
	"PlatformVersion": 6,
	"DeviceID": 7,
	"MaxTextureSize": 8,
	"NonPowerOfTwoTextureStatus": 9,
	"AvailableCPUCount": 10,
	"MaxTouchPoints": 11
};

const System = {
	get isWindows() {
		return System.getPlatformName() === "Windows";
	},

	get isMac() {
		return System.getPlatformName() === "Macintosh";
	},

	get isLinux() {
		return System.getPlatformName() === "Linux";
	},

	get isChrome() {
		return System.getPlatformName() === "Chrome";
	},

	get isFirefox() {
		return System.getPlatformName() === "Firefox";
	},

	get isInternetExplorer() {
		return System.getPlatformName() === "Internet Explorer";
	},

	get isSafari() {
		return System.getPlatformName() === "Safari";
	},

	get hasWebGL() {
		// TODO: use the experimental webgl context also?
		if (document) {
			var canvas = document.createElement("canvas");
			var gl = canvas.getContext("webgl");

			return !!gl;
		}
	},

	get hasGamepads() {
		return (window.navigator && (window.navigator.getGamepads || window.navigator.gamepads || window.navigator.webkitGamepads || window.navigator.mozGamepads));
	},

	get platformType() {
		// check for mobile browser
		var ua = (window.navigator && (window.navigator.userAgent || window.navigator.vendor || window.opera));

		if (/android.+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(ua) ||
			/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|e\-|e\/|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|xda(\-|2|g)|yas\-|your|zeto|zte\-/i.test(ua.substr(0, 4))) {
			return "mobile-web";
		}

		return "web";
	},

	get gamepads() {
		return ((window.navigator && window.navigator.getGamepads) ? window.navigator.getGamepads() : (window.navigator && (window.navigator.gamepads || window.navigator.webkitGamepads || window.navigator.mozGamepads)) || EMPTY_GAMEPADS);
	},

	getInfo: function getInfo(infoId) {
		switch (infoId) {
			case SystemInfo.Name:
				return System.getSystemName();
			case SystemInfo.Model:
				return System.getSystemModel();
			case SystemInfo.Version:
				return VERSION;
			case SystemInfo.Architecture:
				return System.getSystemArchitecture();
			case SystemInfo.PlatformName:
				return System.getPlatformName();
			case SystemInfo.PlatformVersion:
				return System.getPlatformVersion();
			case SystemInfo.DeviceID:
				return System.getDeviceID();
			case SystemInfo.MaxTextureSize:
				return System.getMaxTextureSize();
			case SystemInfo.NonPowerOfTwoTextureStatus:
				return System.getIsNonPowerOfTwoTexturesAllowed();
			case SystemInfo.AvailableCPUCount:
				return System.getAvailableCPUCount();
			case SystemInfo.MaxTouchPoints:
				return System.getMaxTouchPoints();
		}

		return null;
	},

	getSystemName: function getSystemName() {
		return (window.navigator && window.navigator.appName) || "";
	},

	getSystemModel: function getSystemModel() {
		var ua = (window.navigator && (window.navigator.userAgent || window.navigator.vendor)) || "";

		if (ua.contains("Chrome/")) {
			return "Chrome";
		}

		if (ua.contains("Firefox/")) {
			return "Firefox";
		}

		if (ua.contains("MSIE")) {
			return "Internet Explorer";
		}

		if (ua.contains("Safari/")) {
			return "Safari";
		}

		return (window.navigator && window.navigator.product) || "";
	},

	getSystemArchitecture: function getSystemArchitecture() {
		return (window.navigator && window.navigator.cpuClass) || "";
	},

	getPlatformName: function getPlatformName() {
		var platform = (window.navigator && window.navigator.platform) || "";
		var ua = (window.navigator && (window.navigator.userAgent || window.navigator.vendor)) || "";

		if (platform.contains("Win32") || platform.contains("Win64") || platform.contains("Windows NT")) {
			return "Windows";
		}

		if (ua.contains("Linux")) {
			return "Linux";
		}

		if (ua.contains("Macintosh")) {
			return "Macintosh";
		}

		return platform;
	},

	getPlatformVersion: function getPlatformVersion() {
		return (window.navigator && window.navigator.platformVersion) || "";
	},

	getDeviceID: function getDeviceID() {
		return (window.navigator && window.navigator.buildID) || "";
	},

	getMaxTextureSize: function getMaxTextureSize() {
		if (document) {
			var canvas = document.createElement("canvas");
			var gl = canvas.getContext("webgl");

			if(gl)
				return gl.getParameter(gl.MAX_TEXTURE_SIZE);
		}

		return MAX_DEFAULT_TEXTURE_SIZE;
	},

	getIsNonPowerOfTwoTexturesAllowed: function getIsNonPowerOfTwoTexturesAllowed() {
		return (window.navigator && window.navigator.moNPOTTextures) || true;
	},

	getAvailableCPUCount: function getAvailableCPUCount() {
		return (window.navigator && window.navigator.hardwareConcurrency) || 1;
	},

	getMaxTouchPoints: function getMaxTouchPoints() {
		return (window.navigator && window.navigator.maxTouchPoints) || 0;
	},

	getTimer: function getTimer() {
		return Application.getInstance().getRunningTime();
	},

	createHTTPRequest: function createHTTPRequest() {
		if (window.XMLHttpRequest) {
			return new XMLHttpRequest();
		} else {
			return new ActiveXObject("Microsoft.XMLHTTP");
		}
	},

	requestAnimationFrame: function requestAnimationFrame(callback) {
		var nativeFunc =
			window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||

			function (callback) {
				return window.setTimeout(function () {
					callback(performance.now());
				}, 0);
			};

		return nativeFunc(callback);
	},

	enableLocalReadPermission: function enableLocalReadPermission() {
		try {
			if (netscape.security.PrivilegeManager.enablePrivilege) {
				netscape.security.PrivilegeManager.enablePrivilege("UniversalFileRead");
			}
		}
		catch (e) {
			Debug.error("Unable to give local read access.");
		}
	}
};

export { System as default, SystemInfo };

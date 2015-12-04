import { StringContains } from "./Engine";

const VERSION = "1.1";
const MAX_DEFAULT_TEXTURE_SIZE = 16384;

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

		if (StringContains(ua, "Chrome/")) {
			return "Chrome";
		}

		if (StringContains(ua, "Firefox/")) {
			return "Firefox";
		}

		if (StringContains(ua, "MSIE")) {
			return "Internet Explorer";
		}

		if (StringContains(ua, "Safari/")) {
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

		if (StringContains(platform, "Win32") || StringContains(platform, "Win64") || StringContains(ua, "Windows NT")) {
			return "Windows";
		}

		if (StringContains(ua, "Linux")) {
			return "Linux";
		}

		if (StringContains(ua, "Macintosh")) {
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

	isWebGLAvailable: function isWebGLAvailable() {
		if (document) {
			var canvas = document.createElement("canvas");
			var gl = canvas.getContext("webgl");

			return !!gl;
		}
	}
};

export { System as default, SystemInfo };

import { StringContains, Version } from "./Engine";

var SystemInfo = {
	"Name": 1,
	"Model": 2,
	"Environment": 3,
	"Version": 4,
	"Architecture": 5,
	"PlatformName": 6,
	"PlatformVersion": 7,
	"DeviceID": 8,
	"DeviceIP": 9,
	"MaxTextureSize": 10,
	"NPOTTextures": 11
};

var System = {
	getInfo: function (infoId) {

		switch (infoId) {
			case SystemInfo.Name:
				return System.getSystemName();
			case SystemInfo.Model:
				return System.getSystemModel();
			case SystemInfo.Environment:
				return System.getSystemEnvironment();
			case SystemInfo.Version:
				return System.getMochicaVersion();
			case SystemInfo.Architecture:
				return System.getSystemArchitecture();
			case SystemInfo.PlatformName:
				return System.getPlatformName();
			case SystemInfo.PlatformVersion:
				return System.getPlatformVersion();
			case SystemInfo.DeviceID:
				return System.getDeviceID();
			case SystemInfo.DeviceIP:
				return System.getDeviceIP();
			case SystemInfo.MaxTextureSize:
				return System.getMaxTextureSize();
			case SystemInfo.NPOTTextures:
				return System.getAllowsNPOTTextures();
		}

		return null;
	},

	getSystemName: function () {
		return window.navigator.appName || "";
	},

	getSystemModel: function () {
		var ua = window.navigator.userAgent || window.navigator.vendor || "";

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

		return window.navigator.product || "";
	},

	getSystemEnvironment: function () {
		return window.navigator.moEnvironment || "web";
	},

	getSystemArchitecture: function () {
		return window.navigator.cpuClass || "";
	},

	getPlatformName: function () {
		var platform = window.navigator.platform || "";
		var ua = window.navigator.userAgent || window.navigator.vendor || "";

		if (StringContains(platform, "Win32") ||
				StringContains(platform, "Win64") ||
				StringContains(ua, "Windows NT")) {
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

	getPlatformVersion: function () {
		return window.navigator.platformVersion || "";
	},

	getMochicaVersion: function () {
		return Version;
	},

	getDeviceID: function () {
		return window.navigator.buildID || "";
	},

	getDeviceIP: function () {
		return window.navigator.moDeviceIP || "127.0.0.1";
	},

	getMaxTextureSize: function () {
		return window.navigator.moMaxTextureSize || 16384;
	},

	getAllowsNPOTTextures: function () {
		return window.navigator.moNPOTTextures || true;
	}
};

export default System;

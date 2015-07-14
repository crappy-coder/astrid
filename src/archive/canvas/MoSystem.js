MoSystemInfo = {
	"Name" 				: 1,
	"Model" 			: 2,
	"Environment"		: 3,
	"Version"			: 4,
	"Architecture"		: 5,
	"PlatformName"		: 6,
	"PlatformVersion"	: 7,
	"DeviceID"			: 8,
	"DeviceIP"			: 9,
	"MaxTextureSize"	: 10,
	"NPOTTextures"		: 11
};

MoSystem = {
	getInfo : function(infoId) {
	
		switch(infoId)
		{
			case MoSystemInfo.Name:
				return MoSystem.getSystemName();
			case MoSystemInfo.Model:
				return MoSystem.getSystemModel();
			case MoSystemInfo.Environment:
				return MoSystem.getSystemEnvironment();
			case MoSystemInfo.Version:
				return MoSystem.getMochicaVersion();
			case MoSystemInfo.Architecture:
				return MoSystem.getSystemArchitecture();
			case MoSystemInfo.PlatformName:
				return MoSystem.getPlatformName();
			case MoSystemInfo.PlatformVersion:
				return MoSystem.getPlatformVersion();
			case MoSystemInfo.DeviceID:
				return MoSystem.getDeviceID();
			case MoSystemInfo.DeviceIP:
				return MoSystem.getDeviceIP();
			case MoSystemInfo.MaxTextureSize:
				return MoSystem.getMaxTextureSize();
			case MoSystemInfo.NPOTTextures:
				return MoSystem.getAllowsNPOTTextures();
		}

		return null;
	},
	
	getSystemName : function() {
		return window.navigator.appName || "";
	},
	
	getSystemModel : function() {	
		var ua = window.navigator.userAgent || window.navigator.vendor || "";
		
		if(MoStringContains(ua, "Chrome/"))
			return "Chrome";
		
		if(MoStringContains(ua, "Firefox/"))
			return "Firefox";
			
		if(MoStringContains(ua, "MSIE"))
			return "Internet Explorer";
			
		if(MoStringContains(ua, "Safari/"))
			return "Safari";
		
		return window.navigator.product || "";
	},
	
	getSystemEnvironment : function() {
		return window.navigator.moEnvironment || "web";
	},
	
	getSystemArchitecture : function() {
		return window.navigator.cpuClass || "";
	},

	getPlatformName : function() {
		var platform = window.navigator.platform || "";
		var ua = window.navigator.userAgent || window.navigator.vendor || "";
		
		if( MoStringContains(platform, "Win32") || 
			MoStringContains(platform, "Win64") || 
			MoStringContains(ua, "Windows NT"))
			return "Windows";
		
		if( MoStringContains(ua, "Linux"))
			return "Linux";
		
		if( MoStringContains(ua, "Macintosh"))
			return "Macintosh";

		return platform;
	},
	
	getPlatformVersion : function() {
		return window.navigator.platformVersion || "";
	},
	
	getMochicaVersion : function() {
		return MoVersion;
	},
	
	getDeviceID : function() {
		return window.navigator.buildID || "";
	},
	
	getDeviceIP : function() {
		return window.navigator.moDeviceIP || "127.0.0.1";
	},
	
	getMaxTextureSize : function() {
		return window.navigator.moMaxTextureSize || 16384;
	},

	getAllowsNPOTTextures : function() {
		return window.navigator.moNPOTTextures || true;
	}
};
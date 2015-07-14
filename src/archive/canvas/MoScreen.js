MoScreen = Class.create({
	initialize : function(screen) {
		this.pixelScale = (MoIsNull(window.devicePixelRatio) ? 1 : window.devicePixelRatio);
		this.colorDepth = screen.colorDepth;
		this.bounds = new MoRectangle(screen.left, screen.top, screen.width, screen.height);
		this.visibleBounds = new MoRectangle(screen.availLeft, screen.availTop, screen.availWidth, screen.availHeight);
	},
	
	getColorDepth : function() {
		return this.colorDepth;
	},
	
	getPixelScale : function() {
		return this.pixelScale;
	},
	
	getBounds : function() {
		return this.bounds;
	},
	
	getVisibleBounds : function() {
		return this.visibleBounds;
	}
});

Object.extend(MoScreen, {
	Instance : null,
	
	getCurrent : function() {
		if(MoScreen.Instance == null)
			MoScreen.Instance = new MoScreen(window.screen);
		
		return MoScreen.Instance;
	}
});
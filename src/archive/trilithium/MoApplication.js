MoApplication = Class.create(MoEventDispatcher, {	
	initialize : function($super) {
		$super();

		MoApplication.Instance = this;
		
		this.startTime = new Date();
		this.backgroundColor = MoColor.black();
		this.isPaused = true;
		this.isAutoPaused = false;
		this.isFullSizeDisplaySurface = false;
		this.initialSurfaceWidth = null;
		this.initialSurfaceHeight = null;
		this.hasManagedDisplaySurface = false;
		this.hasPendingRender = false;
		this.hasLoaded = false;
		this.enableDebugVisuals = false;
		this.enableNativeGestures = true;
		this.enableDeviceOrientationEvents = false;
		this.enableDeviceMotionEvents = false;
		this.enableGamepadEvents = false;
		this.enableStatsGraph = false;
		this.enableAutoSuspendResume = true;
		this.fpsClock = new MoFPSClock();
		this.lastTickTime = 0;
		this.frameRate = 10;
		this.frameEvent = new MoFrameEvent(MoFrameEvent.ENTER, 0);
		//this.frameTimer = new MoTimer(1000 / this.frameRate);
		//this.frameTimer.addEventHandler(MoTimerEvent.TICK, this.handleFrameTimerTick.asDelegate(this));
		this.mainSurfaceCanvas = null;
		this.newSurfaceCanvas = null;
		this.surfaces = [];
		this.cameras = [];
		this.animationFrameRequests = [];

		MoLayoutManager.getInstance().addEventHandler(MoEvent.LAYOUT_UPDATED, this.handleLayoutManagerUpdated.asDelegate(this));
	},
	
	getFrameRate : function() {
		return this.frameRate;
	},
	
	setFrameRate : function(value) {
		if(this.frameRate != value)
		{
			this.frameRate = value;
			//this.frameTimer.setInterval(1000 / this.frameRate);
		}
	},

	getCameraCount : function() {
		return this.cameras.length;
	},
	
	getCameraAt : function(index) {
		if(index < this.cameras.length)
			return this.cameras[index];
		
		return null;
	},
	
	addCamera : function(camera) {
		if(camera != null && !this.cameras.contains(camera))
			this.cameras.push(camera);
	},
	
	removeCamera : function(camera) {
		this.cameras.remove(camera);
	},
	
	clearCameras : function() {
		this.cameras = [];
	},
	
	getDisplaySurfaceCount : function() {
		return this.surfaces.length;
	},

	getDisplaySurfaceAt : function(index) {
		if(index < this.surfaces.length)
			return this.surfaces[index];
		
		return null;
	},
	
	addDisplaySurface : function(surface) {
		if(surface != null && !this.surfaces.contains(surface))
			this.surfaces.push(surface);
	},
	
	removeDisplaySurface : function(surface) {
		this.surfaces.remove(surface);
	},
	
	clearDisplaySurfaces : function() {
		this.surfaces = [];
	},
	
	createManagedDisplaySurface : function(screen) {		
		if(!this.hasLoaded)
			throw new Error("Unable to create a managed display surface until the window has fully loaded.");

		// determine the initial size, if the initialSurface sizes are null then we must
		// need a full size display surface
		var width = this.initialSurfaceWidth || screen.naturalWidth;
		var height = this.initialSurfaceHeight || screen.naturalHeight;
		
		// create the html canvas element and add it to the document body
		this.mainSurfaceCanvas = screen;
		this.mainSurfaceCanvas.width = width;
		this.mainSurfaceCanvas.height = height;
		
		// add the display surface
		this.addDisplaySurface(MoDisplaySurface.fromCanvas(this.mainSurfaceCanvas));
		
		// finally make sure the body doesn't show any scrollbars and setup
		// a resize handler, this will recreate our surfaces so things render
		// nicely
		if(this.isFullSizeDisplaySurface)
			engine.onResize = this.handleResize.d(this);
	},
	
	invalidate : function() {
		if(this.hasPendingRender)
			return;
		
		this.hasPendingRender = true;
		this.dispatchEvent(new MoEvent(MoEvent.RENDER));
	},
	
	invalidateSurfacePositions : function() {
		var len = this.getDisplaySurfaceCount();

		for(var i = 0; i < len; ++i)
			this.getDisplaySurfaceAt(i).invalidatePositionOnScreen();
	},
	
	loadPlugins : function() {
		/** override **/
	},
	
	getKeyFromRemoteControlKey : function(keyId) {
		switch(keyId)
		{
			case engine.keymap.controllerPS3.CLEAR:
				return MoKey.Clear;
			case engine.keymap.controllerPS3.MEDIA_NEXT:
				return MoKey.MediaNextTrack;
			case engine.keymap.controllerPS3.MEDIA_PAUSE:
			case engine.keymap.controllerPS3.MEDIA_PLAY:
				return MoKey.MediaPlayPause;
			case engine.keymap.controllerPS3.MEDIA_PREV:
				return MoKey.MediaPreviousTrack;
			case engine.keymap.controllerPS3.MEDIA_SCAN_FWD:
			case engine.keymap.controllerPS3.MEDIA_SLOW_FWD:
				return MoKey.Next;
			case engine.keymap.controllerPS3.MEDIA_SCAN_REV:
			case engine.keymap.controllerPS3.MEDIA_SLOW_REV:
				return MoKey.Back;
			case engine.keymap.controllerPS3.MEDIA_STOP:
				return MoKey.MediaStop;
			case engine.keymap.controllerPS3.POPUP_MENU:
				return MoKey.F1;
			case engine.keymap.controllerPS3.RETURN:
				return MoKey.Enter;
			case engine.keymap.controllerPS3.SUBTITLE:
				return MoKey.F2;
			case engine.keymap.controllerPS3.TIME:
				return MoKey.F3;
			case engine.keymap.controllerPS3.TOP_MENU:
				return MoKey.Home;
			case "[US0)]":
				return MoKey.D0;
			case "[US1!]":
				return MoKey.D1;
			case "[US2@]":
				return MoKey.D2;
			case "[US3#]":
				return MoKey.D3;
			case "[US4$]":
				return MoKey.D4;
			case "[US5%]":
				return MoKey.D5;
			case "[US6^]":
				return MoKey.D6;
			case "[US7&]":
				return MoKey.D7;
			case "[US8*]":
				return MoKey.D8;
			case "[US9(]":
				return MoKey.D9;
		}
	},
	
	handleRemoteControlKey : function(key) {
		this.dispatchEvent(new MoKeyEvent(MoKeyEvent.KEY_PRESS, this.getKeyFromRemoteControlKey(key.name), false, false, null, null, true, false));
	},

	handleResize : function() {
		if(!this.hasLoaded || !this.isFullSizeDisplaySurface)
			return;

		// we have to recreate a new native canvas surface, otherwise
		// things would just stretch out and get out of wack if we
		// just resized it
		var surface = this.getDisplaySurfaceAt(0);
		var width = surface.naturalWidth;
		var height = surface.naturalHeight;

		surface.width = width;
		surface.height = height;
	},

	handleLoad : function(screen) {		
		screen.backgroundColor = [0,0,0,0];
		screen.resizeMode = "fit";
		
		this.loadPlugins();		
		
		try
		{
			this.hasLoaded = true;
			
			// this application is managing it's own display surface
			if(this.hasManagedDisplaySurface)
				this.createManagedDisplaySurface(screen);
		}
		catch(e) { }

		engine.onEnterFrame = (function() {
			this.run();
		}).d(this);
	},

	handleUnload : function() {
		this.hasLoaded = false;
		this.dispatchEvent(new MoEvent(MoEvent.APPLICATION_EXIT));
	},

	handleBlur : function(event) {
		if(this.getEnableAutoSuspendResume())
		{
			this.isAutoPaused = true;
			this.pause();
		}
	},
	
	handleFocus : function(event) {
		// don't resume if the user has paused the application
		if(this.isPaused && !this.isAutoPaused)
			return;
		
		if(this.getEnableAutoSuspendResume())
		{
			this.isAutoPaused = false;
			this.resume();
		}
	},

	handleSystemOrientationChangeEvent : function(event) {
		this.dispatchEvent(new MoEvent(MoEvent.UI_ORIENTATION_CHANGE));
	},
	
	handleSystemDeviceMotionEvent : function(event) {
		this.dispatchEvent(new MoDeviceMotionEvent(MoDeviceMotionEvent.CHANGE, event.acceleration, event.interval));
	},
	
	handleSystemDeviceOrientationEvent : function(event) {
		this.dispatchEvent(new MoDeviceOrientationEvent(MoDeviceOrientationEvent.CHANGE, event.alpha, event.beta, event.gamma));
	},

	handleFrameTimerTick : function() {
	
		this.fpsClock.update();

		if(this.getIsPaused())
			return;
			
		var requests = this.animationFrameRequests.concat();
		var d = Date.now();

		this.animationFrameRequests.length = 0;
		
		for(var i = 0, len = requests.length; i < len; ++i)
			requests[i](d);
		
		var needsRender = this.hasPendingRender;
		var len = 0;
		var surface = null;
		var delta = (MoGetTimer() - this.lastTickTime);
		
		// clear pending flag
		this.hasPendingRender = false;
		this.lastTickTime = MoGetTimer();
		
		// dispatch the enter event
		this.frameEvent.reuse();
		this.frameEvent.deltaTime = delta;
		this.dispatchEvent(this.frameEvent);

		// notify listeners that rendering has completed
		if(needsRender)
			this.dispatchEvent(new MoEvent(MoEvent.RENDER_COMPLETE));
	},

	handleLayoutManagerUpdated : function(event) {
		this.hasPendingRender = true;
	},
	
	getEnableAutoSuspendResume : function() {
		return this.enableAutoSuspendResume;
	},
	
	setEnableAutoSuspendResume : function(value) {
		this.enableAutoSuspendResume = value;
	},
	
	getEnableStatsGraph : function() {
		return this.enableStatsGraph;
	},
	
	setEnableStatsGraph : function(value) {
		this.enableStatsGraph = value;
		
		for(var i = 0, len = this.getDisplaySurfaceCount(); i < len; ++i)
			this.getDisplaySurfaceAt(i).invalidate();
	},
	
	getEnableGamepadEvents : function() {
		return this.enableGamepadEvents;
	},
	
	setEnableGamepadEvents : function(value) {
		this.enableGamepadEvents = value;

		MoGamepad.setEnableEvents(this.enableGamepadEvents);
	},
	
	getEnableDeviceOrientationEvents : function() {
		return this.enableDeviceOrientationEvents;
	},
	
	setEnableDeviceOrientationEvents : function(value) {
		if(this.enableDeviceOrientationEvents == value)
			return;
		
		this.enableDeviceOrientationEvents = value;
		
		if(this.enableDeviceOrientationEvents)
			window.addEventListener("deviceorientation", this.handleSystemDeviceOrientationEvent.asDelegate(this));
		else
			window.removeEventListener("deviceorientation", this.handleSystemDeviceOrientationEvent.asDelegate(this));
	},
	
	getEnableDeviceMotionEvents : function() {
		return this.enableDeviceMotionEvents;
	},
	
	setEnableDeviceMotionEvents : function(value) {
		if(this.enableDeviceMotionEvents == value)
			return;
		
		this.enableDeviceMotionEvents = value;
		
		if(this.enableDeviceMotionEvents)
			window.addEventListener("devicemotion", this.handleSystemDeviceMotionEvent.asDelegate(this));
		else
			window.removeEventListener("devicemotion", this.handleSystemDeviceMotionEvent.asDelegate(this));
	},
	
	// if true then the native gestures are enabled, like
	// zooming, scrolling, etc... in the web view, the
	// default is true.
	getEnableNativeGestures : function() {
		return this.enableNativeGestures;
	},
	
	setEnableNativeGestures : function(value) {
		this.enableNativeGestures = value;
	},
	
	getOrientation : function() {
		switch(window.orientation)
		{
			case -90:
				return MoScreenOrientation.LandscapeRight;
			case 90:
				return MoScreenOrientation.LandscapeLeft;
			case 180:
				return MoScreenOrientation.PortraitUpsideDown;
		}
		
		return MoScreenOrientation.Portrait;
	},
	
	getEnableDebugVisuals : function() {
		return this.enableDebugVisuals;
	},
	
	setEnableDebugVisuals : function(value) {
		this.enableDebugVisuals = value;
	},

	getRunningTime : function() {
		return ((new Date()) - this.startTime);
	},

	getIsPaused : function() {
		return this.isPaused;
	},

	getBackgroundColor : function() {
		if(MoIsNativeHost())
			return this.backgroundColor;
		
		return MoColor.fromCSSColor(document.body.style.backgroundColor);
	},

	setBackgroundColor : function(color) {
		if(MoIsNativeHost())
		{
			this.backgroundColor = color;
			return;
		}

		document.body.style.backgroundColor = color.toRGBAString();
	},

	// TODO : remove this document.viewport! (it's an extensions to the full prototype.js which we no longer use!)
	getSize : function() {
		return new MoSize(
			document.viewport.getDimensions().width,
			document.viewport.getDimensions().height);
	},

	pause : function() {
		this.isPaused = true;
		//this.frameTimer.stop();
		this.fpsClock.suspend();
	},

	resume : function() {
		this.isPaused = false;
		//this.frameTimer.start();
		this.fpsClock.resume();
	},
	
	run : function() {
		engine.onEnterFrame = this.handleFrameTimerTick.bind(this);
		
		this.resume();
		this.dispatchEvent(new MoEvent(MoEvent.APPLICATION_START));
	}
});

Object.extend(MoApplication, {
	Instance : null,
	
	getInstance : function() {
		return MoApplication.Instance;
	},
	
	create : function() {
		var type = MoApplication;

		// user passed in a subclass
		if(arguments.length == 1 || arguments.length == 3)
			type = arguments[0];

		var app = new type();

		if(!(app instanceof MoApplication))
			throw new Error("Application is not an instance of MoApplication, you must create a subclass of MoApplication to actually create an application.");

		app.hasManagedDisplaySurface = true;
		
		if(arguments.length <= 1)
		{
			app.isFullSizeDisplaySurface = true;
			app.initialSurfaceWidth = null;
			app.initialSurfaceHeight = null;
		}
		else if(arguments.length <= 3)
		{
			app.isFullSizeDisplaySurface = false;
			app.initialSurfaceWidth = arguments[arguments.length-2];
			app.initialSurfaceHeight = arguments[arguments.length-1];
		}

		engine.onLoad = app.handleLoad.d(app);

		return app;
	}
});
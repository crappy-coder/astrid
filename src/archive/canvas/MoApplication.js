MoApplication = Class.create(MoEventDispatcher, {	
	initialize : function($super) {
		$super();

		MoApplication.Instance = this;
		
		this.startTime = (window.getHighResTimer ? window.getHighResTimer() : new Date());
		this.isPaused = true;
		this.isAutoPaused = false;
		this.isFullSizeDisplaySurface = false;
		this.initialSurfaceWidth = null;
		this.initialSurfaceHeight = null;
		this.hasManagedDisplaySurface = false;
		this.hasPendingRender = false;
		this.hasLoaded = false;
		this.enableDirtyRegions = true;
		this.enableDebugVisuals = false;
		this.enableNativeGestures = true;
		this.enableDeviceOrientationEvents = false;
		this.enableDeviceMotionEvents = false;
		this.enableGamepadEvents = false;
		this.enableStatsGraph = false;
		this.enableAutoSuspendResume = true;
		this.fpsClock = new MoFPSClock();
		this.frameRate = 60;
		this.frameTimer = new MoTimer(1000 / this.frameRate);
		this.frameTimer.addEventHandler(MoTimerEvent.TICK, this.handleFrameTimerTick.asDelegate(this));
		this.mainSurfaceCanvas = null;
		this.newSurfaceCanvas = null;
		this.surfaces = [];
		this.cameras = [];
		
		MoLayoutManager.getInstance().addEventHandler(MoEvent.LAYOUT_UPDATED, this.handleLayoutManagerUpdated.asDelegate(this));
		
		window.addEventListener("blur", this.handleBlur.asDelegate(this));
		window.addEventListener("focus", this.handleFocus.asDelegate(this));
		window.addEventListener("orientationchange", this.handleSystemOrientationChangeEvent.asDelegate(this));
		window.addEventListener("load", this.handleLoad.asDelegate(this));
		window.addEventListener("unload", this.handleUnload.asDelegate(this));
		
		if(document && document.readyState == "complete")
			this.handleLoad(null);
	},
	
	getRunningTime : function() {
		if(window.getHighResTimer)
			return (window.getHighResTimer() - this.startTime);
		
		return ((new Date()) - this.startTime);
	},
	
	getFrameRate : function() {
		return this.frameRate;
	},
	
	setFrameRate : function(value) {
		if(this.frameRate != value)
		{
			this.frameRate = value;
			this.frameTimer.setInterval(1000 / this.frameRate);
		}
	},
	
	getEnableDirtyRegions : function() {
		return this.enableDirtyRegions;
	},
	
	setEnableDirtyRegions : function(value) {
		this.enableDirtyRegions = value;
	},
	
	getEnableDebugVisuals : function() {
		return this.enableDebugVisuals;
	},
	
	setEnableDebugVisuals : function(value) {
		this.enableDebugVisuals = value;
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

	getBackgroundColor : function() {
		return MoColor.fromCSSColor(document.body.style.backgroundColor);
	},

	setBackgroundColor : function(color) {
		document.body.style.backgroundColor = color.toRGBAString();
	},
	
	getIsPaused : function() {
		return this.isPaused;
	},

	getSize : function() {
		return new MoSize(window.innerWidth, window.innerHeight);
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
	
	createManagedDisplaySurface : function() {
		if(!this.hasLoaded)
			throw new Error("Unable to create a managed display surface until the window has fully loaded.");

		// determine the initial size, if the initialSurface sizes are null then we must
		// need a full size display surface
		var width = this.initialSurfaceWidth || window.innerWidth;
		var height = this.initialSurfaceHeight || window.innerHeight;
		
		// create the html canvas element and add it to the document body
		this.mainSurfaceCanvas = document.createElement("canvas");
		this.mainSurfaceCanvas.id = "managed-display-surface";
		this.mainSurfaceCanvas.width = width;
		this.mainSurfaceCanvas.height = height;

		document.body.appendChild(this.mainSurfaceCanvas);
		
		// add the display surface
		this.addDisplaySurface(MoDisplaySurface.fromCanvas(this.mainSurfaceCanvas));
		
		// finally make sure the body doesn't show any scrollbars and setup
		// a resize handler, this will recreate our surfaces so things render
		// nicely
		if(this.isFullSizeDisplaySurface)
		{
			//document.body.style.overflow = "hidden";
			window.addEventListener("resize", this.handleResize.asDelegate(this));
		}
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
	
	handleResize : function() {
		if(!this.hasLoaded || !this.isFullSizeDisplaySurface)
			return;
		
		// we have to recreate a new native canvas surface, otherwise
		// things would just stretch out and get out of wack if we
		// just resized it
		var surface = this.getDisplaySurfaceAt(0);
		var width = window.innerWidth;
		var height = window.innerHeight;
		
		this.newSurfaceCanvas = document.createElement("canvas");
		this.newSurfaceCanvas.id = this.mainSurfaceCanvas.id;
		this.newSurfaceCanvas.width = width;
		this.newSurfaceCanvas.height = height;

		surface.setNativeCanvas(this.newSurfaceCanvas);
	},

	handleLoad : function() {
		this.hasLoaded = true;
		
		// this application is managing it's own display surface
		if(this.hasManagedDisplaySurface)
			this.createManagedDisplaySurface();

		this.resume();
		this.dispatchEvent(new MoEvent(MoEvent.APPLICATION_START));
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

	handleFrameTimerTick : function(event) {
	
		this.fpsClock.update();

        //console.log(this.fpsClock.getAverageFPS());

		if(this.getIsPaused())
			return;
		
		var needsRender = this.hasPendingRender;
		var len = 0;
		var surface = null;
		var delta = event.getTickDelta();

		// clear pending flag
		this.hasPendingRender = false;
		
		// dispatch the enter event
		this.dispatchEvent(new MoFrameEvent(MoFrameEvent.ENTER, delta));
		
		// update cameras
		len = this.cameras.length;
		
		for(var i = 0; i < len; ++i)
			this.cameras[i].update(delta);
		
		// render each surface and update any active AI
		len = this.surfaces.length;
		
		for(var i = 0; i < len; ++i)
		{
			surface = this.surfaces[i];
			
			if(surface != null && surface.getIsRunning())
			{
				// update physics
				surface.updatePhysics(delta);
			
				// update AI
				surface.updateAI(delta);
				
				// update all other
				surface.updateOther(delta);

				// do the full surface render
				//    - if the stats graph is enabled then we also need to perform a full render
				//      this will handle clearing the background and redrawing so the fps graph
				//      can be overlayed on top
				if(needsRender || this.getEnableStatsGraph())
					surface.performRender();
			}
		}
		
		// notify listeners that rendering has completed
		if(needsRender)
		{
			// once we have rendered a new frame, then we can swap out
			// our native canvas surfaces, this way things look much more
			// seamless instead of flickering
			if(this.hasManagedDisplaySurface && this.isFullSizeDisplaySurface)
			{
				if(this.newSurfaceCanvas != null)
				{
					var surface = this.getDisplaySurfaceAt(0);
					
					document.body.removeChild(this.mainSurfaceCanvas);
					document.body.appendChild(this.newSurfaceCanvas);
					
					this.mainSurfaceCanvas = this.newSurfaceCanvas;
					this.newSurfaceCanvas = null;
				}
			}
		
			this.dispatchEvent(new MoEvent(MoEvent.RENDER_COMPLETE));
		}
	},

	handleLayoutManagerUpdated : function(event) {
		this.hasPendingRender = true;
	},

	pause : function() {
		this.isPaused = true;
		this.frameTimer.stop();
		this.fpsClock.suspend();
	},

	resume : function() {
		this.isPaused = false;
		this.frameTimer.start();
		this.fpsClock.resume();
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

		return app;
	}
});
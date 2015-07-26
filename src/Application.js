import EventDispatcher from "./EventDispatcher";
import LayoutManager from "./ui/LayoutManager";
import Timer from "./Timer";
import Event from "./Event";
import TimerEvent from "./TimerEvent";
import DeviceMotionEvent from "./DeviceMotionEvent";
import DeviceOrientationEvent from "./DeviceOrientationEvent";
import FrameEvent from "./FrameEvent";
import FPSClock from "./FPSGraph";
import Gamepad from "./input/Gamepad";
import ScreenOrientation from "./ui/ScreenOrientation";
import Color from "./graphics/Color";
import Size from "./Size";
import DisplaySurface from "./ui/DisplaySurface";

class Application extends EventDispatcher {
	constructor() {
		super();

		Application.Instance = this;

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
		this.fpsClock = new FPSClock();
		this.frameRate = 60;
		this.frameTimer = new Timer(1000 / this.frameRate);
		this.frameTimer.addEventHandler(TimerEvent.TICK, this.handleFrameTimerTick.asDelegate(this));
		this.mainSurfaceCanvas = null;
		this.newSurfaceCanvas = null;
		this.surfaces = [];
		this.cameras = [];

		LayoutManager.getInstance().addEventHandler(Event.LAYOUT_UPDATED, this.handleLayoutManagerUpdated.asDelegate(this));

		window.addEventListener("blur", this.handleBlur.asDelegate(this));
		window.addEventListener("focus", this.handleFocus.asDelegate(this));
		window.addEventListener("orientationchange", this.handleSystemOrientationChangeEvent.asDelegate(this));
		window.addEventListener("load", this.handleLoad.asDelegate(this));
		window.addEventListener("unload", this.handleUnload.asDelegate(this));

		if (document && document.readyState == "complete") {
			this.handleLoad(null);
		}
	}

	getRunningTime() {
		if (window.getHighResTimer)
			return (window.getHighResTimer() - this.startTime);

		return ((new Date()) - this.startTime);
	}

	getFrameRate() {
		return this.frameRate;
	}

	setFrameRate(value) {
		if (this.frameRate != value) {
			this.frameRate = value;
			this.frameTimer.setInterval(1000 / this.frameRate);
		}
	}

	getEnableDirtyRegions() {
		return this.enableDirtyRegions;
	}

	setEnableDirtyRegions(value) {
		this.enableDirtyRegions = value;
	}

	getEnableDebugVisuals() {
		return this.enableDebugVisuals;
	}

	setEnableDebugVisuals(value) {
		this.enableDebugVisuals = value;
	}

	getEnableAutoSuspendResume() {
		return this.enableAutoSuspendResume;
	}

	setEnableAutoSuspendResume(value) {
		this.enableAutoSuspendResume = value;
	}

	getEnableStatsGraph() {
		return this.enableStatsGraph;
	}

	setEnableStatsGraph(value) {
		this.enableStatsGraph = value;

		for (var i = 0, len = this.getDisplaySurfaceCount(); i < len; ++i) {
			this.getDisplaySurfaceAt(i).invalidate();
		}
	}

	getEnableGamepadEvents() {
		return this.enableGamepadEvents;
	}

	setEnableGamepadEvents(value) {
		this.enableGamepadEvents = value;

		Gamepad.setEnableEvents(this.enableGamepadEvents);
	}

	getEnableDeviceOrientationEvents() {
		return this.enableDeviceOrientationEvents;
	}

	setEnableDeviceOrientationEvents(value) {
		if (this.enableDeviceOrientationEvents === value) return;

		this.enableDeviceOrientationEvents = value;

		if (this.enableDeviceOrientationEvents) {
			window.addEventListener("deviceorientation", this.handleSystemDeviceOrientationEvent.asDelegate(this));
		}
		else {
			window.removeEventListener("deviceorientation", this.handleSystemDeviceOrientationEvent.asDelegate(this));
		}
	}

	getEnableDeviceMotionEvents() {
		return this.enableDeviceMotionEvents;
	}

	setEnableDeviceMotionEvents(value) {
		if (this.enableDeviceMotionEvents == value) return;

		this.enableDeviceMotionEvents = value;

		if (this.enableDeviceMotionEvents) {
			window.addEventListener("devicemotion", this.handleSystemDeviceMotionEvent.asDelegate(this));
		}
		else {
			window.removeEventListener("devicemotion", this.handleSystemDeviceMotionEvent.asDelegate(this));
		}
	}

	// if true then the native gestures are enabled, like
	// zooming, scrolling, etc... in the web view, the
	// default is true.
	getEnableNativeGestures() {
		return this.enableNativeGestures;
	}

	setEnableNativeGestures(value) {
		this.enableNativeGestures = value;
	}

	getOrientation() {
		switch (window.orientation)
		{
			case -90:
				return ScreenOrientation.LandscapeRight;
			case 90:
				return ScreenOrientation.LandscapeLeft;
			case 180:
				return ScreenOrientation.PortraitUpsideDown;
		}

		return ScreenOrientation.Portrait;
	}

	getBackgroundColor() {
		return Color.fromCSSColor(document.body.style.backgroundColor);
	}

	setBackgroundColor(color) {
		document.body.style.backgroundColor = color.toRGBAString();
	}

	getIsPaused() {
		return this.isPaused;
	}

	getSize() {
		return new Size(window.innerWidth, window.innerHeight);
	}

	getCameraCount() {
		return this.cameras.length;
	}

	getCameraAt(index) {
		if (index < this.cameras.length) {
			return this.cameras[index];
		}

		return null;
	}

	addCamera(camera) {
		if (camera != null && !this.cameras.contains(camera)) {
			this.cameras.push(camera);
		}
	}

	removeCamera(camera) {
		this.cameras.remove(camera);
	}

	clearCameras() {
		this.cameras = [];
	}

	getDisplaySurfaceCount() {
		return this.surfaces.length;
	}

	getDisplaySurfaceAt(index) {
		return this.surfaces[index];
	}

	addDisplaySurface(surface) {
		if (surface != null && !this.surfaces.contains(surface)) {
			this.surfaces.push(surface);
		}
	}

	removeDisplaySurface(surface) {
		this.surfaces.remove(surface);
	}

	clearDisplaySurfaces() {
		this.surfaces = [];
	}

	createManagedDisplaySurface() {
		if (!this.hasLoaded) throw new Error("Unable to create a managed display surface until the window has fully loaded.");

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
		this.addDisplaySurface(DisplaySurface.fromCanvas(this.mainSurfaceCanvas));

		// finally make sure the body doesn't show any scrollbars and setup
		// a resize handler, this will recreate our surfaces so things render
		// nicely
		if (this.isFullSizeDisplaySurface) {
			//document.body.style.overflow = "hidden";
			window.addEventListener("resize", this.handleResize.asDelegate(this));
		}
	}

	invalidate() {
		if (this.hasPendingRender) return;

		this.hasPendingRender = true;
		this.dispatchEvent(new Event(Event.RENDER));
	}

	invalidateSurfacePositions() {
		var len = this.getDisplaySurfaceCount();

		for (var i = 0; i < len; ++i) {
			this.getDisplaySurfaceAt(i).invalidatePositionOnScreen();
		}
	}

	handleResize() {
		if (!this.hasLoaded || !this.isFullSizeDisplaySurface) return;

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
	}

	handleLoad() {
		this.hasLoaded = true;

		// this application is managing it's own display surface
		if (this.hasManagedDisplaySurface) {
			this.createManagedDisplaySurface();
		}

		this.resume();
		this.dispatchEvent(new Event(Event.APPLICATION_START));
	}

	handleUnload() {
		this.hasLoaded = false;
		this.dispatchEvent(new Event(Event.APPLICATION_EXIT));
	}

	handleBlur(event) {
		if (this.getEnableAutoSuspendResume()) {
			this.isAutoPaused = true;
			this.pause();
		}
	}

	handleFocus(event) {
		// don't resume if the user has paused the application
		if (this.isPaused && !this.isAutoPaused) return;

		if (this.getEnableAutoSuspendResume()) {
			this.isAutoPaused = false;
			this.resume();
		}
	}

	handleSystemOrientationChangeEvent(event) {
		this.dispatchEvent(new Event(Event.UI_ORIENTATION_CHANGE));
	}

	handleSystemDeviceMotionEvent(event) {
		this.dispatchEvent(new DeviceMotionEvent(DeviceMotionEvent.CHANGE, event.acceleration, event.interval));
	}

	handleSystemDeviceOrientationEvent(event) {
		this.dispatchEvent(new DeviceOrientationEvent(DeviceOrientationEvent.CHANGE, event.alpha, event.beta, event.gamma));
	}

	handleFrameTimerTick(event) {

		this.fpsClock.update();

        //console.log(this.fpsClock.getAverageFPS());

		if (this.getIsPaused()) return;

		var needsRender = this.hasPendingRender;
		var i, len;
		var surface;
		var delta = event.getTickDelta();

		// clear pending flag
		this.hasPendingRender = false;

		// dispatch the enter event
		this.dispatchEvent(new FrameEvent(FrameEvent.ENTER, delta));

		// update cameras
		len = this.cameras.length;

		for (i = 0; i < len; ++i) {
			this.cameras[i].update(delta);
		}

		// render each surface and update any active AI
		len = this.surfaces.length;

		for (i = 0; i < len; ++i) {
			surface = this.surfaces[i];

			if (surface != null && surface.getIsRunning()) {
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
				if (needsRender || this.getEnableStatsGraph()) {
					surface.performRender();
				}
			}
		}

		// notify listeners that rendering has completed
		if (needsRender) {
			// once we have rendered a new frame, then we can swap out
			// our native canvas surfaces, this way things look much more
			// seamless instead of flickering
			if (this.hasManagedDisplaySurface && this.isFullSizeDisplaySurface) {
				if (this.newSurfaceCanvas != null) {
					surface = this.getDisplaySurfaceAt(0);

					document.body.removeChild(this.mainSurfaceCanvas);
					document.body.appendChild(this.newSurfaceCanvas);

					this.mainSurfaceCanvas = this.newSurfaceCanvas;
					this.newSurfaceCanvas = null;
				}
			}

			this.dispatchEvent(new Event(Event.RENDER_COMPLETE));
		}
	}

	handleLayoutManagerUpdated(event) {
		this.hasPendingRender = true;
	}

	pause() {
		this.isPaused = true;
		this.frameTimer.stop();
		this.fpsClock.suspend();
	}

	resume() {
		this.isPaused = false;
		this.frameTimer.start();
		this.fpsClock.resume();
	}

	static getInstance() {
		return Application.Instance;
	}

	static create() {
		var type = Application;

		// user passed in a subclass
		if (arguments.length == 1 || arguments.length == 3) {
			type = arguments[0];
		}

		var app = new type();

		if (!(app instanceof type)) {
			throw new Error("Your application does not inherit from the astrid Application class.");
		}

		app.hasManagedDisplaySurface = true;

		if (arguments.length <= 1) {
			app.isFullSizeDisplaySurface = true;
			app.initialSurfaceWidth = null;
			app.initialSurfaceHeight = null;
		}
		else if (arguments.length <= 3) {
			app.isFullSizeDisplaySurface = false;
			app.initialSurfaceWidth = arguments[arguments.length-2];
			app.initialSurfaceHeight = arguments[arguments.length-1];
		}

		return app;
	}
}

export default Application;

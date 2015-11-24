import EventDispatcher from "./EventDispatcher"
import LayoutManager from "./ui/LayoutManager"
import Timer from "./Timer"
import Event from "./Event"
import TimerEvent from "./TimerEvent"
import DeviceMotionEvent from "./DeviceMotionEvent"
import DeviceOrientationEvent from "./DeviceOrientationEvent"
import FrameEvent from "./FrameEvent"
import { FPSClock } from "./FPSGraph"
import Gamepad from "./input/Gamepad"
import GamepadButtonMap from "./input/GamepadButtonMap"
import GamepadAxesMap from "./input/GamepadAxesMap"
import ScreenOrientation from "./ui/ScreenOrientation"
import Color from "./graphics/Color"
import Size from "./Size"
import DebugFlags from "./DebugFlags"
import DisplaySurface from "./ui/DisplaySurface"

class Application extends EventDispatcher {
	constructor(width, height) {
		super();

		Application.Instance = this;

		this.debugFlags = DebugFlags.None;
		this.startTime = (window.getHighResTimer ? window.getHighResTimer() : performance.now());
		this.isPaused = true;
		this.isAutoPaused = false;
		this.autoScaleDisplaySurface = false;
		this.autoResizeDisplaySurface = (arguments.length === 0);
		this.hasManagedDisplaySurface = true;
		this.hasPendingRender = false;
		this.hasLoaded = false;
		this.gamepadButtonMap = GamepadButtonMap.XBOX360;
		this.gamepadAxesMap = GamepadAxesMap.XBOX360;
		this.enableDirtyRegions = true;
		this.enableDebugVisuals = false;
		this.enableMouseEvents = true;
		this.enableKeyboardEvents = true;
		this.enableTouchEvents = true;
		this.enableGestureEvents = true;
		this.enableGamepadEvents = false;
		this.enableDeviceOrientationEvents = false;
		this.enableDeviceMotionEvents = false;
		this.enableNativeGestures = true;
		this.enableStatsGraph = false;
		this.enableAutoSuspendResume = true;
		this.fpsClock = new FPSClock();
		this.frameRate = 60;
		this.frameTimer = new Timer(1000 / this.frameRate);
		this.frameTimer.addEventHandler(TimerEvent.TICK, this.handleFrameTimerTick.asDelegate(this));
		this.displaySurface = null;
		this.displaySurfaceSize = (arguments.length === 0 ? new Size(window.innerWidth, window.innerHeight) : new Size(width, height));
		this.mainSurfaceCanvas = null;
		this.newSurfaceCanvas = null;
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

	getAutoScaleDisplaySurface() {
		return this.autoScaleDisplaySurface;
	}

	setAutoScaleDisplaySurface(value) {
		this.autoScaleDisplaySurface = value;
	}

	getRunningTime() {
		if (window.getHighResTimer)
			return (window.getHighResTimer() - this.startTime);

		return (performance.now() - this.startTime);
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

	getGamepadButtonMap() {
		return this.gamepadButtonMap;
	}

	setGamepadButtonMap(value) {
		this.gamepadButtonMap = value;
	}

	getGamepadAxesMap() {
		return this.gamepadAxesMap;
	}

	setGamepadAxesMap(value) {
		this.gamepadAxesMap = value;
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

	getDebugFlags() {
		return this.debugFlags;
	}

	setDebugFlags(value) {
		this.debugFlags = value;
	}

	isDebugFlagEnabled(flag) {
		return ((this.debugFlags & flag) != DebugFlags.None);
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

		if(this.displaySurface)
			this.displaySurface.invalidate();
	}

	getEnableMouseEvents() {
		return this.enableMouseEvents;
	}

	setEnableMouseEvents(value) {
		if(this.enableMouseEvents === value)
			return;

		this.enableMouseEvents = value;

		if(this.displaySurface)
			this.displaySurface.refreshInputEventRegistration();
	}

	getEnableKeyboardEvents() {
		return this.enableKeyboardEvents;
	}

	setEnableKeyboardEvents(value) {
		if(this.enableKeyboardEvents === value)
			return;

		this.enableKeyboardEvents = value;

		if(this.displaySurface)
			this.displaySurface.refreshInputEventRegistration();
	}

	getEnableTouchEvents() {
		return this.enableTouchEvents;
	}

	setEnableTouchEvents(value) {
		if(this.enableTouchEvents === value)
			return;

		this.enableTouchEvents = value;

		if(this.displaySurface)
			this.displaySurface.refreshInputEventRegistration();
	}

	getEnableGestureEvents() {
		return this.enableGestureEvents;
	}

	setEnableGestureEvents(value) {
		if(this.enableGestureEvents === value)
			return;

		this.enableGestureEvents = value;

		if(this.displaySurface)
			this.displaySurface.refreshInputEventRegistration();
	}

	getEnableGamepadEvents() {
		return this.enableGamepadEvents;
	}

	setEnableGamepadEvents(value) {
		if(this.enableGamepadEvents === value)
			return;

		this.enableGamepadEvents = value;

		if(this.displaySurface)
			this.displaySurface.refreshInputEventRegistration();

		Gamepad.setEnableEvents(this.enableGamepadEvents);
	}

	getEnableDeviceOrientationEvents() {
		return this.enableDeviceOrientationEvents;
	}

	setEnableDeviceOrientationEvents(value) {
		if (this.enableDeviceOrientationEvents === value)
			return;

		this.enableDeviceOrientationEvents = value;

		if (this.enableDeviceOrientationEvents) {
			window.addEventListener("deviceorientation", this.handleSystemDeviceOrientationEvent.d(this));
		}
		else {
			window.removeEventListener("deviceorientation", this.handleSystemDeviceOrientationEvent.d(this));
		}
	}

	getEnableDeviceMotionEvents() {
		return this.enableDeviceMotionEvents;
	}

	setEnableDeviceMotionEvents(value) {
		if (this.enableDeviceMotionEvents == value)
			return;

		this.enableDeviceMotionEvents = value;

		if (this.enableDeviceMotionEvents) {
			window.addEventListener("devicemotion", this.handleSystemDeviceMotionEvent.d(this));
		}
		else {
			window.removeEventListener("devicemotion", this.handleSystemDeviceMotionEvent.d(this));
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
		return this.displaySurfaceSize;
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

	getDisplaySurface() {
		return this.displaySurface;
	}

	setDisplaySurface(value) {
		this.displaySurface = value;
		this.hasManagedDisplaySurface = false;

		// TODO: need to remove previous canvas if it is moving from a managed to a non-managed canvas
	}

	createManagedDisplaySurface() {
		if (!this.hasLoaded)
			throw new Error("Unable to create a managed display surface until the window has fully loaded.");

		// create the html canvas element and add it to the document body
		this.mainSurfaceCanvas = document.createElement("canvas");
		this.mainSurfaceCanvas.id = "managed-display-surface";
		this.mainSurfaceCanvas.width = this.displaySurfaceSize.width;
		this.mainSurfaceCanvas.height = this.displaySurfaceSize.height;

		document.body.appendChild(this.mainSurfaceCanvas);

		// add the display surface
		this.displaySurface = DisplaySurface.fromCanvas(this.mainSurfaceCanvas);

		// finally make sure the body doesn't show any scrollbars and setup
		// a resize handler, this will recreate our surface so things render nicely
		if(this.autoResizeDisplaySurface || this.autoScaleDisplaySurface)
			window.addEventListener("resize", this.handleResize.asDelegate(this));
	}

	invalidate() {
		if (this.hasPendingRender)
			return;

		this.hasPendingRender = true;
		this.dispatchEvent(new Event(Event.RENDER));
	}

	invalidateDisplaySurfacePosition() {
		this.getDisplaySurface().invalidatePositionOnScreen();
	}

	scaleDisplaySurface() {
		if(this.autoScaleDisplaySurface)
		{
			var sourceWidth = this.displaySurfaceSize.width;
			var sourceHeight = this.displaySurfaceSize.height;
			var newWidth = window.innerWidth;
			var newHeight = window.innerHeight;
			var scale = Math.min(newWidth / sourceWidth, newHeight / sourceHeight);

			newWidth = sourceWidth * scale;
			newHeight = sourceHeight * scale;

			this.mainSurfaceCanvas.style.width = newWidth + "px";
			this.mainSurfaceCanvas.style.height = newHeight + "px";
		}
	}

	handleResize() {
		// no need to handle the window resize event until dom has loaded
		if(!this.hasLoaded)
			return;

		// apply auto-scaling if it's enabled
		this.scaleDisplaySurface();

		// we create a new canvas element to swap out with the old one
		// this helps avoid flickering and re-rendering issues when we
		// are auto-resizing
		if(!this.autoScaleDisplaySurface)
		{
			var surface = this.getDisplaySurface();

			this.newSurfaceCanvas = document.createElement("canvas");
			this.newSurfaceCanvas.id = this.mainSurfaceCanvas.id;
			this.newSurfaceCanvas.width = window.innerWidth;
			this.newSurfaceCanvas.height = window.innerHeight;

			surface.setNativeCanvas(this.newSurfaceCanvas);
		}

		// notify of application resize
		this.dispatchEvent(new Event(Event.RESIZED));
	}

	handleLoad() {
		this.hasLoaded = true;

		// this application is managing it's own display surface
		if(this.hasManagedDisplaySurface)
			this.createManagedDisplaySurface();

		this.scaleDisplaySurface();
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
		var surface = null;
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

		// render the display surface and update any active AI
		surface = this.displaySurface;

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

		// notify listeners that rendering has completed
		if (needsRender)
		{
			// swap out old with new canvas to avoid flickering during resize
			if (this.newSurfaceCanvas != null)
			{
				var newCanvas = this.newSurfaceCanvas;
				this.newSurfaceCanvas = null;

				document.body.removeChild(this.mainSurfaceCanvas);
				document.body.appendChild(newCanvas);

				this.mainSurfaceCanvas = newCanvas;
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
}

export default Application;

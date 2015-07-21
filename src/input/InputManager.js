import Vector2D from "./../math/Vector2D";
import { IsIE, IsFirefox, ValueOrDefault } from "./../Engine";
import Gamepad from "./Gamepad";
import GamepadButtonEvent from "./GamepadButtonEvent";
import GamepadButtons from "./GamepadButtons";
import MouseButton from "./useButton";
import ModifierKeys from "./../ModifierKeys";
import Event from "./../Event";
import GestureEvent from "./../GestureEvent";
import Application from "./../Application";
import TouchEvent from "./TouchEvent";
import TouchPoint from "./TouchPoint";
import MouseEvent from "./useEvent";
import MouseButtonEvent from "./useButtonEvent";
import MouseWheelEvent from "./useWheelEvent";
import Key from "./../Key";
import KeyEvent from "./../KeyEvent";
import NavigationDirection from "./../navigation/NavigationDirection";
import NavigationEvent from "./../navigation/NavigationEvent";
import NavigationMode from "./../navigation/NavigationMode";
import EventDispatcher from "./../EventDispatcher";

class TouchTarget {
	constructor(drawable) {
		this.drawable = drawable;
		this.points = [];
	}
}

class NavigationSearchResult {
	constructor() {
		this.target = null;
		this.distance = null;
	}
}

// TODO : need to convert mouse/touch coordinates to local coordinates when dispatching the event to
//        that target

// TODO : need to hookup the following events/gestures for mobile
//          - tap        (analogous to single click)
//          - doubleTap  (analogous to double click)
//          - flick
//          - swipe
//          - pinch      (pinchIn / pinchOut)
//          - shake

class InputManager extends EventDispatcher {
	constructor(scene) {
		super();

		/** Surface **/
		this.target = scene;

		/** Vector2D **/
		this.mousePosition = Vector2D.Zero();

		/** Drawable **/
		this.mouseOverTarget = null;

		/** Drawable **/
		this.mouseTarget = null;

		/** Drawable **/
		this.focusTarget = null;

		/** Boolean **/
		this.hasMouse = false;

		this.touchPosition = Vector2D.Zero();
		this.touchTargets = [];
		this.hasTouch = false;

		/** Number **/
		this.lastKeyDown = 0;
		this.lastKeyDownTime = 0;
		this.lastKeyPress = 0;
		this.lastKeyPressTime = 0;
		this.lastNavigationButton = 0;
		this.lastNavigationTime = 0;

		// register all the events we plan to receive
		this.registerEvents();
	}

	getTarget() {
		return this.target;
	}

	getFocusTarget() {
		return this.focusTarget;
	}

	unregisterEvents() {
		var canvas = this.getTarget().getNativeCanvas();

		canvas.removeEventListener("mousedown", this.handleMouseDown.asDelegate(this), false);
		canvas.removeEventListener("mouseup", this.handleMouseUp.asDelegate(this), false);
		canvas.removeEventListener("mousemove", this.handleMouseMove.asDelegate(this), false);
		canvas.removeEventListener("mouseover", this.handleMouseOver.asDelegate(this), false);
		canvas.removeEventListener("mouseout", this.handleMouseOut.asDelegate(this), false);
		canvas.removeEventListener("dblclick", this.handleDoubleClick.asDelegate(this), false);

		if (window.isNativeHost) {
			canvas.removeEventListener("mousewheel", this.handleMouseWheel.asDelegate(this), false);
		}
		else {
			if (IsIE()) {
				canvas.removeEventListener("mousewheel", this.handleMouseWheel.asDelegate(this), false);
			}
			else if (IsFirefox()) {
				//canvas.addEventListener("MozMousePixelScroll", this.handleMouseWheel.asDelegate(this), false);		
				canvas.removeEventListener("DOMMouseScroll", this.handleMouseWheel.asDelegate(this), false);
			}
		}

		canvas.removeEventListener("contextmenu", this.handleContextMenu.asDelegate(this), false);

		canvas.removeEventListener("touchstart", this.handleTouchStart.asDelegate(this), false);
		canvas.removeEventListener("touchend", this.handleTouchEnd.asDelegate(this), false);
		canvas.removeEventListener("touchmove", this.handleTouchMove.asDelegate(this), false);
		canvas.removeEventListener("touchcancel", this.handleTouchCancel.asDelegate(this), false);

		canvas.removeEventListener("gesturestart", this.handleGestureStart.asDelegate(this), false);
		canvas.removeEventListener("gesturechange", this.handleGestureChange.asDelegate(this), false);
		canvas.removeEventListener("gestureend", this.handleGestureEnd.asDelegate(this), false);

		window.removeEventListener("keydown", this.handleKeyDown.asDelegate(this), false);
		window.removeEventListener("keyup", this.handleKeyUp.asDelegate(this), false);
		window.removeEventListener("keypress", this.handleKeyDown.asDelegate(this), false);
	}

	registerEvents() {
		this.registerMouseEvents();
		this.registerKeyboardEvents();
		this.registerGamepadEvents();
	}

	registerMouseEvents() {
		var canvas = this.getTarget().getNativeCanvas();

		// we only want to listen to these events from the canvas, this will give
		// use greater control while handling multi-canvas applications
		canvas.addEventListener("mousedown", this.handleMouseDown.asDelegate(this), false);
		canvas.addEventListener("mouseup", this.handleMouseUp.asDelegate(this), false);
		canvas.addEventListener("mousemove", this.handleMouseMove.asDelegate(this), false);
		canvas.addEventListener("mouseover", this.handleMouseOver.asDelegate(this), false);
		canvas.addEventListener("mouseout", this.handleMouseOut.asDelegate(this), false);
		canvas.addEventListener("dblclick", this.handleDoubleClick.asDelegate(this), false);

		// TODO : see what the other browsers support for mouse wheel scrolling
		if (window.isNativeHost) {
			canvas.addEventListener("mousewheel", this.handleMouseWheel.asDelegate(this), false);
		}
		else {
			if (IsIE()) {
				canvas.addEventListener("mousewheel", this.handleMouseWheel.asDelegate(this), false);
			}
			else if (IsFirefox()) {
				// for firefox we need to use the special DOMMouseScroll event
				//canvas.addEventListener("MozMousePixelScroll", this.handleMouseWheel.asDelegate(this), false);		
				canvas.addEventListener("DOMMouseScroll", this.handleMouseWheel.asDelegate(this), false);
			}
		}

		canvas.addEventListener("contextmenu", this.handleContextMenu.asDelegate(this), false);

		canvas.addEventListener("touchstart", this.handleTouchStart.asDelegate(this), false);
		canvas.addEventListener("touchend", this.handleTouchEnd.asDelegate(this), false);
		canvas.addEventListener("touchmove", this.handleTouchMove.asDelegate(this), false);
		canvas.addEventListener("touchcancel", this.handleTouchCancel.asDelegate(this), false);

		canvas.addEventListener("gesturestart", this.handleGestureStart.asDelegate(this), false);
		canvas.addEventListener("gesturechange", this.handleGestureChange.asDelegate(this), false);
		canvas.addEventListener("gestureend", this.handleGestureEnd.asDelegate(this), false);
	}

	registerKeyboardEvents() {
		window.addEventListener("keydown", this.handleKeyDown.asDelegate(this), false);
		window.addEventListener("keyup", this.handleKeyUp.asDelegate(this), false);
		window.addEventListener("keypress", this.handleKeyDown.asDelegate(this), false);
	}

	registerGamepadEvents() {
		var gp = Gamepad.getInstance();

		gp.addEventHandler(GamepadButtonEvent.DOWN, this.handleGamepadButtonDown.d(this));
		gp.addEventHandler(GamepadButtonEvent.UP, this.handleGamepadButtonUp.d(this));
	}

	// TODO : need to implement a custom context menu and/or allowing the native context menu
	handleContextMenu(evt) {
		//evt.preventDefault();
	}

	mouseButtonFromNativeButton(id) {
		switch (id) {
			case 0:
				return MouseButton.Left;
			case 1:
				return MouseButton.Middle;
			case 2:
				return MouseButton.Right;
		}

		return MouseButton.Unknown;
	}

	updateMousePosition(globalX, globalY) {
		var sourcePosition = this.getTarget().getAbsoluteSourcePosition();
		var sourceBounds = this.getTarget().getBounds();
		var actualPosition = new Vector2D(globalX - sourcePosition.x, globalY - sourcePosition.y);

		this.hasMouse = sourceBounds.containsPoint(actualPosition);

		if (this.hasMouse) {
			this.mousePosition.x = actualPosition.x;
			this.mousePosition.y = actualPosition.y;
		}
	}

	updateTouchPosition(globalX, globalY) {
		var sourcePosition = this.getTarget().getAbsoluteSourcePosition();
		var sourceBounds = this.getTarget().getBounds();
		var actualPosition = new Vector2D(globalX - sourcePosition.x, globalY - sourcePosition.y);

		this.hasTouch = sourceBounds.containsPoint(actualPosition);

		if (this.hasTouch) {
			this.touchPosition.x = actualPosition.x;
			this.touchPosition.y = actualPosition.y;
		}
	}

	getModifierKeysFromEvent(evt) {
		return ModifierKeys.fromValues(evt.altKey, evt.ctrlKey, evt.shiftKey, evt.metaKey)
	}

	focus(target, isMouse) {
		isMouse = ValueOrDefault(isMouse, false);

		// focus if we have moved to a new target drawable
		if (target != this.focusTarget) {
			if (!isMouse || (isMouse && target != null && target.getIsMouseFocusEnabled())) {
				// focus out for the previously focused target
				if (this.focusTarget != null) {
					// allow any listeners to cancel the event and keep focus, in which
					// case we simply bail out so the new target doesn't take focus
					if (!this.focusTarget.handleEvent(new Event(Event.FOCUS_OUT, false, true))) {
						return;
					}

					this.focusTarget.setIsFocused(false);
					this.focusTarget = null;
				}

				// focus in to the new target
				if (target != null) {
					// navigation zone's should not be allowed to receive focus directly
					// however, their children possibly can, so we need to see there is
					// a suitable target to take the focus
					if (target.getIsNavigationZone()) {
						target = this.findFirstAvailableFocusTarget(target);

						// no suitable target to take focus, just abort
						if (target == null) {
							return;
						}
					}

					this.focusTarget = target;

					// focus in on the target as long as the user didn't cancel
					if (this.focusTarget.handleEvent(new Event(Event.FOCUS_IN, false, true))) {
						this.focusTarget.setIsFocused(true);
					}
				}
			}
		}
	}

	handleMouseMove(evt) {

		var isMouseWithin = this.hasMouse;

		this.updateMousePosition(evt.clientX, evt.clientY);

		// there is no mouse captured and the new mouse position is not in
		// our canvas
		if (!isMouseWithin && !this.hasMouse) {
			return;
		}

		// get the hit test object
		var hitTestResult = this.getTarget().hitTest(this.mousePosition.x, this.mousePosition.y);

		if (hitTestResult != null) {
			if (hitTestResult != this.mouseOverTarget) {
				if (this.mouseOverTarget != null) {
					this.mouseOverTarget.handleEvent(new MouseEvent(MouseEvent.MOUSE_LEAVE, this.mousePosition.x, this.mousePosition.y, this.mouseButtonFromNativeButton(evt.button), this.getModifierKeysFromEvent(evt)));
				}

				hitTestResult.handleEvent(new MouseEvent(MouseEvent.MOUSE_ENTER, this.mousePosition.x, this.mousePosition.y, this.mouseButtonFromNativeButton(evt.button), this.getModifierKeysFromEvent(evt)));
			}

			this.mouseOverTarget = hitTestResult;

			hitTestResult.handleEvent(new MouseEvent(MouseEvent.MOUSE_MOVE, this.mousePosition.x, this.mousePosition.y, this.mouseButtonFromNativeButton(evt.button), this.getModifierKeysFromEvent(evt)));
		}
		else if (this.mouseOverTarget != null) {
			this.mouseOverTarget.handleEvent(new MouseEvent(MouseEvent.MOUSE_LEAVE, this.mousePosition.x, this.mousePosition.y, this.mouseButtonFromNativeButton(evt.button), this.getModifierKeysFromEvent(evt)));
			this.mouseOverTarget = null;
		}
	}

	handleMouseDown(evt) {

		this.updateMousePosition(evt.clientX, evt.clientY);

		var hitTestResult = this.getTarget().hitTest(this.mousePosition.x, this.mousePosition.y);

		if (hitTestResult != null) {
			hitTestResult.handleEvent(new MouseButtonEvent(MouseEvent.MOUSE_DOWN, this.mouseButtonFromNativeButton(evt.button), true, this.mousePosition.x, this.mousePosition.y, 1, this.getModifierKeysFromEvent(evt)));

			this.mouseTarget = hitTestResult;
			this.focus(this.mouseTarget);
		}
	}

	handleMouseUp(evt) {
		this.updateMousePosition(evt.clientX, evt.clientY);

		var hitTestResult = this.getTarget().hitTest(this.mousePosition.x, this.mousePosition.y);

		if (this.mouseTarget != null) {
			if (this.mouseTarget == hitTestResult) {
				hitTestResult.handleEvent(new MouseButtonEvent(MouseEvent.MOUSE_UP, this.mouseButtonFromNativeButton(evt.button), false, this.mousePosition.x, this.mousePosition.y, 0, this.getModifierKeysFromEvent(evt)));
				hitTestResult.handleEvent(new MouseButtonEvent(MouseEvent.CLICK, this.mouseButtonFromNativeButton(evt.button), false, this.mousePosition.x, this.mousePosition.y, 1, this.getModifierKeysFromEvent(evt)));
			}
			else {

				this.mouseTarget.handleEvent(new MouseButtonEvent(MouseEvent.MOUSE_UP_OUTSIDE, this.mouseButtonFromNativeButton(evt.button), false, this.mousePosition.x, this.mousePosition.y, 0, this.getModifierKeysFromEvent(evt)));
			}
		}

		this.mouseTarget = null;
	}

	handleMouseOver(evt) {
		this.getTarget().handleEvent(new MouseEvent(MouseEvent.MOUSE_ENTER, this.mousePosition.x, this.mousePosition.y, this.mouseButtonFromNativeButton(evt.button), this.getModifierKeysFromEvent(evt)));
	}

	handleMouseOut(evt) {
		if (this.mouseOverTarget != null) {
			this.mouseOverTarget.handleEvent(new MouseEvent(MouseEvent.MOUSE_LEAVE, this.mousePosition.x, this.mousePosition.y, this.mouseButtonFromNativeButton(evt.button), this.getModifierKeysFromEvent(evt)));
		}

		// the mouse has left the canvas, fire off an event to the target scene
		// and reset all our current mouse info, since we no longer care about any
		// mouse events.
		this.getTarget().handleEvent(new MouseEvent(MouseEvent.MOUSE_LEAVE, this.mousePosition.x, this.mousePosition.y, this.mouseButtonFromNativeButton(evt.button), this.getModifierKeysFromEvent(evt)));

		this.hasMouse = false;
		this.mouseTarget = null;
		this.mouseOverTarget = null;
	}

	handleDoubleClick(evt) {

		var hitTestResult = this.getTarget().hitTest(this.mousePosition.x, this.mousePosition.y);

		if (hitTestResult != null) {
			hitTestResult.handleEvent(new MouseButtonEvent(MouseEvent.DOUBLE_CLICK, this.mouseButtonFromNativeButton(evt.button), true, this.mousePosition.x, this.mousePosition.y, 2, this.getModifierKeysFromEvent(evt)));
		}
	}

	handleMouseWheel(evt) {

		if (!this.hasMouse) {
			return;
		}

		var hitTestResult = this.getTarget().hitTest(this.mousePosition.x, this.mousePosition.y);

		if (hitTestResult != null) {
			// TODO : update the delta calculation when pixel scrolling is implemented

			var scrollDelta = (evt.wheelDelta ? evt.wheelDelta : evt.detail);

			if (scrollDelta > 100 || scrollDelta < -100) {
				scrollDelta /= -150;
			}

			var delta = scrollDelta;

			if (delta != 0) {
				delta = Math.abs(delta) / delta;
			}

			delta = Math.min((Math.abs(scrollDelta) / 100), 1) * delta;

			hitTestResult.handleEvent(new MouseWheelEvent(MouseEvent.MOUSE_WHEEL, delta, this.mousePosition.x, this.mousePosition.y, this.getModifierKeysFromEvent(evt)));
		}
	}

	handleKeyDown(evt) {
		var keyEvent = null;
		var isSameKey = false;
		var isRepeat = false;

		if (evt.type == "keydown") {
			isSameKey = (evt.keyCode == this.lastKeyDown);
			isRepeat = (isSameKey && ((evt.timeStamp - this.lastKeyDownTime) <= 50));
		}

		// it's possible that the focus target might not 
		// have focus anymore if the user toggled it off
		if (this.focusTarget != null && this.focusTarget.getIsFocused()) {
			// fire key down event
			if (evt.type == "keydown") {
				keyEvent = new KeyEvent(KeyEvent.KEY_DOWN, evt.keyCode, true, isRepeat, ModifierKeys.fromValues(evt.altKey, evt.ctrlKey, evt.shiftKey, evt.metaKey), -1);

				this.focusTarget.handleEvent(keyEvent);
			}

			// fire key press event
			if (evt.type == "keypress") {
				isSameKey = (evt.charCode == this.lastKeyPress);
				isRepeat = (isSameKey && ((evt.timeStamp - this.lastKeyPressTime) <= 50));
				keyEvent = new KeyEvent(KeyEvent.KEY_PRESS, evt.keyCode, true, isRepeat, ModifierKeys.fromValues(evt.altKey, evt.ctrlKey, evt.shiftKey, evt.metaKey));

				this.focusTarget.handleEvent(keyEvent);
			}
		}

		if (evt.type == "keydown") {
			this.lastKeyDown = evt.keyCode;
			this.lastKeyDownTime = evt.timeStamp;

			var key = Key.fromKeyCode(evt.keyCode);

			if ((keyEvent == null || (keyEvent != null && !keyEvent.getIsDefaultPrevented())) &&
					this.isNavigationKey(key)) {
				this.processKeyboardNavigationEvent(key);
			}

			// always send to application
			if (!Application.getInstance().dispatchEvent(new KeyEvent(KeyEvent.KEY_DOWN, evt.keyCode, true, isRepeat, ModifierKeys.fromValues(evt.altKey, evt.ctrlKey, evt.shiftKey, evt.metaKey), -1))) {
				evt.preventDefault();
				return;
			}
		}

		if (evt.type == "keypress") {
			this.lastKeyPress = evt.charCode;
			this.lastKeyPressTime = evt.timeStamp;
		}

		if (keyEvent != null && keyEvent.getIsDefaultPrevented()) {
			evt.preventDefault();
		}
	}

	handleKeyUp(evt) {
		// it's possible that the focus target might not 
		// have focus anymore if the user toggled it off
		if (this.focusTarget != null && this.focusTarget.getIsFocused()) {
			this.focusTarget.handleEvent(new KeyEvent(KeyEvent.KEY_UP, evt.keyCode, false, false, ModifierKeys.fromValues(evt.altKey, evt.ctrlKey, evt.shiftKey, evt.metaKey), -1));
		}

		// always send to application
		Application.getInstance().dispatchEvent(new KeyEvent(KeyEvent.KEY_UP, evt.keyCode, false, false, ModifierKeys.fromValues(evt.altKey, evt.ctrlKey, evt.shiftKey, evt.metaKey), -1));
	}

	handleGamepadButtonDown(e) {
		if (this.focusTarget != null && this.focusTarget.getIsFocused()) {
			var evt = new GamepadButtonEvent(GamepadButtonEvent.DOWN, e.getIndex(), e.getButton(), e.getIsDown(), e.getTimestamp(), true, true);

			this.focusTarget.handleEvent(evt);

			if (evt.getIsDefaultPrevented()) {
				return;
			}
		}

		// check if the event came from the current input gamepad
		// and try to process and navigation
		if (e.getIndex() == Gamepad.getInputIndex() && this.isNavigationButton(e.getButton())) {
			if (this.lastNavigationTime == 0 || (e.getTimestamp() - this.lastNavigationTime > 100)) {
				this.lastNavigationTime = e.getTimestamp();
				this.lastNavigationButton = e.getButton();

				this.processGamepadNavigationEvent(e);
			}
		}
	}

	handleGamepadButtonUp(e) {
		if (this.focusTarget == null) {
			return;
		}

		// just pass the event directly through, however, in the future we may want/need
		// to change this to support repeating flags, timing, etc...
		if (this.focusTarget.getIsFocused()) {
			this.focusTarget.handleEvent(new GamepadButtonEvent(GamepadButtonEvent.UP, e.getIndex(), e.getButton(), e.getIsDown(), e.getTimestamp(), true));
		}
	}

	processGamepadNavigationEvent(e) {
		switch (e.getButton()) {
			case GamepadButtons.DPadUp:
			case GamepadButtons.LeftStickUp:
				this.processNavigationEvent(NavigationDirection.Up);
				break;
			case GamepadButtons.DPadDown:
			case GamepadButtons.LeftStickDown:
				this.processNavigationEvent(NavigationDirection.Down);
				break;
			case GamepadButtons.DPadLeft:
			case GamepadButtons.LeftStickLeft:
				this.processNavigationEvent(NavigationDirection.Left);
				break;
			case GamepadButtons.DPadRight:
			case GamepadButtons.LeftStickRight:
				this.processNavigationEvent(NavigationDirection.Right);
				break;
		}
	}

	processKeyboardNavigationEvent(key) {
		switch (key) {
			case Key.Up:
				this.processNavigationEvent(NavigationDirection.Up);
				break;
			case Key.Down:
				this.processNavigationEvent(NavigationDirection.Down);
				break;
			case Key.Left:
				this.processNavigationEvent(NavigationDirection.Left);
				break;
			case Key.Right:
				this.processNavigationEvent(NavigationDirection.Right);
				break;
		}
	}

	processNavigationEvent(direction) {
		var currentFocusTarget = this.focusTarget;
		var currentNavigationZone = (currentFocusTarget == null ? null : currentFocusTarget.getNavigationZone());

		// try to find the first available navigation zone if the current 
		// focus target does not have one or if there is no focus target
		if (currentFocusTarget == null || currentNavigationZone == null) {
			currentNavigationZone = this.findFirstNavigationZone(this.target);
		}

		// unable to find a suitable navigation zone to search in
		if (currentNavigationZone == null) {
			return;
		}

		// we do not yet have a focus target to use as a search
		// reference, so try and find the first one available in
		// the navigation zone
		if (currentFocusTarget == null) {
			currentFocusTarget = this.findFirstAvailableFocusTarget(currentNavigationZone);

			// still unable to find a focus target, so just focus on the navigation
			// zone and let it handle input events
			if (currentFocusTarget == null) {
				currentFocusTarget = currentNavigationZone;
			}

			this.navigate(direction, this.focusTarget, currentFocusTarget);
			return;
		}

		// otherwise, try to move focus in the requested direction
		var navigationMode = currentFocusTarget.getNavigationMode();
		var navigationDirectionNormal = Vector2D.Zero();

		switch (direction) {
			case NavigationDirection.Up:
				navigationDirectionNormal.y = -1;
				break;
			case NavigationDirection.Down:
				navigationDirectionNormal.y = 1;
				break;
			case NavigationDirection.Left:
				navigationDirectionNormal.x = -1;
				break;
			case NavigationDirection.Right:
				navigationDirectionNormal.x = 1;
				break;
		}

		// search for the next target that can take focus
		var searchResult = this.findNextFocusTarget(currentFocusTarget, currentNavigationZone, direction, navigationDirectionNormal, navigationMode);

		// if the search found a suitable target, then focus on it
		this.navigate(direction, this.focusTarget, searchResult.target);
	}

	navigate(direction, targetFrom, targetTo) {
		// send a leave event to the current target
		if (targetFrom != null) {
			var navLeaveEvent = new NavigationEvent(NavigationEvent.LEAVE, direction, targetFrom, targetTo, true, true);

			// allow the navigation to be cancelled
			if (!targetFrom.handleEvent(navLeaveEvent)) {
				return false;
			}
		}

		if (targetTo != null) {
			// then an enter event to the new target
			var navEnterEvent = new NavigationEvent(NavigationEvent.ENTER, direction, targetFrom, targetTo, true, true);

			// also check if it was cancelled, this will still allow listeners
			// to focus or run other custom navigation rules without auto-focusing
			if (!targetTo.handleEvent(navEnterEvent)) {
				return false;
			}

			targetTo.focus();
		}

		return true;
	}

	findNextFocusTarget(focusReference, searchTarget, navigationDirection, navigationDirectionNormal, navigationMode) {
		var searchResult = new NavigationSearchResult();
		var referencePosition = this.getNavigationPositionForDirection(focusReference, navigationDirection);

		// run the search
		this.findNextFocusTargetImpl(focusReference, referencePosition, searchResult, searchTarget, navigationDirection, navigationDirectionNormal, navigationMode);

		// no target was found, the last step is to go to the navigation
		// zone above the current and see if there is a sibling that has
		// a suitable target to take focus, otherwise no change in focus
		if (searchResult.target == null) {
			var nextSearchTarget = searchTarget.getNavigationZone(false);
			var nextNavigationZone = null;

			// unable to find any suitable target to focus on to
			if (nextSearchTarget == null) {
				return searchResult;
			}

			// reset search result
			searchResult.distance = null;
			searchResult.target = null;

			// set our reference point to the navigation zone
			referencePosition = this.getNavigationPositionForDirection(searchTarget, navigationDirection);

			// search only the zone's first level children
			for (var i = 0, len = nextSearchTarget.getCount(); i < len; ++i) {
				var c = nextSearchTarget.getAt(i);

				// exclude the existing search target since we
				// have already exhausted all possibilities from it
				if (c == searchTarget) {
					continue;
				}

				// make sure there is a suitable focus target
				var firstAvailableTarget = this.findFirstAvailableFocusTarget(c);

				if (firstAvailableTarget == null) {
					continue;
				}

				// check if the zone is in the right direction
				var position = this.getNavigationPositionForDirection(c, this.getOppositeNavigationDirection(navigationDirection));
				var distance = position.distance(referencePosition);
				var direction = position.subtract(referencePosition);

				direction.normalize();

				if ((searchResult.distance == null || distance < searchResult.distance) &&
						((direction.x * navigationDirectionNormal.x) > 0 || (direction.y * navigationDirectionNormal.y) > 0)) {
					if (navigationMode == NavigationMode.Normal || (navigationMode == NavigationMode.Constrain &&
							nextSearchTarget.getParent() == searchTarget.getParent())) {
						// found one... update our search result
						nextNavigationZone = c;

						searchResult.target = firstAvailableTarget;
						searchResult.distance = distance;
					}
				}
			}
		}

		return searchResult;
	}

	findNextFocusTargetImpl(focusReference, referencePosition, searchResult, searchTarget, navigationDirection, navigationDirectionNormal, navigationMode) {
		// only visible containers can be searched
		if (searchTarget == null || !searchTarget.getVisible()) {
			return;
		}

		// must not be the current focused element, must be visible and must have navigation focus enabled
		// to be considered a target candidate
		if (searchTarget != focusReference && searchTarget.getIsNavigationFocusEnabled()) {
			// check if the target is in the right direction
			var position = this.getNavigationPositionForDirection(searchTarget, this.getOppositeNavigationDirection(navigationDirection));
			var distance = position.distance(referencePosition);
			var direction = position.subtract(referencePosition);

			direction.normalize();

			if ((searchResult.distance == null || distance < searchResult.distance) &&
					((direction.x * navigationDirectionNormal.x) > 0 || (direction.y * navigationDirectionNormal.y) > 0)) {
				if (navigationMode == NavigationMode.Normal ||
						(navigationMode == NavigationMode.Constrain && searchTarget.getParent() == focusReference.getParent())) {
					searchResult.target = searchTarget;
					searchResult.distance = distance;
				}
			}
		}

		// keep going until the entire tree has been searched
		for (var i = 0, len = searchTarget.getCount(); i < len; ++i) {
			this.findNextFocusTargetImpl(focusReference, referencePosition, searchResult, searchTarget.getAt(i), navigationDirection, navigationDirectionNormal, navigationMode);
		}
	}

	findFirstAvailableFocusTarget(searchTarget) {
		if (searchTarget != null && searchTarget.getVisible() && searchTarget.getIsNavigationFocusEnabled()) {
			return searchTarget;
		}

		for (var i = 0, len = searchTarget.getCount(); i < len; ++i) {
			var target = this.findFirstAvailableFocusTarget(searchTarget.getAt(i));

			if (target != null) {
				return target;
			}
		}

		return null;
	}

	findFirstNavigationZone(searchTarget) {
		if (searchTarget != null && searchTarget.getVisible() && searchTarget.getIsNavigationZone()) {
			return searchTarget;
		}

		for (var i = 0, len = searchTarget.getCount(); i < len; ++i) {
			var target = this.findFirstNavigationZone(searchTarget.getAt(i));

			if (target != null) {
				return target;
			}
		}
	}

	getOppositeNavigationDirection(direction) {
		switch (direction) {
			case NavigationDirection.Up:
				return NavigationDirection.Down;
			case NavigationDirection.Down:
				return NavigationDirection.Up;
			case NavigationDirection.Left:
				return NavigationDirection.Right;
			case NavigationDirection.Right:
				return NavigationDirection.Left;
		}
	}

	getNavigationPositionForDirection(target, direction) {
		var width = target.getWidth();
		var height = target.getHeight();
		var position = target.pointToGlobal(Vector2D.Zero());

		switch (direction) {
			case NavigationDirection.Down:
				position.y += (height * 0.5);
				break;
			case NavigationDirection.Right:
				position.x += (width * 0.5);
				break;
		}

		return position;
	}

	isNavigationButton(button) {
		return (button == GamepadButtons.DPadUp ||
		button == GamepadButtons.DPadDown ||
		button == GamepadButtons.DPadLeft ||
		button == GamepadButtons.DPadRight ||
		button == GamepadButtons.LeftStickUp ||
		button == GamepadButtons.LeftStickDown ||
		button == GamepadButtons.LeftStickLeft ||
		button == GamepadButtons.LeftStickRight);
	}

	isNavigationKey(key) {
		return (key == Key.Down ||
		key == Key.Up ||
		key == Key.Left ||
		key == Key.Right);
	}

	handleTouchStart(evt) {
		var touches = evt.changedTouches;
		var touch, i;
		var len = touches.length;
		var targets = [];

		// determine which drawables have been touched
		for (i = 0; i < len; ++i) {
			touch = touches[i];

			// update the touch position to local scene coordinates
			this.updateTouchPosition(touch.clientX, touch.clientY);

			// the touch exists within our scene
			if (this.hasTouch) {
				// determine which drawable has been hit
				var hitTestResult = this.getTarget().hitTest(this.touchPosition.x, this.touchPosition.y);

				if (hitTestResult != null) {
					// we'll need to store this target so we can track
					// it later during move/end events
					if (!this.touchTargets.contains(hitTestResult)) {
						this.touchTargets.push(hitTestResult);
					}

					// add the touch id
					hitTestResult.touches.push(touch.identifier);

					// add the touch info to our targets
					this.addTouchPointToTarget(targets, hitTestResult, new TouchPoint(touch.identifier, this.touchPosition.x, this.touchPosition.y));
				}
			}
		}

		var cancelEvent = !Application.getInstance().getEnableNativeGestures();

		// now we can send an event to each of the
		// target drawables found
		len = targets.length;

		for (i = 0; i < len; ++i) {
			var target = targets[i];

			if (!target.drawable.handleEvent(new TouchEvent(TouchEvent.TOUCH_START, target.points, evt.scale, evt.rotation))) {
				cancelEvent = true;
			}
		}

		// stop the device from processing the native touch event
		if (cancelEvent) {
			evt.preventDefault();
		}
	}

	handleTouchEnd(evt) {
		var touches = evt.changedTouches;
		var touch, i, target;
		var len = touches.length;
		var targets = [];

		// determine which drawables have been touched
		for (i = 0; i < len; ++i) {
			touch = touches[i];

			// update the touch position to local scene coordinates
			this.updateTouchPosition(touch.clientX, touch.clientY);

			// see if we have a target for the given identifier, otherwise
			// we don't have anything to do, this would most likely never
			// occur but just in case
			target = this.findTouchTarget(touch.identifier, true);

			if (target == null) {
				continue;
			}

			// add the touch info to our target list
			this.addTouchPointToTarget(targets, target, new TouchPoint(touch.identifier, this.touchPosition.x, this.touchPosition.y));
		}

		var cancelEvent = !Application.getInstance().getEnableNativeGestures();

		// now we can send an event to each of the
		// target drawables found
		len = targets.length;

		for (i = 0; i < len; ++i) {
			target = targets[i];

			// if the drawable doesn't contain anymore touches
			// then we must remove it from the global target list
			if (target.drawable.touches.length == 0) {
				this.touchTargets.remove(target.drawable);
			}

			if (!target.drawable.handleEvent(new TouchEvent(TouchEvent.TOUCH_END, target.points, evt.scale, evt.rotation))) {
				cancelEvent = true;
			}
		}

		// stop the device from processing the native touch event
		if (cancelEvent) {
			evt.preventDefault();
		}
	}

	handleTouchMove(evt) {
		var touches = evt.changedTouches;
		var touch, i, target;
		var len = touches.length;
		var targets = [];

		// determine which drawables have been touched
		for (i = 0; i < len; ++i) {
			touch = touches[i];

			// update the touch position to local scene coordinates
			this.updateTouchPosition(touch.clientX, touch.clientY);

			// see if we have a target for the given identifier, otherwise
			// we don't have anything to do, this would most likely never
			// occur but just in case
			target = this.findTouchTarget(touch.identifier, false);

			if (target == null) {
				continue;
			}

			// add the touch info to our target list
			this.addTouchPointToTarget(targets, target, new TouchPoint(touch.identifier, this.touchPosition.x, this.touchPosition.y));
		}

		var cancelEvent = !Application.getInstance().getEnableNativeGestures();

		// now we can send an event to each of the
		// target drawables found
		len = targets.length;

		for (i = 0; i < len; ++i) {
			target = targets[i];

			if (!target.drawable.handleEvent(new TouchEvent(TouchEvent.TOUCH_MOVE, target.points, evt.scale, evt.rotation))) {
				cancelEvent = true;
			}
		}

		// stop the device from processing the native touch event
		if (cancelEvent) {
			evt.preventDefault();
		}
	}

	handleTouchCancel(evt) {
		var touches = evt.changedTouches;
		var touch, i, target;
		var len = touches.length;
		var targets = [];

		// determine which drawables have been touched
		for (i = 0; i < len; ++i) {
			touch = touches[i];

			// update the touch position to local scene coordinates
			this.updateTouchPosition(touch.clientX, touch.clientY);

			// see if we have a target for the given identifier, otherwise
			// we don't have anything to do, this would most likely never
			// occur but just in case
			target = this.findTouchTarget(touch.identifier, true);

			if (target == null) {
				continue;
			}

			// add the touch info to our target list
			this.addTouchPointToTarget(targets, target, new TouchPoint(touch.identifier, this.touchPosition.x, this.touchPosition.y));
		}

		var cancelEvent = !Application.getInstance().getEnableNativeGestures();

		// now we can send an event to each of the
		// target drawables found
		len = targets.length;

		for (i = 0; i < len; ++i) {
			target = targets[i];

			// if the drawable doesn't contain anymore touches
			// then we must remove it from the global target list
			if (target.drawable.touches.length == 0) {
				this.touchTargets.remove(target.drawable);
			}

			if (!target.drawable.handleEvent(new TouchEvent(TouchEvent.TOUCH_CANCEL, target.points, evt.scale, evt.rotation))) {
				cancelEvent = true;
			}
		}

		// stop the device from processing the native touch event
		if (cancelEvent) {
			evt.preventDefault();
		}
	}

	handleGestureStart(evt) {
		var cancelEvent = !Application.getInstance().getEnableNativeGestures();

		if (!this.getTarget().handleEvent(new GestureEvent(GestureEvent.GESTURE_START, evt.rotation, evt.scale))) {
			cancelEvent = true;
		}

		if (cancelEvent) {
			evt.preventDefault();
		}
	}

	handleGestureChange(evt) {
		var cancelEvent = !Application.getInstance().getEnableNativeGestures();

		if (!this.getTarget().handleEvent(new GestureEvent(GestureEvent.GESTURE_CHANGE, evt.rotation, evt.scale))) {
			cancelEvent = true;
		}

		if (cancelEvent) {
			evt.preventDefault();
		}
	}

	handleGestureEnd(evt) {
		var cancelEvent = !Application.getInstance().getEnableNativeGestures();

		if (!this.getTarget().handleEvent(new GestureEvent(GestureEvent.GESTURE_END, evt.rotation, evt.scale))) {
			cancelEvent = true;
		}

		if (cancelEvent) {
			evt.preventDefault();
		}
	}

	addTouchPointToTarget(targets, drawable, point) {
		var len = targets.length;
		var touchTarget;

		for (var i = 0; i < len; ++i) {
			touchTarget = targets[i];

			if (touchTarget.drawable == drawable) {
				touchTarget.points.push(point);
				return;
			}
		}

		touchTarget = new TouchTarget(drawable);
		touchTarget.points.push(point);
		targets.push(touchTarget);
	}

	findTouchTarget(id, doRemove) {
		var len = this.touchTargets.length;
		var target = null;

		for (var i = 0; i < len; ++i) {
			target = this.touchTargets[i];

			for (var j = 0; j < target.touches.length; ++j) {
				if (target.touches[j] == id) {
					if (doRemove) {
						target.touches.removeAt(j);
					}

					return target;
				}
			}
		}

		return null;
	}
}

export default InputManager;

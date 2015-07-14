MoTouchTarget = Class.create(
// @PRIVATE 
{
	initialize : function(drawable) {
		this.drawable = drawable;
		this.points = [];
	}
});

MoNavigationSearchResult = Class.create(
// @PRIVATE
{
	initialize : function() {
		this.target = null;
		this.distance = null;
	}
});

// TODO : need to convert mouse/touch coordinates to local coordinates when dispatching the event to
//        that target

// TODO : need to hookup the following events/gestures for mobile
//          - tap        (analogous to single click)
//          - doubleTap  (analogous to double click)
//          - flick
//          - swipe
//          - pinch      (pinchIn / pinchOut)
//          - shake

MoInputManager = Class.create(MoEventDispatcher, 
// @PRIVATE 
{
	initialize : function(scene) {
		
		/** MoSurface **/
		this.target = scene;
		
		/** MoVector2D **/
		this.mousePosition = MoVector2D.Zero();
		
		/** MoDrawable **/
		this.mouseOverTarget = null;

		/** MoDrawable **/
		this.mouseTarget = null;
		
		/** MoDrawable **/
		this.focusTarget = null;
		
		/** Boolean **/
		this.hasMouse = false;
		
		this.touchPosition = MoVector2D.Zero();
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
	},

	getTarget : function() {
		return this.target;
	},
	
	getFocusTarget : function() {
		return this.focusTarget;
	},

	unregisterEvents : function() {
		var canvas = this.getTarget().getNativeCanvas();
		
		canvas.removeEventListener("mousedown", this.handleMouseDown.asDelegate(this), false);
		canvas.removeEventListener("mouseup", this.handleMouseUp.asDelegate(this), false);
		canvas.removeEventListener("mousemove", this.handleMouseMove.asDelegate(this), false);
		canvas.removeEventListener("mouseover", this.handleMouseOver.asDelegate(this), false);
		canvas.removeEventListener("mouseout", this.handleMouseOut.asDelegate(this), false);
		canvas.removeEventListener("dblclick", this.handleDoubleClick.asDelegate(this), false);
		
		if(window.isNativeHost)
		{
			canvas.removeEventListener("mousewheel", this.handleMouseWheel.asDelegate(this), false);
		}
		else
		{
			if(MoIsIE())
			{
				canvas.removeEventListener("mousewheel", this.handleMouseWheel.asDelegate(this), false);
			}
			else if(MoIsFirefox())
			{
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
	},
	
	registerEvents : function() {
		this.registerMouseEvents();
		this.registerKeyboardEvents();
		this.registerGamepadEvents();
	},
	
	registerMouseEvents : function() {
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
		if(window.isNativeHost)
		{
			canvas.addEventListener("mousewheel", this.handleMouseWheel.asDelegate(this), false);
		}
		else
		{
			if(MoIsIE())
			{
				canvas.addEventListener("mousewheel", this.handleMouseWheel.asDelegate(this), false);
			}
			else if(MoIsFirefox())
			{
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
	},

	registerKeyboardEvents : function() {		
		window.addEventListener("keydown", this.handleKeyDown.asDelegate(this), false);
		window.addEventListener("keyup", this.handleKeyUp.asDelegate(this), false);
		window.addEventListener("keypress", this.handleKeyDown.asDelegate(this), false);
	},
	
	registerGamepadEvents : function() {
		var gp = MoGamepad.getInstance();
		
		gp.addEventHandler(MoGamepadButtonEvent.DOWN, this.handleGamepadButtonDown.d(this));
		gp.addEventHandler(MoGamepadButtonEvent.UP, this.handleGamepadButtonUp.d(this));
	},
	
	// TODO : need to implement a custom context menu and/or allowing the native context menu
	handleContextMenu : function(evt) {	
		//evt.preventDefault();
	},
	
	mouseButtonFromNativeButton : function(id) {
		switch(id)
		{
			case 0:
				return MoMouseButton.Left;
			case 1:
				return MoMouseButton.Middle;
			case 2:
				return MoMouseButton.Right;
		}
		
		return MoMouseButton.Unknown;
	},
	
	updateMousePosition : function(globalX, globalY) {
		var sourcePosition = this.getTarget().getAbsoluteSourcePosition();
		var sourceBounds = this.getTarget().getBounds();
		var actualPosition = new MoVector2D(globalX - sourcePosition.x, globalY - sourcePosition.y);
		
		this.hasMouse = sourceBounds.containsPoint(actualPosition);

		if(this.hasMouse)
		{
			this.mousePosition.x = actualPosition.x;
			this.mousePosition.y = actualPosition.y;
		}
	},
	
	updateTouchPosition : function(globalX, globalY) {
		var sourcePosition = this.getTarget().getAbsoluteSourcePosition();
		var sourceBounds = this.getTarget().getBounds();
		var actualPosition = new MoVector2D(globalX - sourcePosition.x, globalY - sourcePosition.y);
		
		this.hasTouch = sourceBounds.containsPoint(actualPosition);

		if(this.hasTouch)
		{
			this.touchPosition.x = actualPosition.x;
			this.touchPosition.y = actualPosition.y;
		}
	},
	
	getModifierKeysFromEvent : function(evt) {
		return MoModifierKeys.fromValues(evt.altKey, evt.ctrlKey, evt.shiftKey, evt.metaKey)
	},
	
	focus : function(target, isMouse) {
		isMouse = MoValueOrDefault(isMouse, false);

		// focus if we have moved to a new target drawable
		if(target != this.focusTarget)
		{
			if(!isMouse || (isMouse && !MoIsNull(target) && target.getIsMouseFocusEnabled()))
			{
				// focus out for the previously focused target
				if(!MoIsNull(this.focusTarget))
				{					
					// allow any listeners to cancel the event and keep focus, in which
					// case we simply bail out so the new target doesn't take focus
					if(!this.focusTarget.handleEvent(new MoEvent(MoEvent.FOCUS_OUT, false, true)))
						return;

					this.focusTarget.setIsFocused(false);
					this.focusTarget = null;
				}

				// focus in to the new target
				if(!MoIsNull(target))
				{
					// navigation zone's should not be allowed to receive focus directly
					// however, their children possibly can, so we need to see there is
					// a suitable target to take the focus
					if(target.getIsNavigationZone())
					{
						target = this.findFirstAvailableFocusTarget(target);
						
						// no suitable target to take focus, just abort
						if(MoIsNull(target))
							return;
					}
					
					this.focusTarget = target;
					
					// focus in on the target as long as the user didn't cancel
					if(this.focusTarget.handleEvent(new MoEvent(MoEvent.FOCUS_IN, false, true)))
						this.focusTarget.setIsFocused(true);
				}
			}
		}
	},

	handleMouseMove : function(evt) {

		var isMouseWithin = this.hasMouse;

		this.updateMousePosition(evt.clientX, evt.clientY);
		
		// there is no mouse captured and the new mouse position is not in
		// our canvas
		if(!isMouseWithin && !this.hasMouse)
			return;
		
		// get the hit test object
		var hitTestResult = this.getTarget().hitTest(this.mousePosition.x, this.mousePosition.y);

		if(hitTestResult != null)
		{
			if(hitTestResult != this.mouseOverTarget)
			{
				if(this.mouseOverTarget != null)
					this.mouseOverTarget.handleEvent(new MoMouseEvent(MoMouseEvent.MOUSE_LEAVE, this.mousePosition.x, this.mousePosition.y, this.mouseButtonFromNativeButton(evt.button), this.getModifierKeysFromEvent(evt)));

				hitTestResult.handleEvent(new MoMouseEvent(MoMouseEvent.MOUSE_ENTER, this.mousePosition.x, this.mousePosition.y, this.mouseButtonFromNativeButton(evt.button), this.getModifierKeysFromEvent(evt)));
			}
		
			this.mouseOverTarget = hitTestResult;

			hitTestResult.handleEvent(new MoMouseEvent(MoMouseEvent.MOUSE_MOVE, this.mousePosition.x, this.mousePosition.y, this.mouseButtonFromNativeButton(evt.button), this.getModifierKeysFromEvent(evt)));
		}
		else if(this.mouseOverTarget != null)
		{
			this.mouseOverTarget.handleEvent(new MoMouseEvent(MoMouseEvent.MOUSE_LEAVE, this.mousePosition.x, this.mousePosition.y, this.mouseButtonFromNativeButton(evt.button), this.getModifierKeysFromEvent(evt)));
			this.mouseOverTarget = null;
		}
	},

	handleMouseDown : function(evt) {

		this.updateMousePosition(evt.clientX, evt.clientY);

		var hitTestResult = this.getTarget().hitTest(this.mousePosition.x, this.mousePosition.y);

		if(hitTestResult != null)
		{
			hitTestResult.handleEvent(new MoMouseButtonEvent(MoMouseEvent.MOUSE_DOWN, this.mouseButtonFromNativeButton(evt.button), true, this.mousePosition.x, this.mousePosition.y, 1, this.getModifierKeysFromEvent(evt)));
			
			this.mouseTarget = hitTestResult;
			this.focus(this.mouseTarget);
		}
	},

	handleMouseUp : function(evt) {
		this.updateMousePosition(evt.clientX, evt.clientY);
		
		var hitTestResult = this.getTarget().hitTest(this.mousePosition.x, this.mousePosition.y);

		if(this.mouseTarget != null)
		{
			if(this.mouseTarget == hitTestResult)
			{
				hitTestResult.handleEvent(new MoMouseButtonEvent(MoMouseEvent.MOUSE_UP, this.mouseButtonFromNativeButton(evt.button), false, this.mousePosition.x, this.mousePosition.y, 0, this.getModifierKeysFromEvent(evt)));
				hitTestResult.handleEvent(new MoMouseButtonEvent(MoMouseEvent.CLICK, this.mouseButtonFromNativeButton(evt.button), false, this.mousePosition.x, this.mousePosition.y, 1, this.getModifierKeysFromEvent(evt)));
			}
			else
			{
				
				this.mouseTarget.handleEvent(new MoMouseButtonEvent(MoMouseEvent.MOUSE_UP_OUTSIDE, this.mouseButtonFromNativeButton(evt.button), false, this.mousePosition.x, this.mousePosition.y, 0, this.getModifierKeysFromEvent(evt)));
			}
		}

		this.mouseTarget = null;
	},
	
	handleMouseOver : function(evt) {
		this.getTarget().handleEvent(new MoMouseEvent(MoMouseEvent.MOUSE_ENTER, this.mousePosition.x, this.mousePosition.y, this.mouseButtonFromNativeButton(evt.button), this.getModifierKeysFromEvent(evt)));
	},
	
	handleMouseOut : function(evt) {
		if(this.mouseOverTarget != null)
			this.mouseOverTarget.handleEvent(new MoMouseEvent(MoMouseEvent.MOUSE_LEAVE, this.mousePosition.x, this.mousePosition.y, this.mouseButtonFromNativeButton(evt.button), this.getModifierKeysFromEvent(evt)));
	
		// the mouse has left the canvas, fire off an event to the target scene
		// and reset all our current mouse info, since we no longer care about any
		// mouse events.
		this.getTarget().handleEvent(new MoMouseEvent(MoMouseEvent.MOUSE_LEAVE, this.mousePosition.x, this.mousePosition.y, this.mouseButtonFromNativeButton(evt.button), this.getModifierKeysFromEvent(evt)));
		
		this.hasMouse = false;
		this.mouseTarget = null;
		this.mouseOverTarget = null;
	},
	
	handleDoubleClick : function(evt) {
	
		var hitTestResult = this.getTarget().hitTest(this.mousePosition.x, this.mousePosition.y);

		if(hitTestResult != null)
			hitTestResult.handleEvent(new MoMouseButtonEvent(MoMouseEvent.DOUBLE_CLICK, this.mouseButtonFromNativeButton(evt.button), true, this.mousePosition.x, this.mousePosition.y, 2, this.getModifierKeysFromEvent(evt)));
	},

	handleMouseWheel : function(evt) {

		if(!this.hasMouse)
			return;

		var hitTestResult = this.getTarget().hitTest(this.mousePosition.x, this.mousePosition.y);
		
		if(hitTestResult != null)
		{
			// TODO : update the delta calculation when pixel scrolling is implemented

			var scrollDelta = (evt.wheelDelta ? evt.wheelDelta : evt.detail);

			if(scrollDelta > 100 || scrollDelta < -100)
				scrollDelta /= -150;
			
			var delta = scrollDelta;
			
			if(delta != 0)
				delta = Math.abs(delta) / delta;
			
			delta = Math.min((Math.abs(scrollDelta) / 100), 1) * delta;
			
			hitTestResult.handleEvent(new MoMouseWheelEvent(MoMouseEvent.MOUSE_WHEEL, delta, this.mousePosition.x, this.mousePosition.y, this.getModifierKeysFromEvent(evt)));
		}
	},
	
	handleKeyDown : function(evt) {
		var keyEvent = null;
		var isSameKey = false;
		var isRepeat = false;
			
		if(evt.type == "keydown")
		{
			isSameKey = (evt.keyCode == this.lastKeyDown);
			isRepeat = (isSameKey && ((evt.timeStamp - this.lastKeyDownTime) <= 50));
		}
			
		// it's possible that the focus target might not 
		// have focus anymore if the user toggled it off
		if(!MoIsNull(this.focusTarget) && this.focusTarget.getIsFocused())
		{
			// fire key down event
			if(evt.type == "keydown")
			{
				keyEvent = new MoKeyEvent(MoKeyEvent.KEY_DOWN, evt.keyCode, true, isRepeat, MoModifierKeys.fromValues(evt.altKey, evt.ctrlKey, evt.shiftKey, evt.metaKey), -1);

				this.focusTarget.handleEvent(keyEvent);
			}

			// fire key press event
			if(evt.type == "keypress")
			{
				isSameKey = (evt.charCode == this.lastKeyPress);
				isRepeat = (isSameKey && ((evt.timeStamp - this.lastKeyPressTime) <= 50));
				keyEvent = new MoKeyEvent(MoKeyEvent.KEY_PRESS, evt.keyCode, true, isRepeat, MoModifierKeys.fromValues(evt.altKey, evt.ctrlKey, evt.shiftKey, evt.metaKey));

				this.focusTarget.handleEvent(keyEvent);
			}
		}

		if(evt.type == "keydown")
		{
			this.lastKeyDown = evt.keyCode;
			this.lastKeyDownTime = evt.timeStamp;
			
			var key = MoKey.fromKeyCode(evt.keyCode);
			
			if((MoIsNull(keyEvent) || (!MoIsNull(keyEvent) && !keyEvent.getIsDefaultPrevented())) && this.isNavigationKey(key))
				this.processKeyboardNavigationEvent(key);

			// always send to application
			if(!MoApplication.getInstance().dispatchEvent(new MoKeyEvent(MoKeyEvent.KEY_DOWN, evt.keyCode, true, isRepeat, MoModifierKeys.fromValues(evt.altKey, evt.ctrlKey, evt.shiftKey, evt.metaKey), -1)))
			{
				evt.preventDefault();
				return;
			}
		}

		if(evt.type == "keypress")
		{
			this.lastKeyPress = evt.charCode;
			this.lastKeyPressTime = evt.timeStamp;
		}

		if(keyEvent != null && keyEvent.getIsDefaultPrevented())
			evt.preventDefault();
	},

	handleKeyUp : function(evt) {
		// it's possible that the focus target might not 
		// have focus anymore if the user toggled it off
		if(!MoIsNull(this.focusTarget) && this.focusTarget.getIsFocused())
			this.focusTarget.handleEvent(new MoKeyEvent(MoKeyEvent.KEY_UP, evt.keyCode, false, false, MoModifierKeys.fromValues(evt.altKey, evt.ctrlKey, evt.shiftKey, evt.metaKey), -1));
			
		// always send to application
		MoApplication.getInstance().dispatchEvent(new MoKeyEvent(MoKeyEvent.KEY_UP, evt.keyCode, false, false, MoModifierKeys.fromValues(evt.altKey, evt.ctrlKey, evt.shiftKey, evt.metaKey), -1));
	},

	handleGamepadButtonDown : function(e) {
		if(!MoIsNull(this.focusTarget) && this.focusTarget.getIsFocused())
		{
			var evt = new MoGamepadButtonEvent(MoGamepadButtonEvent.DOWN, e.getIndex(), e.getButton(), e.getIsDown(), e.getTimestamp(), true, true);
			
			this.focusTarget.handleEvent(evt);
			
			if(evt.getIsDefaultPrevented())
				return;
		}

		// check if the event came from the current input gamepad
		// and try to process and navigation
		if(e.getIndex() == MoGamepad.getInputIndex() && this.isNavigationButton(e.getButton()))
		{
			if(this.lastNavigationTime == 0 || (e.getTimestamp() - this.lastNavigationTime > 100))
			{
				this.lastNavigationTime = e.getTimestamp();
				this.lastNavigationButton = e.getButton();
				
				this.processGamepadNavigationEvent(e);
			}
		}
	},
	
	handleGamepadButtonUp : function(e) {
		if(this.focusTarget == null)
			return;

		// just pass the event directly through, however, in the future we may want/need
		// to change this to support repeating flags, timing, etc...
		if(this.focusTarget.getIsFocused())
			this.focusTarget.handleEvent(new MoGamepadButtonEvent(MoGamepadButtonEvent.UP, e.getIndex(), e.getButton(), e.getIsDown(), e.getTimestamp(), true));
	},

	processGamepadNavigationEvent : function(e) {
		switch(e.getButton())
		{
			case MoGamepadButtons.DPadUp:
			case MoGamepadButtons.LeftStickUp:
				this.processNavigationEvent(MoNavigationDirection.Up);
				break;
			case MoGamepadButtons.DPadDown:
			case MoGamepadButtons.LeftStickDown:
				this.processNavigationEvent(MoNavigationDirection.Down);
				break;
			case MoGamepadButtons.DPadLeft:
			case MoGamepadButtons.LeftStickLeft:
				this.processNavigationEvent(MoNavigationDirection.Left);
				break;
			case MoGamepadButtons.DPadRight:
			case MoGamepadButtons.LeftStickRight:
				this.processNavigationEvent(MoNavigationDirection.Right);
				break;
		}
	},

	processKeyboardNavigationEvent : function(key) {
		switch(key)
		{
			case MoKey.Up:
				this.processNavigationEvent(MoNavigationDirection.Up);
				break;
			case MoKey.Down:
				this.processNavigationEvent(MoNavigationDirection.Down);
				break;
			case MoKey.Left:
				this.processNavigationEvent(MoNavigationDirection.Left);
				break;
			case MoKey.Right:
				this.processNavigationEvent(MoNavigationDirection.Right);
				break;
		}
	},
	
	processNavigationEvent : function(direction) {
		var navEnterEvent = null;
		var navLeaveEvent = null;
		var currentFocusTarget = this.focusTarget;
		var currentNavigationZone = (MoIsNull(currentFocusTarget) ? null : currentFocusTarget.getNavigationZone());

		// try to find the first available navigation zone if the current 
		// focus target does not have one or if there is no focus target
		if(MoIsNull(currentFocusTarget) || MoIsNull(currentNavigationZone))
			currentNavigationZone = this.findFirstNavigationZone(this.target);

		// unable to find a suitable navigation zone to search in
		if(MoIsNull(currentNavigationZone))
			return;

		// we do not yet have a focus target to use as a search
		// reference, so try and find the first one available in
		// the navigation zone
		if(MoIsNull(currentFocusTarget))
		{
			currentFocusTarget = this.findFirstAvailableFocusTarget(currentNavigationZone);
			
			// still unable to find a focus target, so just focus on the navigation
			// zone and let it handle input events
			if(MoIsNull(currentFocusTarget))
				currentFocusTarget = currentNavigationZone;

			this.navigate(direction, this.focusTarget, currentFocusTarget);
			return;
		}

		// otherwise, try to move focus in the requested direction
		var navigationMode = currentFocusTarget.getNavigationMode();
		var navigationDirectionNormal = MoVector2D.Zero();
		
		switch(direction)
		{
			case MoNavigationDirection.Up:
				navigationDirectionNormal.y = -1;
				break;
			case MoNavigationDirection.Down:
				navigationDirectionNormal.y = 1;
				break;
			case MoNavigationDirection.Left:
				navigationDirectionNormal.x = -1;
				break;
			case MoNavigationDirection.Right:
				navigationDirectionNormal.x = 1;
				break;
		}

		// search for the next target that can take focus
		var searchResult = this.findNextFocusTarget(currentFocusTarget, currentNavigationZone, direction, navigationDirectionNormal, navigationMode);
		
		// if the search found a suitable target, then focus on it
		this.navigate(direction, this.focusTarget, searchResult.target);
	},

	navigate : function(direction, targetFrom, targetTo) {
		// send a leave event to the current target
		if(!MoIsNull(targetFrom))
		{
			var navLeaveEvent = new MoNavigationEvent(MoNavigationEvent.LEAVE, direction, targetFrom, targetTo, true, true);

			// allow the navigation to be cancelled
			if(!targetFrom.handleEvent(navLeaveEvent))
				return false;
		}

		if(!MoIsNull(targetTo))
		{
			// then an enter event to the new target
			var navEnterEvent = new MoNavigationEvent(MoNavigationEvent.ENTER, direction, targetFrom, targetTo, true, true);

			// also check if it was cancelled, this will still allow listeners
			// to focus or run other custom navigation rules without auto-focusing
			if(!targetTo.handleEvent(navEnterEvent))
				return false;

			targetTo.focus();
		}

		return true;
	},

	findNextFocusTarget : function(focusReference, searchTarget, navigationDirection, navigationDirectionNormal, navigationMode) {		
		var searchResult = new MoNavigationSearchResult();
		var referencePosition = this.getNavigationPositionForDirection(focusReference, navigationDirection);

		// run the search
		this.findNextFocusTargetImpl(focusReference, referencePosition, searchResult, searchTarget, navigationDirection, navigationDirectionNormal, navigationMode);

		// no target was found, the last step is to go to the navigation
		// zone above the current and see if there is a sibling that has
		// a suitable target to take focus, otherwise no change in focus
 		if(MoIsNull(searchResult.target))
		{		
			var nextSearchTarget = searchTarget.getNavigationZone(false);
			var nextNavigationZone = null;

			// unable to find any suitable target to focus on to
			if(MoIsNull(nextSearchTarget))
				return searchResult;

			// reset search result
			searchResult.distance = null;
			searchResult.target = null;

			// set our reference point to the navigation zone
			referencePosition = this.getNavigationPositionForDirection(searchTarget, navigationDirection);

			// search only the zone's first level children
			for(var i = 0, len = nextSearchTarget.getCount(); i < len; ++i)
			{
				var c = nextSearchTarget.getAt(i);
				
				// exclude the existing search target since we
				// have already exhausted all possiblities from it
				if(c == searchTarget)
					continue;
				
				// make sure there is a suitable focus target
				var firstAvailableTarget = this.findFirstAvailableFocusTarget(c);
				
				if(firstAvailableTarget == null)
					continue;
				
				// check if the zone is in the right direction
				var position = this.getNavigationPositionForDirection(c, this.getOppositeNavigationDirection(navigationDirection));
				var distance = position.distance(referencePosition);
				var direction = position.subtract(referencePosition);

				direction.normalize();

				if((MoIsNull(searchResult.distance) || distance < searchResult.distance) && ((direction.x * navigationDirectionNormal.x) > 0 || (direction.y * navigationDirectionNormal.y) > 0))
				{
					if (navigationMode == MoNavigationMode.Normal || (navigationMode == MoNavigationMode.Constrain && nextSearchTarget.getParent() == searchTarget.getParent()))
					{
						// found one... update our search result
						nextNavigationZone = c;
						
						searchResult.target = firstAvailableTarget;
						searchResult.distance = distance;
					}
				}
			}
		}
		
		return searchResult;
	},
	
	findNextFocusTargetImpl : function(focusReference, referencePosition, searchResult, searchTarget, navigationDirection, navigationDirectionNormal, navigationMode) {
		// only visible containers can be searched
		if(MoIsNull(searchTarget) || !searchTarget.getVisible())
			return;
	
		// must not be the current focused element, must be visible and must have navigation focus enabled
		// to be considered a target candidate
		if(searchTarget != focusReference && searchTarget.getIsNavigationFocusEnabled())
		{
			// check if the target is in the right direction
			var position = this.getNavigationPositionForDirection(searchTarget, this.getOppositeNavigationDirection(navigationDirection));
			var distance = position.distance(referencePosition);
			var direction = position.subtract(referencePosition);
			
			direction.normalize();

			if((MoIsNull(searchResult.distance) || distance < searchResult.distance) && ((direction.x * navigationDirectionNormal.x) > 0 || (direction.y * navigationDirectionNormal.y) > 0))
			{
				if (navigationMode == MoNavigationMode.Normal || (navigationMode == MoNavigationMode.Constrain && searchTarget.getParent() == focusReference.getParent()))
				{
					searchResult.target = searchTarget;
					searchResult.distance = distance;
				}
			}
		}

		// keep going until the entire tree has been searched
		for(var i = 0, len = searchTarget.getCount(); i < len; ++i)
			this.findNextFocusTargetImpl(focusReference, referencePosition, searchResult, searchTarget.getAt(i), navigationDirection, navigationDirectionNormal, navigationMode);
	},
	
	findFirstAvailableFocusTarget : function(searchTarget) {
		if(!MoIsNull(searchTarget) && searchTarget.getVisible() && searchTarget.getIsNavigationFocusEnabled())
			return searchTarget;

		for(var i = 0, len = searchTarget.getCount(); i < len; ++i)
		{
			var target = this.findFirstAvailableFocusTarget(searchTarget.getAt(i));

			if(!MoIsNull(target))
				return target;
		}

		return null;
	},

	findFirstNavigationZone : function(searchTarget) {
		if(!MoIsNull(searchTarget) && searchTarget.getVisible() && searchTarget.getIsNavigationZone())
			return searchTarget;

		for(var i = 0, len = searchTarget.getCount(); i < len; ++i)
		{
			var target = this.findFirstNavigationZone(searchTarget.getAt(i));

			if(!MoIsNull(target))
				return target;
		}

		return null;
	},
	
	getOppositeNavigationDirection : function(direction) {
		switch(direction)
		{
			case MoNavigationDirection.Up:
				return MoNavigationDirection.Down;
			case MoNavigationDirection.Down:
				return MoNavigationDirection.Up;
			case MoNavigationDirection.Left:
				return MoNavigationDirection.Right;
			case MoNavigationDirection.Right:
				return MoNavigationDirection.Left;
		}
	},
	
	getNavigationPositionForDirection : function(target, direction) {
		var width = target.getWidth();
		var height = target.getHeight();
		var position = target.pointToGlobal(MoVector2D.Zero());

		switch(direction)
		{
			case MoNavigationDirection.Down:
				position.y += (height * 0.5);
				break;
			case MoNavigationDirection.Right:
				position.x += (width * 0.5);
				break;
		}

		return position;
	},

	isNavigationButton : function(button) {
		return (button == MoGamepadButtons.DPadUp || 
				button == MoGamepadButtons.DPadDown || 
				button == MoGamepadButtons.DPadLeft ||
				button == MoGamepadButtons.DPadRight ||
				button == MoGamepadButtons.LeftStickUp ||
				button == MoGamepadButtons.LeftStickDown ||
				button == MoGamepadButtons.LeftStickLeft ||
				button == MoGamepadButtons.LeftStickRight);
	},

	isNavigationKey : function(key) {
		return (key == MoKey.Down ||
				key == MoKey.Up ||
				key == MoKey.Left ||
				key == MoKey.Right);
	},

	handleTouchStart : function(evt) {
		var touches = evt.changedTouches;
		var touch = null;
		var len = touches.length;
		var targets = [];
		
		// determine which drawables have been touched
		for(var i = 0; i < len; ++i)
		{
			touch = touches[i];

			// update the touch position to local scene coordinates
			this.updateTouchPosition(touch.clientX, touch.clientY);
			
			// the touch exists within our scene
			if(this.hasTouch)
			{
				// determine which drawable has been hit
				var hitTestResult = this.getTarget().hitTest(this.touchPosition.x, this.touchPosition.y);
				
				if(hitTestResult != null)
				{
					// we'll need to store this target so we can track
					// it later during move/end events
					if(!this.touchTargets.contains(hitTestResult))
						this.touchTargets.push(hitTestResult);

					// add the touch id
					hitTestResult.touches.push(touch.identifier);
					
					// add the touch info to our targets
					this.addTouchPointToTarget(targets, hitTestResult, new MoTouchPoint(touch.identifier, this.touchPosition.x, this.touchPosition.y));
				}
			}
		}
		
		var cancelEvent = !MoApplication.getInstance().getEnableNativeGestures();
		
		// now we can send an event to each of the
		// target drawables found
		len = targets.length;
		
		for(var i = 0; i < len; ++i)
		{
			var target = targets[i];
			
			if(!target.drawable.handleEvent(new MoTouchEvent(MoTouchEvent.TOUCH_START, target.points, evt.scale, evt.rotation)))
				cancelEvent = true;
		}

		// stop the device from processing the native touch event
		if(cancelEvent)
			evt.preventDefault();
	},
	
	handleTouchEnd : function(evt) {
		var touches = evt.changedTouches;
		var touch = null;
		var len = touches.length;
		var targets = [];
		
		// determine which drawables have been touched
		for(var i = 0; i < len; ++i)
		{
			touch = touches[i];
			
			// update the touch position to local scene coordinates
			this.updateTouchPosition(touch.clientX, touch.clientY);
			
			// see if we have a target for the given identifier, otherwise
			// we don't have anything to do, this would most likely never
			// occur but just in case
			var target = this.findTouchTarget(touch.identifier, true);
			
			if(target == null)
				continue;
			
			// add the touch info to our target list
			this.addTouchPointToTarget(targets, target, new MoTouchPoint(touch.identifier, this.touchPosition.x, this.touchPosition.y));
		}
		
		var cancelEvent = !MoApplication.getInstance().getEnableNativeGestures();
		
		// now we can send an event to each of the
		// target drawables found
		len = targets.length;
		
		for(var i = 0; i < len; ++i)
		{
			var target = targets[i];
			
			// if the drawable doesn't contain anymore touches
			// then we must remove it from the global target list
			if(target.drawable.touches.length == 0)
				this.touchTargets.remove(target.drawable);

			if(!target.drawable.handleEvent(new MoTouchEvent(MoTouchEvent.TOUCH_END, target.points, evt.scale, evt.rotation)))
				cancelEvent = true;
		}
		
		// stop the device from processing the native touch event
		if(cancelEvent)
			evt.preventDefault();
	},
	
	handleTouchMove : function(evt) {
		var touches = evt.changedTouches;
		var touch = null;
		var len = touches.length;
		var targets = [];
		
		// determine which drawables have been touched
		for(var i = 0; i < len; ++i)
		{
			touch = touches[i];

			// update the touch position to local scene coordinates
			this.updateTouchPosition(touch.clientX, touch.clientY);
			
			// see if we have a target for the given identifier, otherwise
			// we don't have anything to do, this would most likely never
			// occur but just in case
			var target = this.findTouchTarget(touch.identifier, false);
			
			if(target == null)
				continue;
			
			// add the touch info to our target list
			this.addTouchPointToTarget(targets, target, new MoTouchPoint(touch.identifier, this.touchPosition.x, this.touchPosition.y));
		}
		
		var cancelEvent = !MoApplication.getInstance().getEnableNativeGestures();
		
		// now we can send an event to each of the
		// target drawables found
		len = targets.length;
		
		for(var i = 0; i < len; ++i)
		{
			var target = targets[i];

			if(!target.drawable.handleEvent(new MoTouchEvent(MoTouchEvent.TOUCH_MOVE, target.points, evt.scale, evt.rotation)))
				cancelEvent = true;
		}
		
		// stop the device from processing the native touch event
		if(cancelEvent)
			evt.preventDefault();
	},
	
	handleTouchCancel : function(evt) {
		var touches = evt.changedTouches;
		var touch = null;
		var len = touches.length;
		var targets = [];
		
		// determine which drawables have been touched
		for(var i = 0; i < len; ++i)
		{
			touch = touches[i];

			// update the touch position to local scene coordinates
			this.updateTouchPosition(touch.clientX, touch.clientY);
			
			// see if we have a target for the given identifier, otherwise
			// we don't have anything to do, this would most likely never
			// occur but just in case
			var target = this.findTouchTarget(touch.identifier, true);
			
			if(target == null)
				continue;
			
			// add the touch info to our target list
			this.addTouchPointToTarget(targets, target, new MoTouchPoint(touch.identifier, this.touchPosition.x, this.touchPosition.y));
		}
		
		var cancelEvent = !MoApplication.getInstance().getEnableNativeGestures();
		
		// now we can send an event to each of the
		// target drawables found
		len = targets.length;
		
		for(var i = 0; i < len; ++i)
		{
			var target = targets[i];
			
			// if the drawable doesn't contain anymore touches
			// then we must remove it from the global target list
			if(target.drawable.touches.length == 0)
				this.touchTargets.remove(target.drawable);

			if(!target.drawable.handleEvent(new MoTouchEvent(MoTouchEvent.TOUCH_CANCEL, target.points, evt.scale, evt.rotation)))
				cancelEvent = true;
		}
		
		// stop the device from processing the native touch event
		if(cancelEvent)
			evt.preventDefault();
	},
	
	handleGestureStart : function(evt) {
		var cancelEvent = !MoApplication.getInstance().getEnableNativeGestures();
		
		if(!this.getTarget().handleEvent(new MoGestureEvent(MoGestureEvent.GESTURE_START, evt.rotation, evt.scale)))
			cancelEvent = true;
		
		if(cancelEvent)
			evt.preventDefault();
	},
	
	handleGestureChange : function(evt) {
		var cancelEvent = !MoApplication.getInstance().getEnableNativeGestures();
		
		if(!this.getTarget().handleEvent(new MoGestureEvent(MoGestureEvent.GESTURE_CHANGE, evt.rotation, evt.scale)))
			cancelEvent = true;
		
		if(cancelEvent)
			evt.preventDefault();
	},
	
	handleGestureEnd : function(evt) {
		var cancelEvent = !MoApplication.getInstance().getEnableNativeGestures();
		
		if(!this.getTarget().handleEvent(new MoGestureEvent(MoGestureEvent.GESTURE_END, evt.rotation, evt.scale)))
			cancelEvent = true;
		
		if(cancelEvent)
			evt.preventDefault();
	},
	
	addTouchPointToTarget : function(targets, drawable, point) {
		var len = targets.length;
		
		for(var i = 0; i < len; ++i)
		{
			var touchTarget = targets[i];
			
			if(touchTarget.drawable == drawable)
			{
				touchTarget.points.push(point);
				return;
			}
		}
		
		var touchTarget = new MoTouchTarget(drawable);
		touchTarget.points.push(point);
		targets.push(touchTarget);
	},
	
	findTouchTarget : function(id, doRemove) {
		var len = this.touchTargets.length;
		var target = null;
		
		for(var i = 0; i < len; ++i)
		{
			target = this.touchTargets[i];
			
			for(var j = 0; j < target.touches.length; ++j)
			{
				if(target.touches[j] == id)
				{
					if(doRemove)
						target.touches.removeAt(j);
					
					return target;
				}
			}
		}
		
		return null;
	}
});

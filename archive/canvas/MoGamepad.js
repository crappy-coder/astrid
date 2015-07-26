MoGamepad = Class.create(MoEventDispatcher, {
	initialize : function($super) {
		$super();

		this.connected = [false,false,false,false];
		this.timestamps = [0,0,0,0];
		this.states = [null, null, null, null];
		this.prevStates = [null, null, null, null];
		this.deadZoneSizes = [MoGamepadDeadZoneSize.Trigger, MoGamepadDeadZoneSize.LeftStick, MoGamepadDeadZoneSize.RightStick];
		this.deadZoneModes = [MoGamepadDeadZoneMode.Normal,  MoGamepadDeadZoneMode.Normal,    MoGamepadDeadZoneMode.Normal];
		this.mapping = MoGamepadButtonMap.XBOX360;
		this.eventTimer = null;
		this.eventTicks = [0,0,0,0];
		this.buttonEventCache = null;
		this.inputIndex = 0;
		
		if(MoIsFirefox())
		{
			navigator.mozGamepads = [];
			
			window.addEventListener("MozGamepadConnected", this.onMozGamepadConnected);
			window.addEventListener("MozGamepadDisconnected", this.onMozGamepadDisconnected);
		}
		
		// setup a timer to check the connection status
		// for each controller, this will allow us to 
		// dispatch connected/disconnected events properly
		var me = this;
		
		setInterval(function() {
			me.validateConnectionStatus();
		}, 500);
	},
	
	onMozGamepadConnected : function(e) {
		navigator.mozGamepads[e.gamepad.index] = e.gamepad;
	},
	
	onMozGamepadDisconnected : function(e) {
		navigator.mozGamepads[e.gamepad.index] = undefined;
	},

	getIsConnected : function(index) {
		if(index < 1 || index > 4)
			throw new Error("Index must be between 1 and 4.");

		return this.connected[index-1];
	},
	
	getLastState : function(index) {
		if(index < 1 || index > 4)
			throw new Error("Index must be between 1 and 4.");	
			
		if(!this.connected[index-1])
			return null;

		return this.prevStates[index-1];
	},

	getState : function(index) {	
		if(index < 1 || index > 4)
			throw new Error("Index must be between 1 and 4.");

		if(!this.connected[index-1])
			return null;

		var idx = index-1;
		var gp = MoGamepads()[idx];
		var ts = this.timestamps[idx];
		var lastState = this.prevStates[idx];
		var state = null;

		// no new input has been read since the last time
		if(ts != 0 && (gp.timestamp - ts) == 0)
		{
			// make sure to update the last state, otherwise if a button
			// was pressed then released it will always seem that way when
			// in actual, it's a no change
			if(!MoIsNull(lastState))
				lastState.copyFrom(this.states[idx]);

			return this.states[idx];
		}

		// update the timestamp
		this.timestamps[idx] = gp.timestamp;

		// state has never been read for this gamepad, so
		// create a new state to hold our values
		if(MoIsNull(this.states[idx]))
			this.states[idx] = new MoGamepadState();
		
		// get the current state and the previous state
		state = this.states[idx];

		// since the previous state is not null, we can simply
		// copy the values over from the current state and
		// avoid a new allocation
		if(lastState != null)
			lastState.copyFrom(state);

		// again, instead of allocating a new state object
		// we just update the one we already have
		var buttonValues = this.getButtonValues(gp);
		var stickValues = this.getStickValues(gp);
		var triggerValues = this.getTriggerValues(gp);

		state.update(gp.id, gp.index, gp.timestamp, true, buttonValues, stickValues[0], stickValues[1], triggerValues[0], triggerValues[1]);
		
		// finally, if the previous state was indeed null,
		// then just clone the current state object even if
		// this is the first time through, this will make
		// any delta comparisons zero
		if(lastState == null)
			this.prevStates[idx] = state.copy();
			
		return state;
	},
	
	getButtonValues : function(gp) {
		var buttons = MoGamepadButtons.None;
		
		for(var i = 0, len = gp.buttons.length; i < len; ++i)
			buttons |= this.getFlagForButton(gp, i, this.mapping.get(i));

		return buttons;
	},

	getStickValues : function(gp) {
		return [new MoVector2D(gp.axes[0], gp.axes[1]),
				new MoVector2D(gp.axes[2], gp.axes[3])];
	},

	getTriggerValues : function(gp) {
		return [gp.buttons[6], gp.buttons[7]];
	},

	getFlagForButton : function(gp, idx, button) {
		return (gp.buttons[idx] == 0 ? 0 : button);
	},
	
	enableEvents : function() {
		if(!MoIsNull(this.eventTimer))
			return;
		
		this.eventTimer = new MoTimer(1000 / MoApplication.getInstance().getFrameRate());
		this.eventTimer.addEventHandler(MoTimerEvent.TICK, this.onEventTimerTick.d(this));
		this.eventTimer.start();
	},

	disableEvents : function() {
		if(MoIsNull(this.eventTimer))
			return;

		this.eventTimer.stop();
		this.eventTimer = null;
		this.eventTicks = [0,0,0,0];
	},

	onEventTimerTick : function(e) {
		var lastFrameTick = 0;
		var lastState = null;
		var state = null;
		var tickNow = MoGetTimer();
		var includeDownEvents = false;

		for(var i = 1; i <= 4; ++i)
		{
			lastState = this.getLastState(i);
			state = this.getState(i);

			// gamepad disconnected
			if(state == null)
				continue;

			// determine whether a sufficient amount of time has passed to dispatch repeated down events
			// or to skip them and allow some catch up, otherwise, if a user presses a button then a down
			// event could be sent numerous times before an up event, however, we want to try and simulate
			// a true button press/release, then if the user holds it can be considered a repeating down
			// event.
			//
			// FIXME : should probably rethink this after a bit more testing, because the event API is
			//         meant for general navigation and not for high-frequency input processing as games
			//         usually need, we can probably just lock the event timer down to a fixed rate
			//         instead of clocking off the main frame rate.
			//
			lastFrameTick = this.eventTicks[i-1];
			includeDownEvents = (lastFrameTick == 0 || (tickNow - lastFrameTick) >= 150);

			// process any events
			if(this.processStateEvents(i, lastState, state, includeDownEvents))
				this.eventTicks[i-1] = tickNow;
		}
	},

	processStateEvents : function(index, lastState, state, includeDownEvents) {
		var downEventProcessed = false;
		
		for(var b in MoGamepadButtons)
		{
			// skip any built in properties or the None value
			if(!MoGamepadButtons.hasOwnProperty(b) || b == "None")
				continue;

			var buttonFlag = MoGamepadButtons[b];

			// dispatch down event
			if(includeDownEvents && state.isDown(buttonFlag))
			{
				downEventProcessed = true;
				this.dispatchEvent(this.createButtonEvent(MoGamepadButtonEvent.DOWN, index, buttonFlag, true, MoGetTimer()));
			}

			// unable to check for up events without a 
			// previous state
			if(lastState == null)
				continue;

			// dispatch up event
			if(lastState.isDown(buttonFlag) && !state.isDown(buttonFlag))
				this.dispatchEvent(this.createButtonEvent(MoGamepadButtonEvent.UP, index, buttonFlag, true, MoGetTimer()));
		}
		
		return downEventProcessed;
	},
	
	createButtonEvent : function(type, index, button, isDown, timestamp) {
		if(this.buttonEventCache == null)
			this.buttonEventCache = new MoGamepadButtonEvent(type, index, button, isDown, timestamp);
		else
		{
			this.buttonEventCache.reuse();
			this.buttonEventCache.type = type;
			this.buttonEventCache.index = index;
			this.buttonEventCache.button = button;
			this.buttonEventCache.isDown = isDown;
			this.buttonEventCache.timestamp = timestamp;
		}

		return this.buttonEventCache;
	},

	validateConnectionStatus : function() {
		for(var i = 0; i < 4; ++i)
		{
			var oldValue = this.connected[i];
			var newValue = !MoIsNull(MoGamepads()[i]);
			
			if(oldValue != newValue)
			{
				this.connected[i] = newValue;
				this.dispatchEvent(new MoGamepadEvent((newValue ? MoGamepadEvent.CONNECTED : MoGamepadEvent.DISCONNECTED), (i+1)));
			}
		}
	}
});

Object.extend(MoGamepad, {
	Instance : null,

	getInstance : function() {
		if(MoGamepad.Instance == null)
			MoGamepad.Instance = new MoGamepad();
			
		return MoGamepad.Instance;
	},
	
	getState : function(index) {
		return MoGamepad.getInstance().getState(index);
	},
	
	getIsAvailable : function() {
		return !MoIsNull(MoGamepads());
	},
	
	getInputIndex : function() {
		return MoGamepad.getInstance().inputIndex;
	},

	setInputIndex : function(value) {
		MoGamepad.getInstance().inputIndex = value;
	},
	
	setEnableEvents : function(value) {
		MoGamepad.getInstance()[value ? "enableEvents" : "disableEvents"]();
	},
	
	getTriggerDeadZoneMode : function() {
		return MoGamepad.getInstance().deadZoneModes[0];
	},
	
	setTriggerDeadZoneMode : function(value) {
		MoGamepad.getInstance().deadZoneModes[0] = value;
	},
	
	getTriggerDeadZoneSize : function() {
		return MoGamepad.getInstance().deadZoneSizes[0];
	},
	
	setTriggerDeadZoneSize : function(value) {
		MoGamepad.getInstance().deadZoneSizes[0] = value;
	},
	
	getLeftStickDeadZoneMode : function() {
		return MoGamepad.getInstance().deadZoneModes[1];
	},
	
	setLeftStickDeadZoneMode : function(value) {
		MoGamepad.getInstance().deadZoneModes[1] = value;
	},
	
	getLeftStickDeadZoneSize : function() {
		return MoGamepad.getInstance().deadZoneSizes[1];
	},
	
	setLeftStickDeadZoneSize : function(value) {
		MoGamepad.getInstance().deadZoneSizes[1] = value;
	},
	
	getRightStickDeadZoneMode : function() {
		return MoGamepad.getInstance().deadZoneModes[2];
	},
	
	setRightStickDeadZoneMode : function(value) {
		MoGamepad.getInstance().deadZoneModes[2] = value;
	},
	
	getRightStickDeadZoneSize : function() {
		return MoGamepad.getInstance().deadZoneSizes[2];
	},
	
	setRightStickDeadZoneSize : function(value) {
		MoGamepad.getInstance().deadZoneSizes[2] = value;
	}
});
import EventDispatcher from "./../EventDispatcher";
import { IsFirefox, Gamepads, GetTimer } from "./../Engine";
import GamepadDeadZoneMode from "./GamepadDeadZoneMode";
import GamepadDeadZoneSize from "./GamepadDeadZoneSize";
import GamepadButtonMap from "./GamepadButtonMap";
import GamepadState from "./GamepadState";
import GamepadButtons from "./GamepadButtons";
import Vector2D from "./../Vector2D";
import Application from "./../Application.js";
import Timer from "./../Timer";
import TimerEvent from "./../TimerEvent";
import GamepadButtonEvent from "./GamepadButtonEvent";
import GamepadEvent from "./GamepadEvent";


class Gamepad extends EventDispatcher {
	constructor() {
		super();

		this.connected = [false, false, false, false];
		this.timestamps = [0, 0, 0, 0];
		this.states = [null, null, null, null];
		this.prevStates = [null, null, null, null];
		this.deadZoneSizes = [GamepadDeadZoneSize.Trigger, GamepadDeadZoneSize.LeftStick,
													GamepadDeadZoneSize.RightStick];
		this.deadZoneModes = [GamepadDeadZoneMode.Normal, GamepadDeadZoneMode.Normal, GamepadDeadZoneMode.Normal];
		this.mapping = GamepadButtonMap.XBOX360;
		this.eventTimer = null;
		this.eventTicks = [0, 0, 0, 0];
		this.buttonEventCache = null;
		this.inputIndex = 0;

		if (IsFirefox()) {
			navigator.mozGamepads = [];

			window.addEventListener("MozGamepadConnected", this.onMozGamepadConnected);
			window.addEventListener("MozGamepadDisconnected", this.onMozGamepadDisconnected);
		}

		// setup a timer to check the connection status
		// for each controller, this will allow us to 
		// dispatch connected/disconnected events properly
		var me = this;

		setInterval(function () {
			me.validateConnectionStatus();
		}, 500);
	}

	onMozGamepadConnected(e) {
		navigator.mozGamepads[e.gamepad.index] = e.gamepad;
	}

	onMozGamepadDisconnected(e) {
		navigator.mozGamepads[e.gamepad.index] = undefined;
	}

	getIsConnected(index) {
		if (index < 1 || index > 4) {
			throw new Error("Index must be between 1 and 4.");
		}

		return this.connected[index - 1];
	}

	getLastState(index) {
		if (index < 1 || index > 4) {
			throw new Error("Index must be between 1 and 4.");
		}

		if (!this.connected[index - 1]) {
			return null;
		}

		return this.prevStates[index - 1];
	}

	getState(index) {
		if (index < 1 || index > 4) {
			throw new Error("Index must be between 1 and 4.");
		}

		if (!this.connected[index - 1]) {
			return null;
		}

		var idx = index - 1;
		var gp = Gamepads()[idx];
		var ts = this.timestamps[idx];
		var lastState = this.prevStates[idx];
		var state = null;

		// no new input has been read since the last time
		if (ts != 0 && (gp.timestamp - ts) == 0) {
			// make sure to update the last state, otherwise if a button
			// was pressed then released it will always seem that way when
			// in actual, it's a no change
			if (lastState != null) {
				lastState.copyFrom(this.states[idx]);
			}

			return this.states[idx];
		}

		// update the timestamp
		this.timestamps[idx] = gp.timestamp;

		// state has never been read for this gamepad, so
		// create a new state to hold our values
		if (this.states[idx] == null) {
			this.states[idx] = new GamepadState();
		}

		// get the current state and the previous state
		state = this.states[idx];

		// since the previous state is not null, we can simply
		// copy the values over from the current state and
		// avoid a new allocation
		if (lastState != null) {
			lastState.copyFrom(state);
		}

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
		if (lastState == null) {
			this.prevStates[idx] = state.copy();
		}

		return state;
	}

	getButtonValues(gp) {
		var buttons = GamepadButtons.None;

		for (var i = 0, len = gp.buttons.length; i < len; ++i) {
			buttons |= this.getFlagForButton(gp, i, this.mapping.get(i));
		}

		return buttons;
	}

	getStickValues(gp) {
		return [new Vector2D(gp.axes[0], gp.axes[1]),
						new Vector2D(gp.axes[2], gp.axes[3])];
	}

	getTriggerValues(gp) {
		return [gp.buttons[6], gp.buttons[7]];
	}

	getFlagForButton(gp, idx, button) {
		return (gp.buttons[idx] == 0 ? 0 : button);
	}

	enableEvents() {
		if (this.eventTimer != null) {
			return;
		}

		this.eventTimer = new Timer(1000 / Application.getInstance().getFrameRate());
		this.eventTimer.addEventHandler(TimerEvent.TICK, this.onEventTimerTick.d(this));
		this.eventTimer.start();
	}

	disableEvents() {
		if (this.eventTimer == null) {
			return;
		}

		this.eventTimer.stop();
		this.eventTimer = null;
		this.eventTicks = [0, 0, 0, 0];
	}

	onEventTimerTick(e) {
		var lastFrameTick = 0;
		var lastState = null;
		var state = null;
		var tickNow = GetTimer();
		var includeDownEvents = false;

		for (var i = 1; i <= 4; ++i) {
			lastState = this.getLastState(i);
			state = this.getState(i);

			// gamepad disconnected
			if (state == null) {
				continue;
			}

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
			lastFrameTick = this.eventTicks[i - 1];
			includeDownEvents = (lastFrameTick == 0 || (tickNow - lastFrameTick) >= 150);

			// process any events
			if (this.processStateEvents(i, lastState, state, includeDownEvents)) {
				this.eventTicks[i - 1] = tickNow;
			}
		}
	}

	processStateEvents(index, lastState, state, includeDownEvents) {
		var downEventProcessed = false;

		for (var b in GamepadButtons) {
			// skip any built in properties or the None value
			if (!GamepadButtons.hasOwnProperty(b) || b == "None") {
				continue;
			}

			var buttonFlag = GamepadButtons[b];

			// dispatch down event
			if (includeDownEvents && state.isDown(buttonFlag)) {
				downEventProcessed = true;
				this.dispatchEvent(this.createButtonEvent(GamepadButtonEvent.DOWN, index, buttonFlag, true, GetTimer()));
			}

			// unable to check for up events without a 
			// previous state
			if (lastState == null) {
				continue;
			}

			// dispatch up event
			if (lastState.isDown(buttonFlag) && !state.isDown(buttonFlag)) {
				this.dispatchEvent(this.createButtonEvent(GamepadButtonEvent.UP, index, buttonFlag, true, GetTimer()));
			}
		}

		return downEventProcessed;
	}

	createButtonEvent(type, index, button, isDown, timestamp) {
		if (this.buttonEventCache == null) {
			this.buttonEventCache = new GamepadButtonEvent(type, index, button, isDown, timestamp);
		} else {
			this.buttonEventCache.reuse();
			this.buttonEventCache.type = type;
			this.buttonEventCache.index = index;
			this.buttonEventCache.button = button;
			this.buttonEventCache.isDown = isDown;
			this.buttonEventCache.timestamp = timestamp;
		}

		return this.buttonEventCache;
	}

	validateConnectionStatus() {
		for (var i = 0; i < 4; ++i) {
			var oldValue = this.connected[i];
			var newValue = (Gamepads()[i] != null);

			if (oldValue != newValue) {
				this.connected[i] = newValue;
				this.dispatchEvent(new GamepadEvent((newValue ? GamepadEvent.CONNECTED : GamepadEvent.DISCONNECTED), (i +
				1)));
			}
		}
	}

	static getInstance() {
		if (Gamepad.Instance == null) {
			Gamepad.Instance = new Gamepad();
		}

		return Gamepad.Instance;
	}

	static getState(index) {
		return Gamepad.getInstance().getState(index);
	}

	static getIsAvailable() {
		return (Gamepads() != null);
	}

	static getInputIndex() {
		return Gamepad.getInstance().inputIndex;
	}

	static setInputIndex(value) {
		Gamepad.getInstance().inputIndex = value;
	}

	static setEnableEvents(value) {
		Gamepad.getInstance()[value ? "enableEvents" : "disableEvents"]();
	}

	static getTriggerDeadZoneMode() {
		return Gamepad.getInstance().deadZoneModes[0];
	}

	static setTriggerDeadZoneMode(value) {
		Gamepad.getInstance().deadZoneModes[0] = value;
	}

	static getTriggerDeadZoneSize() {
		return Gamepad.getInstance().deadZoneSizes[0];
	}

	static setTriggerDeadZoneSize(value) {
		Gamepad.getInstance().deadZoneSizes[0] = value;
	}

	static getLeftStickDeadZoneMode() {
		return Gamepad.getInstance().deadZoneModes[1];
	}

	static setLeftStickDeadZoneMode(value) {
		Gamepad.getInstance().deadZoneModes[1] = value;
	}

	static getLeftStickDeadZoneSize() {
		return Gamepad.getInstance().deadZoneSizes[1];
	}

	static setLeftStickDeadZoneSize(value) {
		Gamepad.getInstance().deadZoneSizes[1] = value;
	}

	static getRightStickDeadZoneMode() {
		return Gamepad.getInstance().deadZoneModes[2];
	}

	static setRightStickDeadZoneMode(value) {
		Gamepad.getInstance().deadZoneModes[2] = value;
	}

	static getRightStickDeadZoneSize() {
		return Gamepad.getInstance().deadZoneSizes[2];
	}

	static setRightStickDeadZoneSize(value) {
		Gamepad.getInstance().deadZoneSizes[2] = value;
	}
}

export default Gamepad;

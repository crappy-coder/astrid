import Equatable from "./../Equatable";
import GamepadButtons from "./GamepadButtons";
import Gamepad from "./Gamepad";
import GamepadDeadZoneMode from "./GamepadDeadZoneMode";
import Vector2D from "./../Vector2D";
import EngineMath from "./../EngineMath";
import { ValueOrDefault } from "./../Engine";

class GamepadState extends Equatable {
	constructor() {
		super();

		// just initialize our class members here and let the update method 
		// actually set their values so we can avoid duplicating the code and
		// making state swaps more efficient
		this.name = null;
		this.index = null;
		this.timestamp = null;
		this.isConnected = null;
		this.buttons = null;
		this.leftTrigger = null;
		this.leftTriggerRaw = null;
		this.rightTrigger = null;
		this.rightTriggerRaw = null;
		this.leftStickValue = null;
		this.leftStickValueRaw = null;
		this.rightStickValue = null;
		this.rightStickValueRaw = null;
	}

	getName() {
		return this.name;
	}

	getIndex() {
		return this.index;
	}

	getIsConnected() {
		return this.isConnected;
	}

	getTimestamp() {
		return this.timestamp;
	}

	getA() {
		return this.hasFlag(this.buttons, GamepadButtons.A);
	}

	getB() {
		return this.hasFlag(this.buttons, GamepadButtons.B);
	}

	getX() {
		return this.hasFlag(this.buttons, GamepadButtons.X);
	}

	getY() {
		return this.hasFlag(this.buttons, GamepadButtons.Y);
	}

	getBack() {
		return this.hasFlag(this.buttons, GamepadButtons.Back);
	}

	getStart() {
		return this.hasFlag(this.buttons, GamepadButtons.Start);
	}

	getBig() {
		return this.hasFlag(this.buttons, GamepadButtons.Big);
	}

	getLeftShoulder() {
		return this.hasFlag(this.buttons, GamepadButtons.LeftShoulder);
	}

	getRightShoulder() {
		return this.hasFlag(this.buttons, GamepadButtons.RightShoulder);
	}

	getLeftTrigger() {
		return (this.getLeftTriggerValue() > 0);
	}

	getLeftTriggerValue(raw) {
		if (raw) {
			return this.leftTriggerRaw;
		}

		return this.leftTrigger;
	}

	getRightTrigger() {
		return (this.getRightTriggerValue() > 0);
	}

	getRightTriggerValue(raw) {
		if (raw) {
			return this.rightTriggerRaw;
		}

		return this.rightTrigger;
	}

	getLeftStick() {
		return this.hasFlag(this.buttons, GamepadButtons.LeftStick);
	}

	getLeftStickValue(raw) {
		if (raw) {
			return this.leftStickValueRaw;
		}

		return this.leftStickValue;
	}

	getRightStick() {
		return this.hasFlag(this.buttons, GamepadButtons.RightStick);
	}

	getRightStickValue(raw) {
		if (raw) {
			return this.rightStickValueRaw;
		}

		return this.rightStickValue;
	}

	getDPadUp() {
		return this.hasFlag(this.buttons, GamepadButtons.DPadUp);
	}

	getDPadDown() {
		return this.hasFlag(this.buttons, GamepadButtons.DPadDown);
	}

	getDPadLeft() {
		return this.hasFlag(this.buttons, GamepadButtons.DPadLeft);
	}

	getDPadRight() {
		return this.hasFlag(this.buttons, GamepadButtons.DPadRight);
	}

	getLeftStickUp() {
		return (this.leftStickValue.y < 0);
	}

	getLeftStickDown() {
		return (this.leftStickValue.y > 0);
	}

	getLeftStickLeft() {
		return (this.leftStickValue.x < 0);
	}

	getLeftStickRight() {
		return (this.leftStickValue.x > 0);
	}

	getRightStickUp() {
		return (this.rightStickValue.y < 0);
	}

	getRightStickDown() {
		return (this.rightStickValue.y > 0);
	}

	getRightStickLeft() {
		return (this.rightStickValue.x < 0);
	}

	getRightStickRight() {
		return (this.rightStickValue.x > 0);
	}

	isDown(button) {
		var state = this.buttons;

		if (this.getLeftStickUp()) {
			state |= GamepadButtons.LeftStickUp;
		}
		if (this.getLeftStickDown()) {
			state |= GamepadButtons.LeftStickDown;
		}
		if (this.getLeftStickLeft()) {
			state |= GamepadButtons.LeftStickLeft;
		}
		if (this.getLeftStickRight()) {
			state |= GamepadButtons.LeftStickRight;
		}

		if (this.getRightStickUp()) {
			state |= GamepadButtons.RightStickUp;
		}
		if (this.getRightStickDown()) {
			state |= GamepadButtons.RightStickDown;
		}
		if (this.getRightStickLeft()) {
			state |= GamepadButtons.RightStickLeft;
		}
		if (this.getRightStickRight()) {
			state |= GamepadButtons.RightStickRight;
		}

		if (this.getLeftTrigger()) {
			state |= GamepadButtons.LeftTrigger;
		}
		if (this.getRightTrigger()) {
			state |= GamepadButtons.RightTrigger;
		}

		return this.hasFlag(state, button);
	}

	isUp(button) {
		return !this.isDown(button);
	}

	hasFlag(flags, flag) {
		return ((flags & flag) == flag);
	}

	filterLeftStickValue(x, y) {
		return this.filterStickValue(x, y, Gamepad.getLeftStickDeadZoneMode(), Gamepad.getLeftStickDeadZoneSize());
	}

	filterRightStickValue(x, y) {
		return this.filterStickValue(x, y, Gamepad.getRightStickDeadZoneMode(), Gamepad.getRightStickDeadZoneSize());
	}

	filterStickValue(x, y, deadZoneMode, deadZoneSize) {
		if (deadZoneMode == GamepadDeadZoneMode.Circular) {
			var magnitude = Math.sqrt(x * x + y * y);
			var value = this.filterValue(magnitude, deadZoneSize);
			var normalized = (value > 0 ? value / magnitude : 0);

			return new Vector2D(
				EngineMath.clamp(x * normalized, -1.0, 1.0),
				EngineMath.clamp(y * normalized, -1.0, 1.0));
		}

		if (deadZoneMode == GamepadDeadZoneMode.None) {
			deadZoneSize = 0;
		}

		return new Vector2D(
			this.filterValue(x, deadZoneSize),
			this.filterValue(y, deadZoneSize));
	}

	filterTriggerValue(value) {
		if (Gamepad.getTriggerDeadZoneMode() != GamepadDeadZoneMode.None) {
			return this.filterValue(value, Gamepad.getTriggerDeadZoneSize());
		}

		return this.filterValue(value, 0);
	}

	filterValue(value, size) {
		if (value < -size) {
			value += size;
		} else {
			if (value <= size) {
				return 0;
			}

			value -= size;
		}

		return EngineMath.clamp(value / (1.0 - size), -1.0, 1.0);
	}

	update(name, index, timestamp, isConnected, buttons, leftStickValue, rightStickValue, leftTrigger, rightTrigger) {
		this.name = ValueOrDefault(name, "");
		this.index = index;
		this.timestamp = timestamp;
		this.isConnected = isConnected;
		this.buttons = buttons;

		this.leftTrigger = EngineMath.clamp(this.filterTriggerValue(leftTrigger), 0, 1);
		this.leftTriggerRaw = EngineMath.clamp(leftTrigger, 0, 1);
		this.rightTrigger = EngineMath.clamp(this.filterTriggerValue(rightTrigger), 0, 1);
		this.rightTriggerRaw = EngineMath.clamp(rightTrigger, 0, 1);

		this.leftStickValue = this.filterLeftStickValue(leftStickValue.x, leftStickValue.y);
		this.leftStickValueRaw = Vector2D.Zero();
		this.leftStickValueRaw.x = EngineMath.clamp(leftStickValue.x, -1, 1);
		this.leftStickValueRaw.y = EngineMath.clamp(leftStickValue.y, -1, 1);

		this.rightStickValue = this.filterRightStickValue(rightStickValue.x, rightStickValue.y);
		this.rightStickValueRaw = Vector2D.Zero();
		this.rightStickValueRaw.x = EngineMath.clamp(rightStickValue.x, -1, 1);
		this.rightStickValueRaw.y = EngineMath.clamp(rightStickValue.y, -1, 1);
	}

	copy() {
		var c = new this();
		c.update(this.name, this.index, this.timestamp, this.isConnected, this.buttons, this.leftStickValue, this.rightStickValue, this.leftTrigger, this.rightTrigger);
		return c;
	}

	copyFrom(other) {
		this.name = other.name;
		this.index = other.index;
		this.timestamp = other.timestamp;
		this.isConnected = other.isConnected;
		this.buttons = other.buttons;
		this.leftTrigger = other.leftTrigger;
		this.leftTriggerRaw = other.leftTriggerRaw;
		this.rightTrigger = other.rightTrigger;
		this.rightTriggerRaw = other.rightTriggerRaw;
		this.leftStickValue.x = other.leftStickValue.x;
		this.leftStickValue.y = other.leftStickValue.y;
		this.leftStickValueRaw.x = other.leftStickValueRaw.x;
		this.leftStickValueRaw.y = other.leftStickValueRaw.y;
		this.rightStickValue.x = other.rightStickValue.x;
		this.rightStickValue.y = other.rightStickValue.y;
		this.rightStickValueRaw.x = other.rightStickValueRaw.x;
		this.rightStickValueRaw.y = other.rightStickValueRaw.y;
	}
}

export default GamepadState;

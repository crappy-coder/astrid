import Event from "./../Event";
import { ValueOrDefault } from "./../Engine";
import Key from "./Key";
import ModifierKeys from "./ModifierKeys";

class KeyEvent extends Event {
	constructor(type, key, isDown, isRepeat, modifierKeys, charCode, bubbles, cancelable) {
		super(type, ValueOrDefault(bubbles, true), ValueOrDefault(cancelable, true));

		/** Boolean **/
		this.isDown = ValueOrDefault(isDown, false);

		/** Boolean **/
		this.isUp = ValueOrDefault(!isDown, false);

		/** Boolean **/
		this.isRepeat = ValueOrDefault(isRepeat, false);

		/** Number **/
		this.keyCode = key;

		/** Number **/
		this.charCode = ValueOrDefault(charCode, -1);

		/** Key **/
		this.key = (this.keyCode != 0 ? Key.fromKeyCode(this.keyCode) : Key.fromCharCode(this.charCode));

		/** ModifierKeys **/
		this.modifierKeys = ValueOrDefault(modifierKeys, ModifierKeys.None);
	}

	getIsDown() {
		return this.isDown;
	}

	getIsUp() {
		return this.isUp;
	}

	getIsRepeat() {
		return this.isRepeat;
	}

	getKeyCode() {
		return this.keyCode;
	}

	getCharCode() {
		return this.charCode;
	}

	getKey() {
		return this.key;
	}

	getModifierKeys() {
		return this.modifierKeys;
	}

	getIsAltKeyDown() {
		return this.readModifierFlag(ModifierKeys.Alt);
	}

	getIsControlKeyDown() {
		return this.readModifierFlag(ModifierKeys.Control);
	}

	getIsShiftKeyDown() {
		return this.readModifierFlag(ModifierKeys.Shift);
	}

	getIsMetaKeyDown() {
		return this.readModifierFlag(ModifierKeys.Meta);
	}

	readModifierFlag(flag) {
		return ((this.modifierKeys & flag) == flag);
	}

	toString() {
		var keyStr = "None";

		for (var s in Key) {
			if (Key[s] == this.key) {
				keyStr = s;
				break;
			}
		}

		return String.format("KeyEvent[ keyCode=#{0}, charCode=#{1}, key=#{2}, altKeyDown=#{3}, ctrlKeyDown=#{4}, shiftKeyDown=#{5}, metaKeyDown=#{6}, isDown=#{7}, isRepeat=#{8}",
				this.keyCode, this.charCode, keyStr, this.getIsAltKeyDown(), this.getIsControlKeyDown(), this.getIsShiftKeyDown(), this.getIsMetaKeyDown(), this.getIsDown(), this.getIsRepeat());
	}
}

Object.assign(KeyEvent, {
	KEY_DOWN: "keyDown",
	KEY_UP: "keyUp",
	KEY_PRESS: "keyPress"
});

export default KeyEvent;

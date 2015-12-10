import Event from "../Event";
import MouseButton from "./MouseButton";
import Vector2D from "../Vector2D";
import ModifierKeys from "./ModifierKeys";

class MouseEvent extends Event {
	constructor(type, x, y, button, modifiers, bubbles, cancelable) {
		super(type, astrid.valueOrDefault(bubbles, true), astrid.valueOrDefault(cancelable, false));

		this.modifiers = modifiers;
		this.isLeftButtonDown = (button == MouseButton.Left);
		this.isMiddleButtonDown = (button == MouseButton.Middle);
		this.isRightButtonDown = (button == MouseButton.Right);
		this.isXButton1Down = (button == MouseButton.XButton1);
		this.isXButton2Down = (button == MouseButton.XButton2);
		this.x = x;
		this.y = y;
		this.lastTarget = null;

		this.pos = new Vector2D(this.x, this.y);
		this.localX = 0;
		this.localY = 0;
	}

	getModifierFlags() {
		return this.modifiers;
	}

	getModifierState(mkey) {
		return ((this.modifiers & mkey) != ModifierKeys.None);
	}

	getIsAltDown() {
		return this.getModifierState(ModifierKeys.Alt);
	}

	getIsCtrlDown() {
		return this.getModifierState(ModifierKeys.Control);
	}

	getIsShiftDown() {
		return this.getModifierState(ModifierKeys.Shift);
	}

	getIsMetaDown() {
		return this.getModifierState(ModifierKeys.Meta);
	}

	getIsLeftButtonDown() {
		return this.isLeftButtonDown;
	}

	getIsRightButtonDown() {
		return this.isRightButtonDown;
	}

	getIsMiddleButtonDown() {
		return this.isMiddleButtonDown;
	}

	getIsXButton1Down() {
		return this.isXButton1Down;
	}

	getIsXButton2Down() {
		return this.isXButton2Down;
	}

	getX() {
		return this.x;
	}

	getY() {
		return this.y;
	}

	getLocalX() {
		if (!this.recomputeLocalPosition()) {
			return this.x;
		}

		return this.localX;
	}

	getLocalY() {
		if (!this.recomputeLocalPosition()) {
			return this.y;
		}

		return this.localY;
	}

	recomputeLocalPosition(target) {
		target = this.currentTarget || this.target;

		if (target == null) {
			this.lastTarget = null;
			return false;
		}

		if (target != this.lastTarget) {
			this.lastTarget = target;

			if (this.lastTarget.pointToLocal) {
				var pt = this.lastTarget.pointToLocal(this.pos);

				this.localX = pt.x;
				this.localY = pt.y;
			}
		}

		return true;
	}
}

Object.assign(MouseEvent, {
	MOUSE_DOWN: "mouseDown",
	MOUSE_UP: "mouseUp",
	MOUSE_UP_OUTSIDE: "mouseUpOutside",
	MOUSE_ENTER: "mouseEnter",
	MOUSE_LEAVE: "mouseLeave",
	MOUSE_MOVE: "mouseMove",
	MOUSE_WHEEL: "mouseWheel",
	CLICK: "click",
	DOUBLE_CLICK: "doubleClick"
});

export default MouseEvent;

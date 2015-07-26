import { ValueOrDefault } from "../Engine";
import Vector2D from "../Vector2D";
import Event from "../Event";
import Pen from "../ui/Pen";
import SolidColorBrush from "../brushes/SolidColorBrush";
import EngineMath from "../EngineMath";
import MouseEvent from "./MouseEvent";
import Drawable from "../ui/Drawable";

/****************************************************************************
 ** TODO:
 **   - add bounding box limit so the joystick base can only move within a
 **     specified bounding rect
 **
 **   - add snap back tweening to the stick so it smoothly snaps back to
 **     the center
 **
 ****************************************************************************/
class Joystick extends Drawable {
	constructor(name, outerRadius, innerRadius, isPinned) {
		super(name);

		this.outerRadius = ValueOrDefault(outerRadius, 50);
		this.innerRadius = ValueOrDefault(innerRadius, 30);
		this.range = 0;
		this.baseX = 0;
		this.baseY = 0;
		this.stickX = 0;
		this.stickY = 0;
		this.lastParent = null;
		this.value = new Vector2D(0, 0);
		this.angleValue = 0;
		this.isPinned = ValueOrDefault(isPinned, false);
		this.isDown = false;

		this.updateRange();
		this.addEventHandler(Event.PARENT_CHANGED, this.handleParentChange.asDelegate(this));
	}

	getOuterRadius() {
		return this.outerRadius;
	}

	setOuterRadius(value) {
		this.outerRadius = value;
		this.updateRange();
	}

	getInnerRadius() {
		return this.innerRadius;
	}

	setInnerRadius(value) {
		this.innerRadius = value;
		this.updateRange();
	}

	getIsPinned() {
		return this.isPinned;
	}

	setIsPinned(value) {
		this.isPinned = value;
	}

	getRange() {
		return this.range;
	}

	getDeltaX() {
		return this.stickX - this.baseX;
	}

	getDeltaY() {
		return this.stickY - this.baseY;
	}

	getAngleValue() {
		return this.angleValue;
	}

	getValue() {
		return this.value;
	}

	isZero() {
		return (this.value.x == 0 && this.value.y == 0);
	}

	isPointingUp() {
		return (this.value.y < 0);
	}

	isPointingDown() {
		return (this.value.y > 0);
	}

	isPointingLeft() {
		return (this.value.x < 0);
	}

	isPointingRight() {
		return (this.value.x > 0);
	}

	layout(unscaledWidth, unscaledHeight) {
		super.layout(unscaledWidth, unscaledHeight);

		var cx = unscaledWidth * 0.5;
		var cy = unscaledHeight * 0.5;

		this.graphics.clear();
		this.render(this.graphics, cx, cy, this.getDeltaX() + cx, this.getDeltaY() + cy);
	}

	/** implementors should override this to provide a custom ui **/
	/*
	 cx1,cy1: center of base
	 cx2,cy2: center of stick
	 */
	render(gfx, cx1, cy1, cx2, cy2) {
		// base
		gfx.drawEllipse(cx1, cy1, this.outerRadius * 2, this.outerRadius * 2);
		gfx.stroke(new Pen(SolidColorBrush.blue(), 1));

		// stick
		gfx.drawEllipse(cx2, cy2, this.innerRadius * 2, this.innerRadius * 2);
		gfx.stroke(new Pen(SolidColorBrush.blue(), 1));
	}

	updateRange() {
		this.range = (this.outerRadius - this.innerRadius);
		this.setWidth(this.outerRadius * 2);
		this.setHeight(this.outerRadius * 2);
	}

	updateValue() {
		var dx = this.getDeltaX();
		var dy = this.getDeltaY();
		var vx = dx / this.range;
		var vy = dy / this.range;

		if (vx != this.value.x || vy != this.value.y) {
			this.value.x = vx;
			this.value.y = vy;
			this.angleValue = EngineMath.radiansToDegrees(Math.atan2(dy, dx));

			this.dispatchEvent(new Event(Event.CHANGE));
		}
	}

	handleParentChange(e) {
		if (this.lastParent != null) {
			this.lastParent.removeEventHandler(MouseEvent.MOUSE_DOWN, this.handleMouseDown.asDelegate(this));
			this.lastParent.removeEventHandler(MouseEvent.MOUSE_UP, this.handleMouseUp.asDelegate(this));
			this.lastParent.removeEventHandler(MouseEvent.MOUSE_UP_OUTSIDE, this.handleMouseUp.asDelegate(this));
			this.lastParent.removeEventHandler(MouseEvent.MOUSE_MOVE, this.handleMouseMove.asDelegate(this));
		}

		this.lastParent = this.getParent();

		if (this.lastParent != null) {
			this.lastParent.addEventHandler(MouseEvent.MOUSE_DOWN, this.handleMouseDown.asDelegate(this));
			this.lastParent.addEventHandler(MouseEvent.MOUSE_UP, this.handleMouseUp.asDelegate(this));
			this.lastParent.addEventHandler(MouseEvent.MOUSE_UP_OUTSIDE, this.handleMouseUp.asDelegate(this));
			this.lastParent.addEventHandler(MouseEvent.MOUSE_MOVE, this.handleMouseMove.asDelegate(this));
		}
	}

	handleMouseDown(e) {
		this.isDown = true;
		this.baseX = this.stickX = e.x;
		this.baseY = this.stickY = e.y;

		if (!this.isPinned) {
			this.setX(e.getLocalX() - (this.getExactOrMeasuredWidth() * 0.5));
			this.setY(e.getLocalY() - (this.getExactOrMeasuredHeight() * 0.5));
		}

		this.updateValue();
		this.requestLayout();
	}

	handleMouseUp(e) {
		this.isDown = false;
		this.baseX = this.stickX = (this.getExactOrMeasuredWidth() * 0.5);
		this.baseY = this.stickY = (this.getExactOrMeasuredHeight() * 0.5);

		this.updateValue();
		this.requestLayout();
	}

	handleMouseMove(e) {
		if (!this.isDown) {
			return;
		}

		var dx = e.x - this.baseX;
		var dy = e.y - this.baseY;
		var r = Math.sqrt(dx * dx + dy * dy);

		if (r > this.range) {
			this.stickX = this.baseX + dx / r * this.range;
			this.stickY = this.baseY + dy / r * this.range;
		}
		else {
			this.stickX = e.x;
			this.stickY = e.y;
		}

		this.updateValue();
		this.requestLayout();
	}
}

export default Joystick;

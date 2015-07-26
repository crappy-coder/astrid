import EventDispatcher from "../EventDispatcher";
import PropertyOptions from "../ui/PropertyOptions";
import Vector2D from "../Vector2D"
import { ValueOrDefault } from "../Engine";
import EngineMath from "../EngineMath";
import RotateTransform from "../transforms/RotateTransform";
import Box2D from "box2dweb";

var PXVector2D = Box2D.Common.Math.b2Vec2;

class EntityBase extends EventDispatcher {
	constructor(name, controller) {
		super();

		this.name = name;
		this.controller = controller;
		this.drawable = null;
		this.drawableUpdateOptions = PropertyOptions.None;
		this.autoRemoveDrawable = true;
		this.isDestroyed = false;
		this.prevPosition = new Vector2D(0, 0);
		this.prevCenter = new Vector2D(0, 0);
		this.prevAngle = 0;

		this.controller.addEntity(this);
	}

	getName() {
		return this.name;
	}

	getController() {
		return this.controller;
	}

	getDrawable() {
		return this.drawable;
	}

	getIsDestroyed() {
		return this.isDestroyed;
	}

	getLocalCenter(asUnits) {
		return this.getLocalCenterImpl(ValueOrDefault(asUnits, false));
	}

	getLocalCenterImpl(asUnits) {
		return null;
		/** override **/
	}

	getGlobalCenter(asUnits) {
		return this.getGlobalCenterImpl(ValueOrDefault(asUnits, false));
	}

	getGlobalCenterImpl(asUnits) {
		return null;
		/** override **/
	}

	getPosition(asUnits) {
		return this.getPositionImpl(ValueOrDefault(asUnits, false));
	}

	getPositionImpl(asUnits) {
		return null;
		/** override **/
	}

	setPosition(value, isUnits) {
		this.setPositionImpl(value, ValueOrDefault(isUnits, false));
	}

	setPositionImpl(value, isUnits) {
		/** override **/
	}

	getAngle(asRadians) {
		return this.getAngleImpl(ValueOrDefault(asRadians, false));
	}

	getAngleImpl(asRadians) {
		return 0;
		/** override **/
	}

	setAngle(value, isRadians) {
		this.setAngleImpl(value, ValueOrDefault(isRadians, false));
	}

	setAngleImpl(value, isRadians) {
		/** override **/
	}

	getMass() {
		/** override **/
	}

	getBounds(asUnits, asAABB) {
		asUnits = ValueOrDefault(asUnits, false);
		asAABB = ValueOrDefault(asAABB, true);

		return this.getBoundsImpl(asUnits, asAABB);
	}

	getBoundsImpl(asUnits, asAABB) {
		/** override **/
	}

	destroy() {
		if (this.isDestroyed) {
			return;
		}

		this.unlink();
		this.controller.removeEntity(this, true);
		this.isDestroyed = true;
	}

	link(drawable, updateOptions, autoRemove) {
		this.drawable = drawable;
		this.drawableUpdateOptions = ValueOrDefault(updateOptions, PropertyOptions.None);
		this.autoRemoveDrawable = ValueOrDefault(autoRemove, true);
	}

	unlink(removeDrawable) {
		if (this.drawable != null) {
			if (this.autoRemoveDrawable || ValueOrDefault(removeDrawable, false)) {
				this.drawable.removeFromParent();
			}

			this.drawable = null;
			this.drawableUpdateOptions = PropertyOptions.None;
			this.autoRemoveDrawable = true;
		}
	}

	reset() {
		/** override **/
	}

	update(ratio) {
		/** override **/
	}

	resetDrawable(unitPos, unitCenter, angle) {
		if (this.drawable == null) {
			return;
		}

		this.prevPosition.x = unitPos.x;
		this.prevPosition.y = unitPos.y;
		this.prevCenter.x = unitCenter.x;
		this.prevCenter.y = unitCenter.y;
		this.prevAngle = angle;

		this.updateDrawablePosition(unitPos, unitCenter, angle);
	}

	updateDrawable(ratio, unitPos, unitCenter, angle) {
		if (this.drawable == null) {
			return;
		}

		var oneMinusRatio = 1.0 - ratio;
		var newPos = new PXVector2D(0, 0);
		var newCenter = new PXVector2D(0, 0);
		var newAngle = 0;

		newPos.x = ratio * unitPos.x + (oneMinusRatio * this.prevPosition.x);
		newPos.y = ratio * unitPos.y + (oneMinusRatio * this.prevPosition.y);
		newCenter.x = ratio * unitCenter.x + (oneMinusRatio * this.prevCenter.x);
		newCenter.y = ratio * unitCenter.y + (oneMinusRatio * this.prevCenter.y);
		newAngle = angle * ratio + oneMinusRatio * this.prevAngle;

		this.updateDrawablePosition(newPos, newCenter, newAngle);
	}

	updateDrawablePosition(unitPos, unitCenter, angle) {
		var unitScale = this.controller.getScaleUnit();
		var px = unitPos.x * unitScale;
		var py = unitPos.y * unitScale;
		var cx = unitCenter.x * unitScale;
		var cy = unitCenter.y * unitScale;
		var ox = (this.drawable.getWidth() * 0.5) - cx;
		var oy = (this.drawable.getHeight() * 0.5) - cy;
		var xform = this.drawable.getRenderTransform();

		angle = EngineMath.normalizeAngle(EngineMath.radiansToDegrees(angle));

		// FIXME : need to allow for a user specified transform as well, if a user
		//         set's their own render transform we will end up overriding it,
		//         the only current workaround is to embed drawable within another
		//         and set their transform on the inner drawable while linking to
		//         the outer drawable.

		if (xform == null || !(xform instanceof RotateTransform)) {
			xform = new RotateTransform(angle, ox, oy);
			this.drawable.setRenderTransform(xform);
		}

		xform.setCenterX(Math.round(ox));
		xform.setCenterY(Math.round(oy));
		xform.setAngle(Math.round(angle));

		this.drawable.setX(EngineMath.toInt(px) - EngineMath.toInt(ox));
		this.drawable.setY(EngineMath.toInt(py) - EngineMath.toInt(oy));

		// no update options specified so we can just finish
		if (this.drawableUpdateOptions == PropertyOptions.None) {
			return;
		}


		// apply any update options specified by the user when the
		// drawable was linked, this allows for drawables to automatically
		// update there layout's as the entity is simulated
		var parent = this.drawable.getParent();

		if ((this.drawableUpdateOptions & PropertyOptions.AffectsMeasure) != PropertyOptions.None) {
			this.drawable.requestMeasure();
		}

		if ((this.drawableUpdateOptions & PropertyOptions.AffectsLayout) != PropertyOptions.None) {
			this.drawable.requestLayout();
		}

		if (parent != null) {
			if ((this.drawableUpdateOptions & PropertyOptions.AffectsParentMeasure) != PropertyOptions.None) {
				parent.requestMeasure();
			}

			if ((this.drawableUpdateOptions & PropertyOptions.AffectsParentLayout) != PropertyOptions.None) {
				parent.requestLayout();
			}
		}
	}

	convertPoint(pt, isUnits, asUnits, asVector) {
		return this.controller.convertPoint(pt, isUnits, asUnits, asVector);
	}

	toPixels(units) {
		return this.controller.toPixels(units);
	}

	toUnits(pixels) {
		return this.controller.toUnits(pixels);
	}
}

export default EntityBase;

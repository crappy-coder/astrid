import Animatable from "./Animatable";
import EventDispatcher from "../EventDispatcher";
import { ValueOrDefault } from "../Engine";
import EngineMath from "../EngineMath";
import RotateTransform from "../transforms/RotateTransform";
import Vector2D from "../Vector2D";
import Application from "../Application";
import Pen from "../ui/Pen";
import SolidColorBrush from "../brushes/SolidColorBrush";
import PropertyOptions from "../ui/PropertyOptions";
import Canvas from "../ui/Canvas";

class IKBoneImpl {
	constructor(x, y, angle) {
		this.x = x;
		this.y = y;
		this.angle = angle;
	}
}

class IK {
	constructor(name, x, y) {
		this.name = name;
		this.x = x;
		this.y = y;
		this.lastBone = null;
		this.bones = [];
		this.draw = null;
	}

	getName() {
		return this.name;
	}

	getRoot() {
		if (this.bones.length == 0) {
			return null;
		}

		return this.bones[0];
	}

	add(bone) {
		if (bone == null) {
			return;
		}

		if (this.lastBone != null) {
			bone.prevBone = this.lastBone;
			this.lastBone.nextBone = bone;
		}

		this.bones.push(bone);
		this.lastBone = bone;
	}

	remove(bone) {
		return this.removeAt(this.bones.indexOf(bone));
	}

	removeAt(idx) {
		if (idx >= 0 && idx <= this.bones.length) {
			var list = this.bones.splice(idx);
			var last = null;

			for (var i = 0; i < this.bones.length; ++i) {
				if (last != null) {
					last.nextBone = this.bones[i];
				}

				this.bones[i].prevBone = last;
				last = this.bones[i];
			}

			return list;
		}

		return null;
	}

	clear() {
		this.bones.length = 0;
	}

	get(name) {
		var len = this.getCount();

		for (var i = 0; i < len; ++i) {
			if (this.bones[i].getName() == name) {
				return this.bones[i];
			}
		}

		return null;
	}

	getCount() {
		return this.bones.length;
	}

	getAt(idx) {
		return this.bones[idx];
	}

	rotate(angle) {
		var root = this.getRoot();

		if (root != null) {
			root.setAngle(angle);
		}
	}

	update() {
		var len = this.bones.length;
		var drawable = null;
		var angle = 0;
		var px = this.x;
		var py = this.y;

		for (var i = 0; i < len; ++i) {
			drawable = this.bones[i].drawable;
			angle += EngineMath.degreesToRadians(this.bones[i].getAngle());

			if (drawable != null) {
				var xform = drawable.getRenderTransform();
				var offset = (this.bones[i].drawablePosition == null ? drawable.getCenter() : this.bones[i].drawablePosition);

				if (xform == null) {
					xform = new RotateTransform();
					drawable.setRenderTransform(xform);
				}

				drawable.setX(px - offset.x);
				drawable.setY(py - offset.y);

				xform.setAngle(EngineMath.radiansToDegrees(angle));
				xform.setCenterX(offset.x);
				xform.setCenterY(offset.y);
			}

			px += Math.cos(angle) * this.bones[i].getLength();
			py += Math.sin(angle) * this.bones[i].getLength();
		}

		if (this.draw) {
			this.draw.requestLayout();
			this.draw.requestMeasure();
		}
	}

	moveTo(targetX, targetY) {
		var i;
		var len = this.bones.length;
		var bones = [];
		var worldBones = [];
		var prevBone;
		var currBone;

		for (i = 0; i <= len; ++i) {
			bones.push(new IKBoneImpl(
					(i > 0 ? this.bones[i - 1].getLength() : 0), 0,
					(i < len ? EngineMath.degreesToRadians(this.bones[i].getAngle()) : 0)
			));
		}

		len = bones.length;

		worldBones.push(new IKBoneImpl(bones[0].x, bones[0].y, bones[0].angle));

		for (i = 1; i < len; ++i) {
			prevBone = worldBones[i - 1];
			currBone = bones[i];

			worldBones.push(new IKBoneImpl(
					prevBone.x + Math.cos(prevBone.angle) * currBone.x - Math.sin(prevBone.angle) * currBone.y,
					prevBone.y + Math.sin(prevBone.angle) * currBone.x + Math.cos(prevBone.angle) * currBone.y,
					prevBone.angle + currBone.angle
			));
		}

		var endX = worldBones[len - 1].x;
		var endY = worldBones[len - 1].y;
		var modified = false;
		var success = false;
		var epsilon = 0.0001;
		var arcLength = 0.00001;

		for (i = len - 1; i >= 0; --i) {
			var curToEndX = endX - worldBones[i].x;
			var curToEndY = endY - worldBones[i].y;
			var curToEndMag = Math.sqrt(curToEndX * curToEndX + curToEndY * curToEndY);

			var curToTargetX = targetX - worldBones[i].x;
			var curToTargetY = targetY - worldBones[i].y;
			var curToTargetMag = Math.sqrt(curToTargetX * curToTargetX + curToTargetY * curToTargetY);

			var rotAngleC = 0;
			var rotAngleS = 0;
			var endTargetMag = (curToEndMag * curToTargetMag);

			if (endTargetMag <= epsilon) {
				rotAngleC = 1;
				rotAngleS = 0;
			}
			else {
				rotAngleC = (curToEndX * curToTargetX + curToEndY * curToTargetY) / endTargetMag;
				rotAngleS = (curToEndX * curToTargetY - curToEndY * curToTargetX) / endTargetMag;
			}

			var rotAngle = Math.acos(Math.max(-1, Math.min(1, rotAngleC)));

			if (rotAngleS < 0.0) {
				rotAngle = -rotAngle;
			}

			endX = worldBones[i].x + rotAngleC * curToEndX - rotAngleS * curToEndY;
			endY = worldBones[i].y + rotAngleS * curToEndX + rotAngleC * curToEndY;

			bones[i].angle = this.simplifyAngle(bones[i].angle + rotAngle);

			var endToTargetX = (targetX - endX);
			var endToTargetY = (targetY - endY);

			if (endToTargetX * endToTargetX + endToTargetY * endToTargetY <= 2) {
				success = true;
				break;
			}

			if (!modified && Math.abs(rotAngle) * curToEndMag > arcLength) {
				modified = true;
			}
		}

		for (i = 0; i < this.bones.length; ++i) {
			this.bones[i].setAngle(EngineMath.radiansToDegrees(bones[i].angle));
		}
	}

	simplifyAngle(angle) {
		angle = angle % (2.0 * Math.PI);

		if (angle < -Math.PI) {
			angle += (2.0 * Math.PI);
		}
		else if (angle > Math.PI) {
			angle -= (2.0 * Math.PI);
		}

		return angle;
	}
}

class IKBone extends EventDispatcher {
	constructor(name, length, angle, drawable) {
		super();

		this.initializeAnimatableProperties();

		this.name = name;
		this.setLength(length);
		this.setAngle(angle);

		this.prevBone = null;
		this.nextBone = null;
		this.drawable = ValueOrDefault(drawable, null);
		this.drawablePosition = null;
	}

	initializeAnimatablePropertiesCore() {
		this.enableAnimatableProperty("length", this.getLength, this.setLength, PropertyOptions.None);
		this.enableAnimatableProperty("angle", this.getAngle, this.setAngle, PropertyOptions.None);
	}

	getName() {
		return this.name;
	}

	setName(value) {
		this.name = value;
	}

	getDrawable() {
		return this.drawable;
	}

	getDrawablePosition() {
		return this.drawablePosition;
	}

	setDrawablePosition(value) {
		if (value == null) {
			this.drawablePosition = null;
		}
		else {
			if (this.drawablePosition == null) {
				this.drawablePosition = new Vector2D();
			}

			this.drawablePosition.x = value.x;
			this.drawablePosition.y = value.y;
		}
	}

	setDrawable(value) {
		this.drawable = value;
	}

	getAngle() {
		return this.getPropertyValue("angle");
	}

	setAngle(value) {
		this.setPropertyValue("angle", value);
	}

	getLength() {
		return this.getPropertyValue("length");
	}

	setLength(value) {
		this.setPropertyValue("length", value);
	}

	getPrevBone() {
		return this.prevBone;
	}

	getNextBone() {
		return this.nextBone;
	}
}

Object.assign(IKBone.prototype, Animatable);

class IKContainer extends Canvas {
	constructor(name, surface) {
		super(name);

		surface = ValueOrDefault(surface, Application.getInstance().getDisplaySurfaceAt(0));

		this.ik = surface.createArmature(name, 0, 0);
	}

	getIK() {
		return this.ik;
	}

	attach(bone) {
		this.ik.add(bone);
	}

	getBone(name) {
		return this.ik.get(name);
	}

	getBoneAt(idx) {
		return this.ik.getAt(idx);
	}

	getBoneCount() {
		return this.ik.getCount();
	}

	addBone(length, angle, drawable, anchorPoint) {
		anchorPoint = ValueOrDefault(anchorPoint, new Vector2D(0, drawable.getHeight() * 0.5));

		var bone = new IKBone(drawable.getName(), length, angle, drawable);
		bone.setDrawablePosition(anchorPoint);

		this.ik.add(bone);
		this.add(drawable);

		return bone;
	}
}

class IKDraw extends Canvas {
	constructor(ik) {
		super("ikdraw");

		this.ik = ik;
		this.ik.draw = this;
	}

	layout(unscaledWidth, unscaledHeight) {
		super.layout(unscaledWidth, unscaledHeight);

		var gfx = this.getGraphics();
		var bones = this.ik.bones;
		var len = bones.length;
		var angle = 0;
		var px = 0;
		var py = 0;

		gfx.beginPath();
		gfx.moveTo(0, 0);

		for (var i = 0; i < len; ++i) {
			angle += EngineMath.degreesToRadians(bones[i].getAngle());

			px += Math.cos(angle) * bones[i].getLength();
			py += Math.sin(angle) * bones[i].getLength();

			gfx.lineTo(px, py);
		}

		gfx.stroke(new Pen(SolidColorBrush.red(), 2));
	}
}

export default IK;

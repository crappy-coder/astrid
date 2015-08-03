import Drawable from "../../../src/ui/Drawable";
import Pen from "../../../src/ui/Pen";
import PenLineJoin from "../../../src/ui/PenLineJoin";
import SolidColorBrush from "../../../src/brushes/SolidColorBrush";
import Color from "../../../src/graphics/Color";
import Application from "../../../src/Application";
import FrameEvent from "../../../src/FrameEvent";
import TouchEvent from "../../../src/input/TouchEvent";
import Vector2D from "../../../src/Vector2D";

class BubbleVertex {
	initialize(x, y) {
		this.x = x;
		this.y = y;
		this.vx = 5 * Math.random();
		this.vy = 5 * Math.random();
	}

	update(gravity) {
		this.x += this.vx;
		this.y += this.vy;
		this.vy += gravity;

		if (this.x < 0) {
			this.x = 0;
			this.vx = 0;
			this.vy = 0;
		}

		if (this.y < 0) {
			this.y = 0;
			this.vx = 0;
			this.vy = 0;
		}

		if (this.x > 800) {
			this.x = 800;
			this.vx = 0;
			this.vy = 0;
		}

		if (this.y > 600) {
			this.y = 600;
			this.vx = 0;
			this.vy = 0;
		}

		this.vx *= 0.99;
		this.vy *= 0.99;
	}
}

class Bubble extends Drawable {
	constructor(name) {
		super(name);

		this.firmness = 0.1;
		this.gravity = -0.002;
		this.radius = 50;
		this.rotation = 0;
		this.rotationAmount = -0.01;
		this.points = [];
		this.pointCount = 10;
		this.startX = 0;
		this.startY = 0;
		this.invalidatePoints = true;
		this.alwaysDirty = true;
		this.penCache = new Pen(SolidColorBrush.fromColorHex("#FFFFFF"), 4);
		this.penCache.setLineJoin(PenLineJoin.Round);
		this.brushCache = new SolidColorBrush(Color.Blue);

		Application.getInstance().addEventHandler(FrameEvent.ENTER, this.handleFrameTick.asDelegate(this));
		this.addEventHandler(TouchEvent.TOUCH_START, this.handleTouchStartEvent.asDelegate(this));
		this.addEventHandler(TouchEvent.TOUCH_END, this.handleTouchEndEvent.asDelegate(this));
		this.addEventHandler(TouchEvent.TOUCH_MOVE, this.handleTouchMoveEvent.asDelegate(this));
	}

	handleTouchStartEvent(event) {
		event.preventDefault();

		for (var i = 0; i < event.points.length; i++) {
			console.log("start(" + this.name + ") : " + event.points[i].sceneX + " : " + event.points[i].sceneY);
		}
	}

	handleTouchEndEvent(event) {
		for (var i = 0; i < event.points.length; i++) {
			console.log("end(" + this.name + "): " + event.points[i].sceneX + " : " + event.points[i].sceneY);
		}
	}

	handleTouchMoveEvent(event) {
		for (var i = 0; i < event.points.length; i++) {
			console.log("move(" + this.name + "): " + event.points[i].sceneX + " : " + event.points[i].sceneY);
		}
	}

	handleMouseDown(evt) {
		console.log(this.name);
	}

	getFirmness() {
		return this.firmness;
	}

	setFirmness(value) {
		this.firmness = value;
	}

	getGravity() {
		return this.gravity;
	}

	setGravity(value) {
		this.gravity = value;
	}

	getRadius() {
		return this.radius;
	}

	setRadius(value) {
		this.radius = value;
	}

	getRotation() {
		return this.rotation;
	}

	setRotation(value) {
		this.rotation = value;
	}

	getRotationAmount() {
		return this.rotationAmount;
	}

	setRotationAmount(value) {
		this.rotationAmount = value;
	}

	getPointCount() {
		return this.pointCount;
	}

	setPointCount(value) {
		if (this.pointCount != value) {
			this.pointCount = value;
			this.invalidatePoints = true;
			this.invalidateProperties();
		}
	}

	setStartX(value) {
		if (this.startX != value) {
			this.startX = value;
			this.invalidatePoints = true;
			this.invalidateProperties();
		}
	}

	setStartY(value) {
		if (this.startY != value) {
			this.startY = value;
			this.invalidatePoints = true;
			this.invalidateProperties();
		}
	}

	commitProperties() {
		super.commitProperties();

		if (this.invalidatePoints) {
			this.points = [];

			for (var i = 0; i < this.pointCount; ++i) {
				var angle = Math.PI * 2 / this.pointCount * i;
				this.points.push(new BubbleVertex(this.startX + Math.cos(angle) * this.radius, this.startY +
					Math.sin(angle) * this.radius));
			}

			this.invalidatePoints = false;
		}
	}

	handleFrameTick(evt) {
		var t = evt.getDeltaTime();
		var gfx = this.getGraphics();
		var cx = 0;
		var cy = 0;
		var v, i;

		if (this.points.length == 0) {
			return;
		}

		for (i = 0; i < this.pointCount; ++i) {
			v = this.points[i];
			v.update(this.gravity * t);

			cx += v.x;
			cy += v.y;
		}

		cx /= this.pointCount;
		cy /= this.pointCount;

		for (i = 0; i < this.pointCount; ++i) {
			v = this.points[i];

			var angle = Math.PI * 2 / this.pointCount * i + this.rotation;
			var tx = cx + Math.cos(angle) * this.radius;
			var ty = cy + Math.sin(angle) * this.radius;

			v.vx += (tx - v.x) * this.firmness;
			v.vy += (ty - v.y) * this.firmness;
		}

		this.rotation += Math.random() * this.rotationAmount;
		gfx.clear();
		this.renderOutline();
	}

	renderOutline() {
		var mids = [];
		var len = this.points.length;
		var ptA, ptB, i;
		var gfx = this.getGraphics();

		for (i = 0; i < len - 1; ++i) {
			ptA = this.points[i];
			ptB = this.points[i + 1];
			mids.push(new Vector2D((ptA.x + ptB.x) * 0.5, (ptA.y + ptB.y) * 0.5));
		}

		mids.push(new Vector2D((this.points[i].x + this.points[0].x) * 0.5, (this.points[i].y + this.points[0].y) * 0.5));

		gfx.beginPath();
		gfx.moveTo(mids[0].x, mids[0].y);

		for (i = 1; i < len; ++i) {
			gfx.curveTo(this.points[i].x, this.points[i].y, mids[i].x, mids[i].y);
		}

		gfx.curveTo(this.points[0].x, this.points[0].y, mids[0].x, mids[0].y);
		gfx.closePath();

		gfx.fill(this.brushCache);
		gfx.stroke(this.penCache);
	}
}

export default Bubble;

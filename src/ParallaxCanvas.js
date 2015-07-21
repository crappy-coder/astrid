import Canvas from "./Canvas";
import Vector2D from "./math/Vector2D";
import CollectionEvent from "./CollectionEvent";
import Application from "./Application";
import FrameEvent from "./FrameEvent";
import EngineMath, { PositiveInfinity } from "./math/EngineMath";
import ParallaxCanvasLayer from "./ParallaxCanvasLayer";

class ParallaxCanvas extends Canvas {
	constructor(name) {
		super(name);

		this.speed = 0;
		this.limits = Vector2D.NotSet();
		this.computedLimits = null;
		this.position = Vector2D.Zero();

		this.addEventHandler(CollectionEvent.ITEM_ADDED, this.handleItemAddRemoveEvent.asDelegate(this));
		this.addEventHandler(CollectionEvent.ITEM_REMOVED, this.handleItemAddRemoveEvent.asDelegate(this));

		Application.getInstance().addEventHandler(FrameEvent.ENTER, this.handleFrameTickEvent.asDelegate(this));
	}

	getSpeed() {
		return this.speed;
	}

	setSpeed(value) {
		this.speed = value;
	}

	getLimits() {
		return this.limits;
	}

	setLimits(value) {
		this.limits = value;
	}

	moveUp(by) {
		this.move(0, by);
	}

	moveDown(by) {
		this.move(0, -by);
	}

	moveLeft(by) {
		this.move(by, 0);
	}

	moveRight(by) {
		this.move(-by, 0);
	}

	move(byX, byY) {
		var x = byX * this.speed;
		var y = byY * this.speed;
		var computedLimits = this.computeLimits();
		var lx = computedLimits.x;
		var ly = computedLimits.y;

		this.position.x += x;
		this.position.y += y;

		if (Math.abs(this.position.x) > lx && !EngineMath.isInfinity(lx)) {
			this.position.x -= x;
		}

		if (Math.abs(this.position.y) > ly && !EngineMath.isInfinity(ly)) {
			this.position.y -= y;
		}
	}

	computeLimits() {
		if (this.computedLimits != null) {
			return this.computedLimits;
		}

		var len = this.getCount();
		var child = null;
		var ignoreX = false;
		var ignoreY = false;
		var x = this.limits.x;
		var y = this.limits.y;

		for (var i = 0; i < len; ++i) {
			child = this.getAt(i);

			var dx = 0;
			var dy = 0;

			if (!(child instanceof ParallaxCanvasLayer)) {
				continue;
			}

			if (!EngineMath.isInfinity(child.limits.x)) {
				dx = child.limits.x;
			}

			if (EngineMath.isInfinity(child.limits.y)) {
				dy = child.limits.y;
			}

			x = Math.max((EngineMath.isInfinity(x) ? 0 : x), dx);
			y = Math.max((EngineMath.isInfinity(y) ? 0 : y), dy);
		}

		if (ignoreX) {
			x = PositiveInfinity;
		}

		if (ignoreY) {
			y = PositiveInfinity;
		}

		this.computedLimits = new Vector2D(x, y);

		return this.computedLimits;
	}

	invalidateLimits() {
		this.computedLimits = null;
	}

	handleItemAddRemoveEvent(event) {
		this.invalidateLimits();
	}

	handleFrameTickEvent(event) {
		var childWidth = 0;
		var childHeight = 0;
		var width = this.getWidth();
		var height = this.getHeight();
		var tx = 0;
		var ty = 0;
		var lx = 0;
		var ly = 0;
		var len = this.getCount();
		var child = null;
		var hasLimitX = !EngineMath.isInfinity(this.limits.x);
		var hasLimitY = !EngineMath.isInfinity(this.limits.y);

		for (var i = 0; i < len; ++i) {
			child = this.getAt(i);

			if (!(child instanceof ParallaxCanvasLayer)) {
				return;
			}

			childWidth = child.getWidth();
			childHeight = child.getHeight();

			tx = this.position.x;
			ty = this.position.y;
			lx = child.limits.x;
			ly = child.limits.y;

			if (EngineMath.isInfinity(lx) && hasLimitX) {
				lx = this.limits.x;
			}

			if (EngineMath.isInfinity(ly) && hasLimitY) {
				ly = this.limits.y;
			}

			if (Math.abs(tx) > lx && !EngineMath.isInfinity(lx)) {
				tx = (tx < 0 ? -lx : lx);
			}

			if (Math.abs(ty) > ly && !EngineMath.isInfinity(ly)) {
				ty = (ty < 0 ? -ly : ly);
			}

			tx = (width * 0.5) + (tx * child.ratio) + child.offset.x;
			ty = (height * 0.5) + (ty * child.ratio) + child.offset.y;

			child.setX(tx - (width * 0.5));
			child.setY(ty - (height * 0.5));
		}
	}
}

export default ParallaxCanvas;

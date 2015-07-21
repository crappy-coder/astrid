import Canvas from "./Canvas";
import Vector2D from "./math/Vector2D";
import ParallaxCanvas from "./ParallaxCanvas";

class ParallaxCanvasLayer extends Canvas {
	constructor(name) {
		super(name);

		this.ratio = 0;
		this.offset = Vector2D.Zero();
		this.limits = Vector2D.NotSet();
	}

	getRatio() {
		return this.ratio;
	}

	setRatio(value) {
		this.ratio = value;
	}

	getOffset() {
		return this.offset;
	}

	setOffset(value) {
		this.offset = value;
	}

	getLimits() {
		return this.limits;
	}

	setLimits(value) {
		this.limits = value;

		// invalidate the parent limits so it
		// can re-compute if needed
		var parent = this.getParent();

		// make sure it is a parallax instance
		if(parent != null && (parent instanceof ParallaxCanvas))
			parent.invalidateLimits();
	}
}

export default ParallaxCanvasLayer;

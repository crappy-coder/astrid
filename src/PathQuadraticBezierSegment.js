import PathSegment from "./PathSegment";
import Vector2D from "./Vector2D";

class PathQuadraticBezierSegment extends PathSegment {
	constructor(x, y, cx, cy) {
		super(x, y);

		this.cx = cx;
		this.cy = cy;
	}

	mergeBounds(prevSegment, withRect) {
		// start point 
		var x1 = prevSegment != null ? prevSegment.x : 0;
		var y1 = prevSegment != null ? prevSegment.y : 0;

		// min/max bounds 
		var minX = Math.min(this.x, x1);
		var minY = Math.min(this.y, y1);
		var maxX = Math.max(this.x, x1);
		var maxY = Math.max(this.y, y1);

		var tx = this.computeFirstDerivativeRoot(x1, this.cx, this.x);
		var ty = this.computeFirstDerivativeRoot(y1, this.cy, this.y);

		if (tx >= 0 && tx <= 1) {
			var x = this.computeBaseValue(tx, x1, this.cx, this.x);

			minX = Math.min(x, minX);
			maxX = Math.max(x, maxX);
		}

		if (ty >= 0 && ty <= 1) {
			var y = this.computeBaseValue(ty, y1, this.cy, this.y);

			minY = Math.min(y, minY);
			maxY = Math.max(y, maxY);
		}

		withRect.union(minX, minY, maxX, maxY);
	}

	getXAt(t, prevSegment) {
		var x1 = prevSegment != null ? prevSegment.x : 0;

		return this.computeBaseValue(t, x1, this.cx, this.x);
	}

	getYAt(t, prevSegment) {
		var y1 = prevSegment != null ? prevSegment.y : 0;

		return this.computeBaseValue(t, y1, this.cy, this.y);
	}

	computeBaseValue(t, a, b, c) {
		var mt = 1 - t;

		return mt * mt * a + 2 * mt * t * b + t * t * c;
	}

	computeFirstDerivativeRoot(a, b, c) {
		var t = -1;
		var dn = a - 2 * b + c;

		if (dn != 0) {
			t = (a - b) / dn;
		}

		return t;
	}

	getTangent(prevSegment, fromStart) {
		var pt0 = new Vector2D(prevSegment != null ? prevSegment.x : 0, prevSegment != null ? prevSegment.y : 0);
		var pt1 = new Vector2D(this.cx, this.cy);
		var pt2 = new Vector2D(this.x, this.y);

		return this.getCurveTangent(pt0, pt1, pt2, fromStart);
	}

	isEqualTo(other) {
		return (super.isEqualTo(other) && this.cx == other.cx && this.cy == other.cy);
	}
}

export default PathQuadraticBezierSegment;

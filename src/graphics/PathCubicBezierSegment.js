import Equatable from "../Equatable";
import PathSegment from "./PathSegment";
import { AreEqual } from "../Engine";
import Vector2D from "../Vector2D";

class CurvePoints extends Equatable {
	constructor() {
		super();

		this.c1 = null;
		this.c2 = null;
		this.c3 = null;
		this.c4 = null;
		this.a1 = null;
		this.a2 = null;
		this.a3 = null;
		this.a4 = null;
	}

	isEqualTo(other) {
		return (AreEqual(this.c1, other.c1) &&
		AreEqual(this.c2, other.c2) &&
		AreEqual(this.c3, other.c3) &&
		AreEqual(this.c4, other.c4) &&
		AreEqual(this.a1, other.a1) &&
		AreEqual(this.a2, other.a2) &&
		AreEqual(this.a3, other.a3) &&
		AreEqual(this.a4, other.a4));
	}
}

class PathCubicBezierSegment extends PathSegment {
	constructor(x, y, cx1, cy1, cx2, cy2) {
		super(x, y);

		this.cx1 = cx1;
		this.cy1 = cy1;
		this.cx2 = cx2;
		this.cy2 = cy2;
		this.curvePoints = null;
	}

	mergeBounds(prevSegment, withRect) {
		// starting point
		var x1 = prevSegment != null ? prevSegment.x : 0;
		var y1 = prevSegment != null ? prevSegment.y : 0;

		// min/max bounds
		var minX = Math.min(x1, this.x);
		var minY = Math.min(y1, this.y);
		var maxX = Math.max(x1, this.x);
		var maxY = Math.max(y1, this.y);

		var xts = this.computeFirstDerivativeRoots(x1, this.cx1, this.cx2, this.x);
		var yts = this.computeFirstDerivativeRoots(y1, this.cy1, this.cy2, this.y);

		for (var i = 0; i < 2; i++) {
			var tx = xts[i];
			var ty = yts[i];

			if (tx >= 0 && tx <= 1) {
				var x = this.computeBaseValue(tx, x1, this.cx1, this.cx2, this.x);

				minX = Math.min(x, minX);
				maxX = Math.max(x, maxX);
			}

			if (ty >= 0 && ty <= 1) {
				var y = this.computeBaseValue(ty, y1, this.cy1, this.cy2, this.y);

				minY = Math.min(y, minY);
				maxY = Math.max(y, maxY);
			}
		}

		withRect.union(minX, minY, maxX, maxY);
	}

	getCurvePoints(prevSegment) {
		if (this.curvePoints != null) {
			return this.curvePoints;
		}

		this.curvePoints = new CurvePoints();

		var p1 = new Vector2D(prevSegment != null ? prevSegment.x : 0, prevSegment != null ? prevSegment.y : 0);
		var p2 = new Vector2D(this.x, this.y);
		var c1 = new Vector2D(this.cx1, this.cy1);
		var c2 = new Vector2D(this.cx2, this.cy2);

		var pA = c1.interpolate(p1, 0.75);
		var pB = c2.interpolate(p2, 0.75);

		var dx = (p2.x - p1.x) * 0.0625;
		var dy = (p2.y - p1.y) * 0.0625;

		this.curvePoints.c1 = c1.interpolate(p1, 0.375);

		this.curvePoints.c2 = pB.interpolate(pA, 0.375);
		this.curvePoints.c2.x -= dx;
		this.curvePoints.c2.y -= dy;

		this.curvePoints.c3 = pA.interpolate(pB, 0.375);
		this.curvePoints.c3.x += dx;
		this.curvePoints.c3.y += dy;

		this.curvePoints.c4 = c2.interpolate(p2, 0.375);

		this.curvePoints.a1 = this.curvePoints.c1.interpolate(this.curvePoints.c2, 0.5);
		this.curvePoints.a2 = pA.interpolate(pB, 0.5);
		this.curvePoints.a3 = this.curvePoints.c3.interpolate(this.curvePoints.c4, 0.5);
		this.curvePoints.a4 = p2;

		return this.curvePoints;
	}

	getTangent(prevSegment, fromStart) {
		var pt0 = new Vector2D(prevSegment != null ? prevSegment.x : 0, prevSegment != null ? prevSegment.y : 0);
		var pt1 = new Vector2D(this.curvePoints.c1.x, this.curvePoints.c1.y);
		var pt2 = new Vector2D(this.curvePoints.a1.x, this.curvePoints.a1.y);
		var pt3 = new Vector2D(this.curvePoints.c2.x, this.curvePoints.c2.y);
		var pt4 = new Vector2D(this.curvePoints.a2.x, this.curvePoints.a2.y);
		var pt5 = new Vector2D(this.curvePoints.c3.x, this.curvePoints.c3.y);
		var pt6 = new Vector2D(this.curvePoints.a3.x, this.curvePoints.a3.y);
		var pt7 = new Vector2D(this.curvePoints.c4.x, this.curvePoints.c4.y);
		var pt8 = new Vector2D(this.curvePoints.a4.x, this.curvePoints.a4.y);
		var ts = [0, 0];

		if (fromStart) {
			// 1, 2
			ts = this.getCurveTangent(pt0, pt1, pt2, fromStart);

			if (this.isZero(ts)) {
				// 3,4
				ts = this.getCurveTangent(pt0, pt3, pt4, fromStart);

				if (this.isZero(ts)) {
					// 5,6
					ts = this.getCurveTangent(pt0, pt5, pt6, fromStart);

					if (this.isZero(ts)) {
						// 7,8
						ts = this.getCurveTangent(pt0, pt7, pt8, fromStart);
					}
				}
			}
		}
		else {
			// 6,7
			ts = this.getCurveTangent(pt6, pt7, pt8, fromStart);

			if (this.isZero(ts)) {
				// 4,5
				ts = this.getCurveTangent(pt4, pt5, pt8, fromStart);

				if (this.isZero(ts)) {
					// 2,3
					ts = this.getCurveTangent(pt2, pt3, pt8, fromStart);

					if (this.isZero(ts)) {
						// 0,1
						ts = this.getCurveTangent(pt0, pt1, pt8, fromStart);
					}
				}
			}
		}

		return ts;
	}

	isZero(ts) {
		return (ts[0] == 0 && ts[1] == 0);
	}

	computeBaseValue(t, a, b, c, d) {
		var mt = 1 - t;

		return mt * mt * mt * a + 3 * mt * mt * t * b + 3 * mt * t * t * c + t * t * t * d;
	}

	computeFirstDerivativeRoots(a, b, c, d) {
		var ret = [-1, -1];
		var tl = -a + 2 * b - c;
		var tr = -Math.sqrt(-a * (c - d) + b * b - b * (c + d) + c * c);
		var dn = -a + 3 * b - 3 * c + d;

		if (dn != 0) {
			ret[0] = (tl + tr) / dn;
			ret[1] = (tl - tr) / dn;
		}

		return ret;
	}

	computeSecondDerivativeRoot(a, b, c, d) {
		var ret = -1;
		var tt = a - 2 * b + c;
		var dn = a - 3 * b + 3 * c - d;

		if (dn != 0) {
			ret = tt / dn;
		}

		return ret;
	}

	getXAt(t, prevSegment) {
		var x1 = prevSegment != null ? prevSegment.x : 0;

		return this.computeBaseValue(t, x1, this.cx1, this.cx2, this.x);
	}

	getYAt(t, prevSegment) {
		var y1 = prevSegment != null ? prevSegment.y : 0;

		return this.computeBaseValue(t, y1, this.cy1, this.cy2, this.y);
	}

	subdivide(t, prevSegment) {
		var x1 = prevSegment != null ? prevSegment.x : 0;
		var y1 = prevSegment != null ? prevSegment.y : 0;
		var x2 = (1 - t) * x1 + t * this.cx1; 		// p5
		var y2 = (1 - t) * y1 + t * this.cy1;
		var x3 = (1 - t) * this.cx1 + t * this.cx2; 	// p6
		var y3 = (1 - t) * this.cy1 + t * this.cy2;
		var x4 = (1 - t) * this.cx2 + t * this.x; 	// p7
		var y4 = (1 - t) * this.cy2 + t * this.y;
		var x5 = (1 - t) * x2 + t * x3;				// p8
		var y5 = (1 - t) * y2 + t * y3;
		var x6 = (1 - t) * x3 + t * x4;				// p9
		var y6 = (1 - t) * y3 + t * y4;
		var x7 = (1 - t) * x5 + t * x6;				// p10
		var y7 = (1 - t) * y5 + t * y6;
		var curveA = new PathCubicBezierSegment(x7, y7, x2, y2, x5, y5);
		var curveB = new PathCubicBezierSegment(this.x, this.y, x6, y6, x4, y4);

		return [curveA, curveB];
	}

	isEqualTo(other) {
		return (super.isEqualTo(other) && this.cx1 == other.cx1 && this.cy1 == other.cy1 && this.cx2 == other.cx2 &&
		this.cy2 == other.cy2);
	}
}

export default PathCubicBezierSegment;

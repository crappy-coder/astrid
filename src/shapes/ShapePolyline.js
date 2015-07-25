import Shape from "./Shape";
import Rectangle from "./../Rectangle";
import Vector2D from "./../math/Vector2D";

class ShapePolyline extends Shape {
	constructor(name) {
		super(name);

		this.points = [];
		this.closePath = false;
		this.cachedPoints = null;
		this.alwaysMeasure = true;
	}

	getPoints() {
		return this.points;
	}

	setPoints(value) {
		if (value == null) {
			return;
		}

		this.points = value;

		this.invalidateProperties();
		this.requestMeasure();
		this.requestLayout();
	}

	getClosePath() {
		return this.closePath;
	}

	setClosePath(value) {
		if (this.closePath != value) {
			this.closePath = value;
			this.requestLayout();
		}
	}

	// TODO : add better measurement support for calculating the bounds with stroke and miter limit, different line caps/joins, etc..

	getShapeBounds() {
		var xMin = 0;
		var xMax = 0;
		var yMin = 0;
		var yMax = 0;
		var thickness = Math.abs(this.getStrokeThickness());
		var thicknessH = thickness * 0.5;
		var len = this.cachedPoints.length;

		if (len > 1) {
			xMin = xMax = this.cachedPoints[0].x;
			yMin = yMax = this.cachedPoints[0].y;

			for (var i = 1; i < len; ++i) {
				xMin = Math.min(xMin, this.cachedPoints[i].x);
				xMax = Math.max(xMax, this.cachedPoints[i].x);
				yMin = Math.min(yMin, this.cachedPoints[i].y);
				yMax = Math.max(yMax, this.cachedPoints[i].y);
			}

			return Shape.computeLineBounds(xMin, yMin, xMax, yMax, thickness, this.getStrokeLineCap());
		}

		return Rectangle.fromPoints(
				new Vector2D(xMin, yMin),
				new Vector2D(xMax, yMax));
	}

	commitProperties() {
		super.commitProperties();

		this.cachedPoints = [];

		var len = this.points.length;
		var thickness = Math.abs(this.getStrokeThickness());
		var thicknessH = thickness * 0.5;
		var pt = null;

		for (var i = 0; i < len; ++i) {
			pt = this.points[i];
			this.cachedPoints.push(new Vector2D(pt.x + thicknessH, pt.y + thicknessH));
		}
	}

	measure() {
		var bounds = this.getShapeBounds();

		this.setUnscaledWidth(bounds.right());
		this.setUnscaledHeight(bounds.bottom());
	}

	draw(gfx) {
		gfx.drawPoly(this.cachedPoints, !this.closePath);
	}
}

export default ShapePolyline;

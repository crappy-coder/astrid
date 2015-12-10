import GradientBrush from "./GradientBrush";
import Vector2D from "../Vector2D";
import GradientStop from "../graphics/GradientStop";

class LinearGradientBrush extends GradientBrush {
	constructor() {
		super();

		this.setStartPoint(new Vector2D(0, 0));
		this.setEndPoint(new Vector2D(1, 1));
	}

	initializeAnimatablePropertiesCore() {
		super.initializeAnimatablePropertiesCore();

		this.enableAnimatableProperty("startPoint", this.getStartPoint, this.setStartPoint);
		this.enableAnimatableProperty("endPoint", this.getEndPoint, this.setEndPoint);
	}

	getStartPoint() {
		return this.getPropertyValue("startPoint");
	}

	setStartPoint(value) {
		this.setPropertyValue("startPoint", value);
	}

	getEndPoint() {
		return this.getPropertyValue("endPoint");
	}

	setEndPoint(value) {
		this.setPropertyValue("endPoint", value);
	}

	isEqualTo(other) {
		return (super.isEqualTo(other) &&
			astrid.areEqual(this.getStartPoint(), other.getStartPoint()) &&
			astrid.areEqual(this.getEndPoint(), other.getEndPoint()));
	}

	static computeStartPointFromAngle(angle) {
		return astrid.math.pointOfAngle(
				astrid.math.degreesToRadians(180 - (angle % 360))).normalizeZero();
	}

	static computeEndPointFromAngle(angle) {
		return astrid.math.pointOfAngle(
				astrid.math.degreesToRadians(360 - (angle % 360))).normalizeZero();
	}

	static fromGradientStops(stops) {
		var brush = new LinearGradientBrush();
		brush.setColorStops(stops);

		return brush;
	}

	static fromGradientStopsWithAngle(stops, angle) {
		var brush = LinearGradientBrush.fromGradientStops(stops);
		brush.setStartPoint(LinearGradientBrush.computeStartPointFromAngle(angle));
		brush.setEndPoint(LinearGradientBrush.computeEndPointFromAngle(angle));

		return brush;
	}

	static fromColorsWithAngle(startColor, endColor, angle) {
		var stops = [
			new GradientStop(startColor, 0),
			new GradientStop(endColor, 1)
		];

		return LinearGradientBrush.fromGradientStopsWithAngle(stops, angle);
	}
}

export default LinearGradientBrush;

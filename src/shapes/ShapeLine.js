import Shape from "./Shape";
import PropertyOptions from "../ui/PropertyOptions";

class ShapeLine extends Shape {
	constructor(name) {
		super(name);

		this.alwaysMeasure = true;

		this.setX1(0);
		this.setY1(0);
		this.setX2(0);
		this.setY2(0);
	}

	initializeAnimatablePropertiesCore() {
		super.initializeAnimatablePropertiesCore();

		this.enableAnimatableProperty("x1", this.getX1, this.setX1, PropertyOptions.AffectsLayout | PropertyOptions.AffectsMeasure);
		this.enableAnimatableProperty("y1", this.getY1, this.setY1, PropertyOptions.AffectsLayout | PropertyOptions.AffectsMeasure);
		this.enableAnimatableProperty("x2", this.getX2, this.setX2, PropertyOptions.AffectsLayout | PropertyOptions.AffectsMeasure);
		this.enableAnimatableProperty("y2", this.getY2, this.setY2, PropertyOptions.AffectsLayout | PropertyOptions.AffectsMeasure);
	}

	getX1() {
		return this.getPropertyValue("x1");
	}

	setX1(value) {
		this.setPropertyValue("x1", value);
	}

	getY1() {
		return this.getPropertyValue("y1");
	}

	setY1(value) {
		this.setPropertyValue("y1", value);
	}

	getX2() {
		return this.getPropertyValue("x2");
	}

	setX2(value) {
		this.setPropertyValue("x2", value);
	}

	getY2() {
		return this.getPropertyValue("y2");
	}

	setY2(value) {
		this.setPropertyValue("y2", value);
	}

	measure() {
		var bounds = Shape.computeLineBounds(this.getX1(), this.getY1(), this.getX2(), this.getY2(), Math.abs(this.getStrokeThickness()), this.getStrokeLineCap());

		this.setUnscaledWidth(bounds.right());
		this.setUnscaledHeight(bounds.bottom());
	}

	draw(gfx) {
		gfx.drawLine(this.getX1(), this.getY1(), this.getX2(), this.getY2());
	}
}

export default ShapeLine;

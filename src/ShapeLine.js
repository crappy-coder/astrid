import Shape from "./Shape";

class ShapeLine extends Shape {
	constructor(name) {
		super(name);

		/** Number **/
		this.x1 = 0;

		/** Number **/
		this.y1 = 0;

		/** Number **/
		this.x2 = 0;

		/** Number **/
		this.y2 = 0;

		this.alwaysMeasure = true;
	}

	getX1() {
		return this.x1;
	}

	setX1(value) {
		this.x1 = value;
	}

	getY1() {
		return this.y1;
	}

	setY1(value) {
		this.y1 = value;
	}

	getX2() {
		return this.x2;
	}

	setX2(value) {
		this.x2 = value;
	}

	getY2() {
		return this.y2;
	}

	setY2(value) {
		this.y2 = value;
	}

	measure() {
		var bounds = Shape.computeLineBounds(this.x1, this.y1, this.x2, this.y2, Math.abs(this.getStrokeThickness()), this.getStrokeLineCap());

		this.setUnscaledWidth(bounds.right());
		this.setUnscaledHeight(bounds.bottom());
	}

	draw(gfx) {
		gfx.beginPath();
		gfx.drawLine(this.x1, this.y1, this.x2, this.y2);
	}
}

export default ShapeLine;

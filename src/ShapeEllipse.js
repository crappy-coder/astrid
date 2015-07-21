import Shape from "./Shape";

class ShapeEllipse extends Shape {
	constructor(name) {
		super(name);
	}

	draw(gfx) {
		var strokeMetrics = this.getStrokeMetrics();
		var x = strokeMetrics.x;
		var y = strokeMetrics.y;
		var w = this.getWidth() - strokeMetrics.width;
		var h = this.getHeight() - strokeMetrics.height;

		gfx.drawEllipse(x, y, w, h, false);
	}
}

export default ShapeEllipse;

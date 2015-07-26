import Shape from "./Shape";
import PathSegmentCollection from "./../graphics/PathSegmentCollection";

class ShapePath extends Shape {
	constructor(name) {
		super(name);

		this.segments = null;
		this.data = null;
	}

	getData() {
		return this.data;
	}

	setData(value) {
		if (this.data != value) {
			this.data = value;
			this.segments = new PathSegmentCollection(this.data);
		}
	}

	draw(gfx) {
		gfx.drawPath(this.segments);
	}
}

export default ShapePath;

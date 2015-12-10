import GraphicsItemType from "./GraphicsItemType"
import GraphicsItem from "./GraphicsItem"

class GraphicsImageItem extends GraphicsItem {
	constructor(op) {
		super(GraphicsItemType.Image);

		this.imageOp = op;
	}

	computeBounds() {
		var params = this.imageOp.getSecond();
		var x = params.dstX;
		var y = params.dstY;
		var width = params.dstWidth;
		var height = params.dstHeight;
		var mx = params.transform;

		this.bounds.x = x;
		this.bounds.y = y;
		this.bounds.width = width;
		this.bounds.height = height;

		if (mx !== null) {
			this.bounds = mx.transformRect(this.bounds);
		}
	}
}

export default GraphicsImageItem;

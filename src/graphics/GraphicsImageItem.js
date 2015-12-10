import GraphicsItemType from "./GraphicsItemType"
import GraphicsItem from "./GraphicsItem"

class GraphicsImageItem extends GraphicsItem {
	constructor(op) {
		super(GraphicsItemType.Image);

		this.imageOp = op;
	}

	computeBounds() {
		var params = this.imageOp.getSecond();
		var x = params[5];		// dstX
		var y = params[6];		// dstY
		var width = params[7];	// dstWidth
		var height = params[8];	// dstHeight
		var mx = params[9];		// matrix

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

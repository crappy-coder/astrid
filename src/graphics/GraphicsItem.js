import GraphicsItemType from "./GraphicsItemType"
import Rectangle from "../Rectangle"

class GraphicsItem {
	constructor(type) {
		this.type = type;
		this.bounds = new Rectangle();
	}

	computeBounds() {

	}
}

export default GraphicsItem;

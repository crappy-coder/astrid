import PathSegment from "./PathSegment";
import PathMoveSegment from "./PathMoveSegment";

class PathLineSegment extends PathSegment {
	constructor(x, y) {
		super(x, y);
	}

	mergeBounds(prevSegment, withRect) {
		if (prevSegment != null && !(prevSegment instanceof PathMoveSegment)) {
			withRect.union(this.x, this.y, this.x, this.y);
			return;
		}

		var px = prevSegment != null ? prevSegment.x : 0;
		var py = prevSegment != null ? prevSegment.y : 0;

		withRect.union(
				Math.min(this.x, px),
				Math.min(this.y, py),
				Math.max(this.x, px),
				Math.max(this.y, py));
	}

	flatten(steps, prevSegment) {
		return [this];
	}

	getTangent(prevSegment, fromStart) {
		var x1 = prevSegment != null ? prevSegment.x : 0;
		var y1 = prevSegment != null ? prevSegment.y : 0;
		var x2 = this.x;
		var y2 = this.y;

		return [x2 - x1, y2 - y1];
	}
}

export default PathLineSegment;

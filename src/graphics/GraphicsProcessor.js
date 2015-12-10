import GraphicsOp from "./GraphicsOp"
import GraphicsImageItem from "./GraphicsImageItem"
import GraphicsPathItem from "./GraphicsPathItem"
import Rectangle from "../Rectangle"

class GraphicsProcessor {
	constructor() {
		this.items = [];
		this.currentPath = null;
		this.bounds = new Rectangle();
		this.strokedBounds = null;
	}

	process(ops) {
		this.items = [];
		this.currentPath = null;
		this.bounds = new Rectangle();
		this.strokedBounds = null;

		if (ops == null || ops.length == 0) {
			return;
		}

		var len = ops.length;
		var op = null;
		var opType = null;
		var params = null;
		var item = null;

		//***********************************************************************************************
		// process each operation first and group them into items, which can be a path or image item, this
		// give us unique paths to work with, each item should have it's own bounds, that is used for computing
		// the entire bounding rect and more importantly for accurately creating the stroke/fill patterns. we
		// also do this so that we can easily compute the stroked bounds, dashes, etc...
		//***********************************************************************************************
		for (var i = 0; i < len; ++i) {
			op = ops[i];
			opType = op.getFirst();

			switch (opType) {
				case GraphicsOp.BeginPath:
					this.processBeginPath(op);
					break;
				case GraphicsOp.ClosePath:
				case GraphicsOp.MoveTo:
				case GraphicsOp.LineTo:
				case GraphicsOp.CurveTo:
				case GraphicsOp.CubicCurveTo:
					this.processPathOp(op, opType);
					break;
				case GraphicsOp.Image:
				case GraphicsOp.TiledImage:
					this.processImage(op);
					break;
				case GraphicsOp.Text:
					this.processPathOp(op, opType);
					break;
				case GraphicsOp.Fill:
					this.processFillOp(op);
					break;
				case GraphicsOp.Stroke:
					this.processStrokeOp(op);
					break;
			}
		}

		// finish any pending path
		this.finishPathItem();

		// no items were generated, this is possible if we only received path operations with no fill
		// or stroke, there MUST be a fill, stroke or image to be considered a complete item
		if (this.items.length == 0) {
			return;
		}

		//***********************************************************************************************
		// now that we have all the items nicely organized we can go through each one and compute the
		// bounds, the initial non-stroked bounds is computed first, once that is finished we can then
		// compute the stroked bounds, the stroked bounds is what we will use for everything, strokes,
		// fills, hit testing, dirty regions, clips, etc...
		//***********************************************************************************************		
		len = this.items.length;

		for (var i = 0; i < len; ++i) {
			item = this.items[i];

			// compute the item's bounds, if there is a stroke this
			// will also compute the stroked bounds
			item.computeBounds();

			// union the item's bounds with our total bounds
			this.bounds.unionWithRect(item.bounds);

			// might not have a stroke
			if (item.strokedBounds != null) {
				// union the item's stroked bounds with our total stroked bounds
				if (this.strokedBounds == null) {
					this.strokedBounds = new Rectangle();
				}

				this.strokedBounds.unionWithRect(item.strokedBounds);
			}
		}
	}

	ensurePathItem() {
		if (this.currentPath == null) {
			this.currentPath = new GraphicsPathItem();
			this.currentPath.beginSegments();
		}
	}

	finishPathItem() {
		// add the current path
		if (this.currentPath != null) {
			// the current path is only valid if it has a stroke or a fill, otherwise
			// there is nothing to do
			if (this.currentPath.strokeOp != null || this.currentPath.fillOp != null) {
				this.items.push(this.currentPath);
			}

			this.currentPath = null;
		}
	}

	processBeginPath(op) {
		this.finishPathItem();

		this.processPathOp(op);
	}

	processPathOp(op, opType) {
		this.ensurePathItem();
		this.currentPath.ops.push(op);

		var params = op.getSecond();

		switch (opType) {
			case GraphicsOp.ClosePath:
				this.currentPath.closePath();
				break;
			case GraphicsOp.MoveTo:
				this.currentPath.moveTo(params[0]);
				break;
			case GraphicsOp.LineTo:
			case GraphicsOp.CurveTo:
			case GraphicsOp.CubicCurveTo:
				this.currentPath.pathTo(params[0]);
				break;
			case GraphicsOp.Text:

				this.currentPath.text(params[0], params[1], params[2], params[3]);
				break;
		}
	}

	processFillOp(op) {
		if (this.currentPath == null) {
			return;
		}

		this.currentPath.fillOp = op;
		this.currentPath.paintOps.push(op);
	}

	processStrokeOp(op) {
		if (this.currentPath == null) {
			return;
		}

		this.currentPath.strokeOp = op;
		this.currentPath.paintOps.push(op);
	}

	processImage(op) {
		this.items.push(new GraphicsImageItem(op));
	}
}

export default GraphicsProcessor;

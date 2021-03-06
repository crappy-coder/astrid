import GraphicsItemType from "./GraphicsItemType"
import GraphicsItem from "./GraphicsItem"
import PathLineSegment from "./PathLineSegment"
import PathMoveSegment from "./PathMoveSegment"
import Rectangle from "../Rectangle"
import Vector2D from "../Vector2D";

class GraphicsPathItem extends GraphicsItem {
	constructor() {
		super(GraphicsItemType.Path);

		this.fillOp = null;
		this.strokeOp = null;
		this.strokedBounds = null;
		this.lastMoveSegment = null;
		this.lastSegment = null;
		this.paintOps = [];
		this.ops = [];
		this.segments = null;
	}

	beginSegments() {
		this.lastMoveSegment = null;
		this.lastSegment = null;
		this.segments = [];
	}

	computeBounds() {
		if (this.ops.length === 0) {
			return;
		}

		//**************************************************************************
		//* NOTE: instead of computing the initial bounds here this process has
		//*       been merged to occur during the main process method, this allows
		//*       use to remove an extra loop
		//**************************************************************************

		// now that we have the initial bounds, we can compute the final stroked bounds
		// this only needs to happen if we actually have a stroke, otherwise we're done
		if (this.strokeOp !== null) {
			var penInfo = this.strokeOp.getSecond();
			var thickness = penInfo.thickness;
			var thicknessHalf = (thickness * 0.5);
			var metrics = new Rectangle(-thicknessHalf, -thicknessHalf, thickness, thickness);
			var miterLimit = Math.max(penInfo.miterLimit, 1);
			var joinType = penInfo.lineJoin;

			// initialize with the non-stroked bounds
			this.strokedBounds = Rectangle.fromRect(this.bounds);

			// we will always need to adjust the bounds by the stroke thickness, centered on the outline
			this.strokedBounds.inflate(metrics.right(), metrics.bottom());

			// TODO : need to figure in SQUARE and ROUND line caps, square is close but round pushes
			//        beyond the bounds in some cases so we need to apply an extra half a stroke (?)
			//        to non-connecting segments.

			if (joinType !== "miter") {
				return;
			}

			// if we have a miter join, then we will need to adjust for that as well, this is
			// not perfect, but it should be good enough to always extend the bounds of the 
			// path
			this.computeMiterJoins(metrics, miterLimit);
		}
	}

	computeMiterJoins(strokeMetrics, miterLimit) {
		var count = this.segments.length;
		var jointStartIndex = 0;
		var jointStartSeg = null;
		var jointEndIndex = -1;
		var jointEndSeg = null;
		var openIndex = 0;
		var moveX = 0;
		var moveY = 0;

		while (true) {
			// locate the first operation with a valid tangent or a move operation
			while (jointStartIndex < count && !(this.segments[jointStartIndex] instanceof PathMoveSegment)) {
				var prevSeg = jointStartIndex > 0 ? this.segments[jointStartIndex - 1] : null;

				if (this.segments[jointStartIndex].hasValidTangent(prevSeg)) {
					break;
				}

				jointStartIndex++;
			}

			// no valid operations found
			if (jointStartIndex >= count) {
				break;
			}


			// get the operation that we will begin at
			jointStartSeg = this.segments[jointStartIndex];

			// we found an 'open' operation, save the position and try to use the
			// next operation as the starting point
			if (jointStartSeg instanceof PathMoveSegment) {
				openIndex = jointStartIndex + 1;
				moveX = jointStartSeg.x;
				moveY = jointStartSeg.y;

				jointStartIndex++;
				continue;
			}

			// the current and previous operation are 'closed' and form a joint 
			if ((jointStartIndex === (count - 1) || (this.segments[jointStartIndex + 1] instanceof PathMoveSegment) && jointStartSeg.x === moveX && jointStartSeg.y === moveY)) {
				jointEndIndex = openIndex;
			}
			// move to the next operation
			else {
				jointEndIndex = jointStartIndex + 1;
			}

			// now locate the ending operation with a valid tangent or a move operation
			while (jointEndIndex < count && !(this.segments[jointEndIndex] instanceof PathMoveSegment)) {
				if (this.segments[jointEndIndex].hasValidTangent(jointStartSeg)) {
					break;
				}

				jointEndIndex++;
			}

			// no valid operations found
			if (jointEndIndex >= count) {
				break;
			}


			// get the operation that we will finish at
			jointEndSeg = this.segments[jointEndIndex];

			// if the end operation is not a move, then we have a valid a joint, adjust
			// our bounds to include the miter
			if (!(jointEndSeg instanceof PathMoveSegment)) {
				this.adjustBoundsForMiter(
						jointStartIndex > 0 ? this.segments[jointStartIndex - 1] : null,
						jointStartSeg,
						jointEndSeg,
						miterLimit,
						strokeMetrics.width * 0.5);
			}

			// move to the next operation, it's possible the end operation comes before
			// the starting operation because of closed paths
			jointStartIndex = jointStartIndex >= jointEndIndex ? jointStartIndex + 1 : jointEndIndex;
		}
	}

	ensureSubPath(segment) {
		// if there isn't a previous move segment then we must assume
		// the current segment as an implicit move
		//
		// for example:
		//      beginPath();
		//                    <-- no explicit move
		//      lineTo(0,0);  <-- assume implicit move
		//      lineTo(100, 0);
		//
		if (this.lastMoveSegment === null) {
			this.lastMoveSegment = segment;
		}
	}

	closePath() {

		// if the last move segment is not the same as the last path segment
		// then we need make a straight line from the last segment to the
		// last move segment
		if (this.lastMoveSegment !== null && this.lastSegment !== null) {
			if (this.lastSegment.x !== this.lastMoveSegment.x || this.lastSegment.y !== this.lastMoveSegment.y) {
				this.segments.push(new PathLineSegment(this.lastMoveSegment.x, this.lastMoveSegment.y));
			}
		}

		this.lastMoveSegment = null;
	}

	moveTo(segment) {
		this.segments.push(segment);

		// we're starting a new sub-path
		this.lastSegment = this.lastMoveSegment = segment;
	}

	pathTo(segment) {
		// adjust the current bounds to include this segment
		this.adjustBoundsForSegment(segment);

		// see ensureSubPath for details
		this.ensureSubPath(segment);

		// add this segment, these will be used for rendering and computing
		// the stroked bounds
		this.segments.push(segment);

		// we need to keep a reference to the last segment so we can close out
		// the path (if required) and more importantly to adjust the bounds,
		// since we need two segments for accuracy
		this.lastSegment = segment;
	}

	text(text, x, y, font) {
		var size = font.measureString(text);

		// the text is quite simple, we don't render individual text glyphs (yet)
		// so we can only add the measured approximate rendered bounds, but it
		// seems to be good enough
		this.bounds.union(x, y, x + size.width, y + size.height);
	}

	adjustBoundsForSegment(segment) {
		// merge the segments bounds into our bounds
		if (segment !== null) {
			segment.mergeBounds(this.lastSegment, this.bounds);
		}
	}

	adjustBoundsForMiter(op0, op1, op2, miterLimit, weight) {
		// joint tip
		var jointX = op1.x;
		var jointY = op1.y;

		// end tangent for first operation
		var t0 = new Vector2D();
		var ts1 = op1.getTangent(op0, false);

		t0.x = ts1[0];
		t0.y = ts1[1];

		// start tangent for second operation
		var t1 = new Vector2D();
		var ts2 = op2.getTangent(op1, true);

		t1.x = ts2[0];
		t1.y = ts2[1];


		// we must have at least one valid tangent
		if (t0.length() === 0 || t1.length() === 0) {
			return;
		}

		// convert the tangents to unit vectors
		t1.normalize(1);
		t0.normalize(1);
		t0.x = -t0.x;
		t0.y = -t0.y;

		// find the vector from t0 to the mid-point of [t0,t1]
		var midPoint = new Vector2D(
				(t1.x - t0.x) * 0.5,
				(t1.y - t0.y) * 0.5);

		// sin(A/2) == midPoint.length() / t1.length()
		var alpha = midPoint.length();

		// ensure that we skip any degenerate joints that are close to 0 degrees
		if (Math.abs(alpha) < 1.0E-9) {
			return;
		}

		// find the vector of the bisect
		var bisect = new Vector2D(
				(t0.x + t1.x) * -0.5,
				(t0.y + t1.y) * -0.5);

		// joint is at 180 degrees, nothing to do
		if (bisect.length() === 0) {
			return;
		}

		// compute based on the set miter limit
		if (alpha === 0 || miterLimit < (1 / alpha)) {
			// normalize the mid point first, we need the bisect vector
			midPoint.normalize((weight - miterLimit * weight * alpha) / bisect.length());

			// convert bisect to a unit vector
			bisect.normalize(1);

			var px = jointX + miterLimit * weight * bisect.x + midPoint.x;
			var py = jointY + miterLimit * weight * bisect.y + midPoint.y;

			this.strokedBounds.union(px, py, px, py);

			px = jointX + miterLimit * weight * bisect.x - midPoint.x;
			py = jointY + miterLimit * weight * bisect.y - midPoint.y;

			this.strokedBounds.union(px, py, px, py);
		}
		else {
			// the miter limit was not reached so add the tip of the stroke
			bisect.normalize(1);

			var tipX = jointX + bisect.x * weight / alpha;
			var tipY = jointY + bisect.y * weight / alpha;

			// adjust the current path rect
			this.strokedBounds.union(tipX, tipY, tipX, tipY);
		}
	}
}

export default GraphicsPathItem;

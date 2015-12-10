import Equatable from "../Equatable";
import Line from "../Line";

class PathSegment extends Equatable {
	constructor(x, y) {
		super();

		this.x = astrid.valueOrDefault(x, 0);
		this.y = astrid.valueOrDefault(y, 0);
		this.flatSegments = null;
		this.isStartSegment = false;
	}

	getXAt(t, prevSegment) {
		return this.x;
	}

	getYAt(t, prevSegment) {
		return this.y;
	}

	hasValidTangent(prevSegment) {
		var ts = this.getTangent(prevSegment, true);

		return (ts[0] != 0 || ts[1] != 0);
	}

	getTangent(prevSegment, fromStart) {
		return [0, 0];
	}

	mergeBounds(prevSegment, withRect) {
		/** override **/
	}

	isEqualTo(other) {
		return (this.x == other.x && this.y == other.y);
	}

	flatten(steps, prevSegment) {
		if (this.flatSegments != null) {
			return this.flatSegments;
		}

		this.flatSegments = [];

		var step = 1.0 / steps;
		var sx = this.getXAt(0, prevSegment);
		var sy = this.getYAt(0, prevSegment);
		var line = new this.constructor(sx, sy);

		this.flatSegments.push(line);

		for (var t = step; t < 1.0; t += step) {
			var nx = this.getXAt(t, prevSegment);
			var ny = this.getYAt(t, prevSegment);

			line = new this.constructor(nx, ny);
			this.flatSegments.push(line);
		}

		line = new this.constructor(this.getXAt(1, prevSegment), this.getYAt(1, prevSegment));
		this.flatSegments.push(line);

		return this.flatSegments;
	}

	flattenForThreshold(threshold, prevSegment) {
		if (this.flatSegments != null) {
			return this.flatSegments;
		}

		this.flatSegments = [];

		var x1 = this.getXAt(0, prevSegment);
		var y1 = this.getYAt(0, prevSegment);
		var x2 = x1;
		var y2 = y1;
		var lastLine = new Line(x1, y1, x2, y2);
		var testLine = null;
		var pixelCount = 0;
		var steps = 200;
		var xcoords = new Array(steps);
		var ycoords = new Array(steps);
		var pos = 0;
		var step = 1.0 / steps;

		xcoords[pos] = x1;
		ycoords[pos++] = y1;

		for (var t = step; t < 1.0; t += step) {
			x2 = this.getXAt(t, prevSegment);
			y2 = this.getYAt(t, prevSegment);

			xcoords[pos] = x2;
			ycoords[pos++] = x2;

			testLine = new Line(x1, y1, x2, y2);
			pixelCount = testLine.getPixelsOutside(xcoords, ycoords, pos);

			if (pixelCount > threshold) {
				this.flatSegments.push(new this.constructor(lastLine.x1, lastLine.y1, lastLine.x2, lastLine.y2));

				x1 = lastLine.x2;
				y1 = lastLine.y2;

				lastLine.x1 = x1;
				lastLine.y1 = y1;
				lastLine.x2 = x2;
				lastLine.y2 = y2;

				xcoords = new Array(steps);
				ycoords = new Array(steps);
				pos = 0;

				xcoords[pos] = x1;
				ycoords[pos++] = y1;
			}
			else {
				lastLine = testLine;
			}
		}

		this.flatSegments.push(new this.constructor(x1, y1, this.getXAt(1, prevSegment), this.getYAt(1, prevSegment)));

		return this.flatSegments;
	}

	getCurveTangent(pt0, pt1, pt2, fromStart) {
		var x = 0;
		var y = 0;

		if (fromStart) {
			if (pt0.x == pt1.x && pt0.y == pt1.y) {
				x = pt2.x - pt0.x;
				y = pt2.y - pt0.y;
			}
			else {
				x = pt1.x - pt0.x;
				y = pt1.y - pt0.y;
			}
		}
		else {
			if (pt2.x == pt1.x && pt2.y == pt1.y) {
				x = pt2.x - pt0.x;
				y = pt2.y - pt0.y;
			}
			else {
				x = pt2.x - pt1.x;
				y = pt2.y - pt1.y;
			}
		}

		return [x, y];
	}
}

export default PathSegment;

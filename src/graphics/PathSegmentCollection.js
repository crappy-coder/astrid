import Equatable from "./../Equatable";
import Rectangle from "./../Rectangle";
import PathMoveSegment from "./PathMoveSegment";
import PathQuadraticBezierSegment from "./PathQuadraticBezierSegment";
import PathCubicBezierSegment from "./PathCubicBezierSegment";
import PathLineSegment from "./PathLineSegment";

class PathSegmentCollection extends Equatable {
	constructor(data) {
		this.segments = [];
		this.boundsRect = null;
		this.charPos = 0;
		this.dataLength = 0;

		if (data != null) {
			this.parse(data);
		}
	}

	clear() {
		this.segments = [];
	}

	getBounds() {
		if (this.boundsRect != null) {
			return this.boundsRect;
		}

		this.boundsRect = new Rectangle(0, 0, 0, 0);

		var currentSegment = null;
		var prevSegment = null;
		var len = this.segments.length;

		for (var i = 0; i < len; ++i) {
			currentSegment = this.segments[i];
			currentSegment.mergeBounds(prevSegment, this.boundsRect);

			prevSegment = currentSegment;
		}

		return this.boundsRect;
	}

	isEqualTo(other) {
		// TODO
		return (this == other);
	}

	parse(data) {
		var charCount = data.length;
		var ch;
		var relative = false;
		var prevId = 0;
		var prevX = 0;
		var prevY = 0;
		var lastMoveX = 0;
		var lastMoveY = 0;
		var lastMoveSegmentIndex = -1;
		var segmentIndex = -1;
		var x = 0;
		var y = 0;
		var cx1 = 0;
		var cy1 = 0;
		var cx2 = 0;
		var cy2 = 0;

		this.dataLength = charCount;
		this.charPos = 0;

		while (true) {
			this.skipWhitespace(data);

			if (this.charPos >= this.dataLength) {
				break;
			}

			ch = data.charCodeAt(this.charPos++);

			if ((ch >= 0x30 && ch < 0x3A) ||   // A digit
				(ch == 0x2B || ch == 0x2D) ||  // '+' & '-'
				(ch == 0x2E))                  // '.'
			{
				ch = prevId;
				this.charPos--;
			}
			else if (ch >= 0x41 && ch <= 0x56) // Between 'C' and 'V' 
			{
				relative = false;
			} else if (ch >= 0x61 && ch <= 0x7A) // Between 'c' and 'v'
			{
				relative = true;
			}

			switch (ch) {
			case 0x6D:  // m
			case 0x4D:  // M
				x = this.parseNumber(prevX, data, relative);
				y = this.parseNumber(prevY, data, relative);

				this.segments.push(new PathMoveSegment(x, y));

				prevX = x;
				prevY = y;
				prevId = (ch == 0x6D) ? 0x6C : 0x4C; // c == 'm' ? 'l' : 'L'

				segmentIndex = this.segments.length - 1;

				if (lastMoveSegmentIndex + 2 == segmentIndex &&
					(this.segments[lastMoveSegmentIndex + 1] instanceof PathQuadraticBezierSegment)) {
					// Insert a dummy LineSegment
					this.segments.splice(lastMoveSegmentIndex + 1, 0, new PathLineSegment(lastMoveX, lastMoveY));
					segmentIndex++;
				}

				lastMoveSegmentIndex = segmentIndex;
				lastMoveX = x;
				lastMoveY = y;
				break;

			case 0x63:  // c
			case 0x43:  // C
				cx1 = this.parseNumber(prevX, data, relative);
				cy1 = this.parseNumber(prevY, data, relative);
				cx2 = this.parseNumber(prevX, data, relative);
				cy2 = this.parseNumber(prevY, data, relative);
				x = this.parseNumber(prevX, data, relative);
				y = this.parseNumber(prevY, data, relative);

				this.segments.push(new PathCubicBezierSegment(x, y, cx1, cy1, cx2, cy2));

				prevX = x;
				prevY = y;
				prevId = 0x63;
				break;

			case 0x71:  // q
			case 0x51:  // Q
				cx1 = this.parseNumber(prevX, data, relative);
				cy1 = this.parseNumber(prevY, data, relative);
				x = this.parseNumber(prevX, data, relative);
				y = this.parseNumber(prevY, data, relative);

				this.segments.push(new PathQuadraticBezierSegment(x, y, cx1, cy1));

				prevX = x;
				prevY = y;
				prevId = 0x71;
				break;

			case 0x6C:  // l
			case 0x4C:  // L
				x = this.parseNumber(prevX, data, relative);
				y = this.parseNumber(prevY, data, relative);

				this.segments.push(new PathLineSegment(x, y));

				prevX = x;
				prevY = y;
				prevId = 0x6C;
				break;

			case 0x68:  // h
			case 0x48:  // H
				x = this.parseNumber(prevX, data, relative);
				y = prevY;

				this.segments.push(new PathLineSegment(x, y));

				prevX = x;
				prevY = y;
				prevId = 0x68;
				break;

			case 0x76:  // v
			case 0x56:  // V
				x = prevX;
				y = this.parseNumber(prevY, data, relative);

				this.segments.push(new PathLineSegment(x, y));

				prevX = x;
				prevY = y;
				prevId = 0x76;
				break;

			case 0x74:  // t
			case 0x54:  // T
				// control is a reflection of the previous control point
				if (prevId == 0x74 || prevId == 0x71) // 't' or 'q'
				{
					cx1 = prevX + (prevX - cx1);
					cy1 = prevY + (prevY - cy1);
				}
				else {
					cx1 = prevX;
					cy1 = prevY;
				}

				x = this.parseNumber(prevX, data, relative);
				y = this.parseNumber(prevY, data, relative);

				this.segments.push(new PathQuadraticBezierSegment(x, y, cx1, cy1));

				prevX = x;
				prevY = y;
				prevId = 0x74;
				break;

			case 0x73:  // s
			case 0x53:  // S
				if (prevId == 0x73 || prevId == 0x63) // s or c
				{
					cx1 = prevX + (prevX - cx2);
					cy1 = prevY + (prevY - cy2);
				}
				else {
					cx1 = prevX;
					cy1 = prevY;
				}

				cx2 = this.parseNumber(prevX, data, relative);
				cy2 = this.parseNumber(prevY, data, relative);
				x = this.parseNumber(prevX, data, relative);
				y = this.parseNumber(prevY, data, relative);

				this.segments.push(new PathCubicBezierSegment(x, y, cx1, cy1, cx2, cy2));

				prevX = x;
				prevY = y;
				prevId = 0x73;
				break;

			case 0x7A:  // z
			case 0x5A:  // Z
				x = lastMoveX;
				y = lastMoveY;

				this.segments.push(new PathLineSegment(x, y));

				prevX = x;
				prevY = y;
				prevId = 0x7A;
				break;

			default:
				throw new Error("Unknown path command found: '" + ch + "'");
			}
		}

		segmentIndex = this.segments.length;

		if ((lastMoveSegmentIndex + 2) == segmentIndex &&
			(this.segments[lastMoveSegmentIndex + 1] instanceof PathQuadraticBezierSegment)) {
			this.segments.splice(lastMoveSegmentIndex + 1, 0, new PathLineSegment(lastMoveX, lastMoveY));
		}
	}

	skipWhitespace(data) {

		while (this.charPos < this.dataLength) {
			var c = data.charCodeAt(this.charPos);

			if (c != 0x20 && // Space
				c != 0x2C && // Comma
				c != 0xD && // Carriage return
				c != 0x9 && // Tab
				c != 0xA)    // New line
			{
				break;
			}

			this.charPos++;
		}
	}

	parseNumber(offset, value, relative) {
		// Parse the string and find the first occurrance of the following RexExp
		// numberRegExp:RegExp = /[+-]?\d*\.?\d+([Ee][+-]?\d+)?/g;

		this.skipWhitespace(value); // updates _charPos

		if (this.charPos >= this.dataLength) {
			return NaN;
		}

		// Remember the start of the number
		var numberStart = this.charPos;
		var hasDigits = false;

		// The number could start with '+' or '-' (the "[+-]?" part of the RegExp)
		var c = value.charCodeAt(this.charPos);
		if (c == 0x2B || c == 0x2D) // '+' or '-'
		{
			this.charPos++;
		}

		// The index of the '.' if any
		var dotIndex = -1;

		// First sequence of digits and optional dot in between (the "\d*\.?\d+" part of the RegExp)
		while (this.charPos < this.dataLength) {
			c = value.charCodeAt(this.charPos);

			if (c >= 0x30 && c < 0x3A) // A digit
			{
				hasDigits = true;
			}
			else if (c == 0x2E && dotIndex == -1) // '.'
			{
				dotIndex = this.charPos;
			}
			else {
				break;
			}

			this.charPos++;
		}

		// Now check whether we had at least one digit.
		if (!hasDigits) {
			// Go to the end of the data
			this.charPos = this.dataLength;
			return NaN;
		}

		// 1. Was the last character a '.'? If so, rewind one character back.
		if (c == 0x2E) {
			this.charPos--;
		}

		// So far we have a valid number, remember its end character index
		var numberEnd = this.charPos;

		// Check to see if we have scientific notation (the "([Ee][+-]?\d+)?" part of the RegExp)
		if (c == 0x45 || c == 0x65) {
			this.charPos++;

			// Check for '+' or '-'
			if (this.charPos < this.dataLength) {
				c = value.charCodeAt(this.charPos);
				if (c == 0x2B || c == 0x2D) {
					this.charPos++;
				}
			}

			// Find all the digits
			var digitStart = this.charPos;
			while (this.charPos < this.dataLength) {
				c = value.charCodeAt(this.charPos);

				// Not a digit?
				if (!(c >= 0x30 && c < 0x3A)) {
					break;
				}

				this.charPos++;
			}

			// Do we have at least one digit?
			if (digitStart < this.charPos) {
				numberEnd = this.charPos;
			}// Scientific notation, update the end index of the number.
			else {
				this.charPos = numberEnd;
			} // No scientific notation, rewind back to the end index of the number.
		}

		// Use parseFloat to get the actual number.
		// TODO (egeorgie): we could build the number while matching the RegExp which will save the substr and parseFloat
		var subString = value.substr(numberStart, numberEnd - numberStart);
		var result = parseFloat(subString);

		if (isNaN(result)) {
			// Go to the end of the data
			this.charPos = this.dataLength;
			return NaN;
		}

		this.charPos = numberEnd;

		return relative ? result + offset : result;
	}
}

export default PathSegmentCollection;

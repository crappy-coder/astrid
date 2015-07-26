import Equatable from "./Equatable";
import StringTokenizer from "./text/StringTokenizer";
import { ValueOrDefault } from "./Engine";
import Vector2D from "./Vector2D";
import Size from "./Size";
import { PositiveInfinity, NegativeInfinity } from "./EngineMath";

class Rectangle extends Equatable {
	constructor(x, y, width, height) {
		super();

		this.x = ValueOrDefault(x, 0);
		this.y = ValueOrDefault(y, 0);
		this.width = ValueOrDefault(width, 0);
		this.height = ValueOrDefault(height, 0);
	}

	top() {
		return this.y;
	}

	bottom() {
		return (this.y + this.height);
	}

	left() {
		return this.x;
	}

	right() {
		return (this.x + this.width);
	}

	topLeft() {
		return new Vector2D(this.left(), this.top());
	}

	topRight() {
		return new Vector2D(this.right(), this.top());
	}

	bottomLeft() {
		return new Vector2D(this.left(), this.bottom());
	}

	bottomRight() {
		return new Vector2D(this.right(), this.bottom());
	}

	position() {
		return new Vector2D(this.x, this.y);
	}

	size() {
		return new Size(this.width, this.height);
	}

	center(local) {
		if (local) {
			return new Vector2D(this.width * 0.5, this.height * 0.5);
		}

		return new Vector2D(this.x + (this.width * 0.5), this.y + (this.height * 0.5));
	}

	area() {
		return (this.width * this.height);
	}

	scale(scaleX, scaleY) {
		if (!this.isEmpty()) {
			this.x *= scaleX;
			this.y *= scaleY;
			this.width *= scaleX;
			this.height *= scaleY;

			if (scaleX < 0) {
				this.x += this.width;
				this.width *= -1;
			}

			if (scaleY < 0) {
				this.y += this.height;
				this.height *= -1;
			}
		}

		return this;
	}

	inflate(byX, byY) {
		if (this.isEmpty()) {
			return this;
		}

		this.x -= byX;
		this.y -= byY;
		this.width += byX;
		this.width += byX;
		this.height += byY;
		this.height += byY;

		if (this.width < 0 || this.height < 0) {
			this.x = PositiveInfinity;
			this.y = PositiveInfinity;
			this.width = NegativeInfinity;
			this.height = NegativeInfinity;
		}

		return this;
	}

	offset(x, y) {
		this.x += x;
		this.y += y;

		return this;
	}

	clamp(x, y, width, height) {
		this.x = Math.max(this.x, x);
		this.y = Math.max(this.y, y);
		this.width = Math.min(this.width, width);
		this.height = Math.min(this.height, height);

		return this;
	}

	union(left, top, right, bottom) {
		if (this.isZero()) {
			this.initialize(left, top, right - left, bottom - top);
			return this;
		}

		var minX = Math.min(this.x, left);
		var minY = Math.min(this.y, top);
		var maxX = Math.max(this.right(), right);
		var maxY = Math.max(this.bottom(), bottom);

		this.x = minX;
		this.y = minY;
		this.width = maxX - minX;
		this.height = maxY - minY;

		return this;
	}

	unionWithPoint(pt) {
		return this.unionWithRect(new Rectangle(pt.x, pt.y, pt.x, pt.y));
	}

	unionWithRect(rect) {
		if (this.isZero()) {
			this.initialize(rect.x, rect.y, rect.width, rect.height);
			return this;
		}

		return this.union(rect.left(), rect.top(), rect.right(), rect.bottom());
	}

	contains(x, y) {
		if (this.isZero()) {
			return false;
		}

		return ((x >= this.x) && ((x - this.width) <= this.x) && (y >= this.y) && ((y - this.height) <= this.y));
	}

	containsPoint(pt) {
		return this.contains(pt.x, pt.y);
	}

	containsRect(rect) {
		if (this.isZero() || rect.isZero()) {
			return false;
		}

		return ((this.x <= rect.x) && (this.y <= rect.y) && (this.right() >= rect.right()) &&
		(this.bottom() >= rect.bottom()));
	}

	intersect(rect) {
		var left = Math.max(this.x, rect.x);
		var top = Math.max(this.y, rect.y);
		var right = Math.min(this.right(), rect.right());
		var bottom = Math.min(this.bottom(), rect.bottom());

		if (right <= left || bottom <= top) {
			return Rectangle.Zero();
		}

		return new Rectangle(left, top, right - left, bottom - top);
	}

	intersects(rect) {
		if (this.isEmpty() || this.isZero() || rect.isZero()) {
			return false;
		}

		return (rect.right() > this.x &&
		rect.bottom() > this.y &&
		rect.x < this.right() &&
		rect.y < this.bottom());
	}

	round() {
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);
		this.width = Math.ceil(this.width);
		this.height = Math.ceil(this.height);

		return this;
	}

	isZero() {
		return (this.x == 0 && this.y == 0 && this.width == 0 && this.height == 0);
	}

	isEmpty() {
		return (this.width < 0.0);
	}

	isEqualTo(obj) {
		return (this.x == obj.x && this.y == obj.y && this.width == obj.width && this.height == obj.height);
	}

	toString() {
		if (this.isEmpty()) {
			return "empty";
		}

		return (this.x + "," + this.y + "," + this.width + "," + this.height);
	}

	toIntRect() {
		var rect = new Rectangle(this.x, this.y, this.width, this.height);

		return rect.round();
	}

	static Empty() {
		return new Rectangle(PositiveInfinity, PositiveInfinity, NegativeInfinity, NegativeInfinity);
	}

	static Zero() {
		return new Rectangle(0, 0, 0, 0);
	}

	static fromPoints(p1, p2) {
		var x = Math.min(p1.x, p2.x);
		var y = Math.min(p1.y, p2.y);
		var width = Math.max(Math.max(p1.x, p2.x) - x, 0);
		var height = Math.max(Math.max(p1.y, p2.y) - y, 0);

		return new Rectangle(x, y, width, height);
	}

	static parse(str) {
		if (str == "empty") {
			return Rectangle.Empty();
		}

		var tokenizer = new StringTokenizer(str);
		var x = parseFloat(tokenizer.next());
		var y = parseFloat(tokenizer.next());
		var width = parseFloat(tokenizer.next());
		var height = parseFloat(tokenizer.next());

		return new Rectangle(x, y, width, height);
	}
}

export default Rectangle;

import Equatable from "./Equatable";

class Vector2D extends Equatable {
	constructor(x, y) {
		super();
		
		this.x = astrid.valueOrDefault(x, 0);
		this.y = astrid.valueOrDefault(y, 0);
	}

	add(vector) {
		return new Vector2D(
				this.x + vector.x,
				this.y + vector.y);
	}

	subtract(vector) {
		return new Vector2D(
				this.x - vector.x,
				this.y - vector.y);
	}

	multiply(vector) {
		return new Vector2D(
				this.x * vector.x,
				this.y * vector.y);
	}

	divide(vector) {
		return new Vector2D(
				this.x / vector.x,
				this.y / vector.y);
	}

	interpolate(vector, level) {
		return new Vector2D(
				this.x + vector.x * level,
				this.y + vector.y * level);
	}

	negate() {
		return new Vector2D(-this.x, -this.y);
	}

	length() {
		return Math.sqrt(this.lengthSquared());
	}

	lengthSquared() {
		return (this.x * this.x + this.y * this.y);
	}

	distance(vector) {
		return this.subtract(vector).length();
	}

	distanceSquared(vector) {
		return this.subtract(vector).lengthSquared();
	}

	dotProduct(vector) {
		return (this.x * vector.x + this.y * vector.y);
	}

	crossProduct(vector) {
		return (this.x * vector.y - this.y * vector.x);
	}

	normalize(thickness) {
		thickness = astrid.valueOrDefault(thickness, 1);

		var len = this.length();

		if (len == 0) {
			this.x = this.y = 0;
		}
		else {
			len = thickness / len;

			this.x = this.x * len;
			this.y = this.y * len;
		}
	}

	normalizeZero() {
		this.x = astrid.math.normalizeZero(this.x);
		this.y = astrid.math.normalizeZero(this.y);

		return this;
	}

	angle(point) {
		var delta = point.subtract(this);

		return astrid.math.radiansToDegrees(Math.atan2(delta.y, delta.x));
	}

	pointTo(distance, angle) {
		var rads = astrid.math.degreesToRadians(angle);

		return new Vector2D(
				this.x + distance * Math.cos(rads),
				this.y + distance * Math.sin(rads)
		);
	}

	midPoint(vector) {
		return new Vector2D(
				(this.x + vector.x) * 0.5,
				(this.y + vector.y) * 0.5);
	}

	rotate(angle) {
		var r = astrid.math.degreesToRadians(angle);
		var x = this.x * Math.cos(-r) + this.y * Math.sin(-r);
		var y = -this.x * Math.sin(-r) + this.y * Math.cos(-r);

		return new Vector2D(x, y);
	}

	isLessThan(vector) {
		return (this.x < vector.x && this.y < vector.y);
	}

	isGreaterThan(vector) {
		return (this.x > vector.x && this.y > vector.y);
	}

	isEqualTo(obj) {
		return (this.x == obj.x && this.y == obj.y);
	}

	isZero() {
		return (this.x == 0 && this.y == 0);
	}

	toString() {
		return ("x:" + this.x + ", y:" + this.y);
	}

	static NotSet() {
		return new Vector2D(Infinity, Infinity);
	}

	static Zero() {
		return new Vector2D(0, 0);
	}

	static UnitX() {
		return new Vector2D(1, 0);
	}

	static UnitY() {
		return new Vector2D(0, 1);
	}

	static NegativeUnitX() {
		return new Vector2D(-1, 0);
	}

	static NegativeUnitY() {
		return new Vector2D(0, -1);
	}

	static UnitScale() {
		return new Vector2D(1, 1);
	}
}

export default Vector2D;

import Equatable from "./Equatable";
import { ValueOrDefault } from "./Engine";
import EngineMath from "./EngineMath";

class Vector3D extends Equatable {
	constructor(x, y, z) {
		this.x = ValueOrDefault(x, 0);
		this.y = ValueOrDefault(y, 0);
		this.z = ValueOrDefault(z, 0);
	}

	add(vector) {
		return Vector3D.add(this, vector);
	}

	subtract(vector) {
		return Vector3D.subtract(this, vector);
	}

	multiply(vector) {
		return Vector3D.multiply(this, vector);
	}

	divide(vector) {
		return Vector3D.divide(this, vector);
	}

	negate() {
		return Vector3D.negate(this);
	}

	length() {
		return Math.sqrt(this.lengthSquared());
	}

	lengthSquared() {
		return (this.x * this.x + this.y * this.y + this.z * this.z);
	}

	distance(vector) {
		return this.subtract(vector).length();
	}

	distanceSquared(vector) {
		return this.subtract(vector).lengthSquared();
	}

	dot(vector) {
		return Vector3D.dot(this, vector);
	}

	cross(vector) {
		return Vector3D.cross(this, vector);
	}

	normalize() {
		return Vector3D.normalize(this);
	}

	normalizeZero() {
		this.x = EngineMath.normalizeZero(this.x);
		this.y = EngineMath.normalizeZero(this.y);
		this.z = EngineMath.normalizeZero(this.z);

		return this;
	}

	isEqualTo(obj) {
		return (this.x == obj.x && this.y == obj.y && this.z == obj.z);
	}

	toString() {
		return "Vector3D[ x:" + this.x + ", y:" + this.y + ", z:" + this.z + " ]";
	}

	static add(v1, v2) {
		return new Vector3D(
				v1.x + v2.x,
				v1.y + v2.y,
				v1.z + v2.z);
	}

	static subtract(v1, v2) {
		return new Vector3D(
				v1.x - v2.x,
				v1.y - v2.y,
				v1.z - v2.z);
	}

	static multiply(v1, v2) {
		return new Vector3D(
				v1.x * v2.x,
				v1.y * v2.y,
				v1.z * v2.z);
	}

	static divide(v1, v2) {
		return new Vector3D(
				v1.x / v2.x,
				v1.y / v2.y,
				v1.z / v2.z);
	}

	static cross(v1, v2) {
		return new Vector3D(
				(v1.y * v2.z) - (v1.z * v2.y),
				(v1.z * v2.x) - (v1.x * v2.z),
				(v1.x * v2.y) - (v1.y * v2.x));
	}

	static dot(v1, v2) {
		return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
	}

	static negate(v) {
		return new Vector3D(-v.x, -v.y, -v.z);
	}

	static normalize(v) {
		var len = 1 / v.length();

		return new Vector3D(
				v.x * len,
				v.y * len,
				v.z * len);
	}

	static lerp(v1, v2, value) {
		return new Vector3D(
				v1.x + ((v2.x - v1.x) * value),
				v1.y + ((v2.y - v1.y) * value),
				v1.z + ((v2.z - v1.z) * value));
	}

	static reflect(v, n) {
		var len = v.lengthSquared();

		return new Vector3D(
				v.x - ((len * 2) * n.x),
				v.y - ((len * 2) * n.y),
				v.z - ((len * 2) * n.z));
	}

	static min(v1, v2) {
		return new Vector3D(
				Math.min(v1.x, v2.x),
				Math.min(v1.y, v2.y),
				Math.min(v1.z, v2.z));
	}

	static max(v1, v2) {
		return new Vector3D(
				Math.max(v1.x, v2.x),
				Math.max(v1.y, v2.y),
				Math.max(v1.z, v2.z));
	}

	static NotSet() {
		return new Vector3D(Infinity, Infinity, Infinity);
	}

	static Zero() {
		return new Vector3D(0, 0, 0);
	}

	static One() {
		return new Vector3D(1, 1, 1);
	}

	static UnitX() {
		return new Vector3D(1, 0, 0);
	}

	static UnitY() {
		return new Vector3D(0, 1, 0);
	}

	static UnitZ() {
		return new Vector3D(0, 0, 1);
	}

	static NegativeUnitX() {
		return new Vector3D(-1, 0, 0);
	}

	static NegativeUnitY() {
		return new Vector3D(0, -1, 0);
	}

	static NegativeUnitZ() {
		return new Vector3D(0, 0, -1);
	}

	static Up() {
		return new Vector3D(0, 1, 0);
	}

	static Down() {
		return new Vector3D(0, -1, 0);
	}

	static Left() {
		return new Vector3D(-1, 0, 0);
	}

	static Right() {
		return new Vector3D(1, 0, 0);
	}

	static Forward() {
		return new Vector3D(0, 0, -1);
	}

	static Backward() {
		return new Vector3D(0, 0, 1);
	}
}

export default Vector3D;

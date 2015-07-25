import Equatable from "./Equatable";
import Vector2D from "./Vector2D";
import { ValueOrDefault } from "./Engine";
import EngineMath, { DegreeToRadian } from "./EngineMath";

var MatrixType = {
	"IsIdentity": 0,
	"IsTranslation": 1,
	"IsScaling": 2,
	"IsUnknown": 4
};

var MatrixDecompositionType = {
	"Translation": 0,
	"Rotation": 1,
	"Scale": 2,
	"Skew": 4
};

class Matrix2D extends Equatable {
	constructor() {
		super();

		this.type = MatrixType.IsIdentity;
		this.m11 = 1;
		this.m12 = 0;
		this.m21 = 0;
		this.m22 = 1;
		this.offsetX = 0;
		this.offsetY = 0;
	}

	isEqualTo(obj) {
		if (this.type == MatrixType.IsIdentity || obj.type == MatrixType.IsIdentity) {
			return (this.isIdentity() == obj.isIdentity());
		}

		return (this.m11 == obj.m11 &&
		this.m12 == obj.m12 &&
		this.m21 == obj.m21 &&
		this.m22 == obj.m22 &&
		this.offsetX == obj.offsetX &&
		this.offsetY == obj.offsetY);
	}

	setMatrix(m11, m12, m21, m22, tx, ty) {
		this.m11 = m11;
		this.m12 = m12;
		this.m21 = m21;
		this.m22 = m22;
		this.offsetX = tx;
		this.offsetY = ty;
		this.determineMatrixType();
	}

	setIdentity() {
		this.setMatrix(1, 0, 0, 1, 0, 0);
	}

	isIdentity() {
		return (this.type == MatrixType.IsIdentity || (
				this.m11 == 1 &&
				this.m12 == 0 &&
				this.m21 == 0 &&
				this.m22 == 1 &&
				this.offsetX == 0 &&
				this.offsetY == 0
		));
	}

	determineMatrixType() {
		this.type = MatrixType.IsIdentity;

		if ((this.m21 != 0) || (this.m12 != 0)) {
			this.type = MatrixType.IsUnknown;
		}
		else {
			if ((this.m11 != 1) || (this.m22 != 1)) {
				this.type = MatrixType.IsScaling;
			}

			if ((this.offsetX != 0) || (this.offsetY != 0)) {
				this.type |= MatrixType.IsTranslation;
			}

			if ((this.type & (MatrixType.IsScaling | MatrixType.IsTranslation)) == MatrixType.IsIdentity) {
				this.type = MatrixType.IsIdentity;
			}
		}
	}

	decompose(decompositionType) {
		switch (decompositionType) {
			case MatrixDecompositionType.Translation:
				return new Vector2D(this.offsetX, this.offsetY);
			case MatrixDecompositionType.Scale:
				return new Vector2D(
						Math.sqrt(this.m11 * this.m11 + this.m12 * this.m12),
						Math.sqrt(this.m21 * this.m21 + this.m22 * this.m22));
			case MatrixDecompositionType.Skew:
			case MatrixDecompositionType.Rotation:

				var skewX = Math.atan2(-this.m21, this.m22);
				var skewY = Math.atan2(this.m12, this.m11);

				if (skewX == skewY) {
					if (decompositionType == MatrixDecompositionType.Skew) {
						return Vector2D.Zero();
					}
					else {
						var rotation = skewY / DegreeToRadian;

						if (this.m11 < 0 && this.m22 >= 0) {
							rotation += (rotation <= 0) ? 180 : -180;
						}

						return rotation;
					}
				}

				return new Vector2D(
						skewX / DegreeToRadian,
						skewY / DegreeToRadian);
		}

		return null;
	}

	determinate() {
		switch (this.type) {
			case MatrixType.IsIdentity:
			case MatrixType.IsTranslation:
				return 1.0;
			case MatrixType.IsScaling:
			case (MatrixType.IsScaling | MatrixType.IsTranslation):
				return (this.m11 * this.m22);
		}

		return ((this.m11 * this.m22) - (this.m12 * this.m21));
	}

	invert() {
		var det = this.determinate();
		var mx = Matrix2D.createIdentity();

		// cannot invert
		if (det == 0) {
			return;
		}

		switch (this.type) {
			case MatrixType.IsIdentity:
				break;
			case MatrixType.IsTranslation:
				mx.offsetX = -this.offsetX;
				mx.offsetY = -this.offsetY;
				break;
			case MatrixType.IsScaling:
				mx.m11 = 1.0 / this.m11;
				mx.m22 = 1.0 / this.m22;
				break;
			case (MatrixType.IsScaling | MatrixType.IsTranslation):
				mx.m11 = 1.0 / this.m11;
				mx.m22 = 1.0 / this.m22;
				mx.offsetX = -this.offsetX * mx.m11;
				mx.offsetY = -this.offsetY * mx.m22;
				break;
		}

		var inv = 1.0 / det;
		mx.setMatrix(
				this.m22 * inv,
				-this.m12 * inv,
				-this.m21 * inv,
				this.m11 * inv,
				((this.m21 * this.offsetY) - (this.offsetX * this.m22)) * inv,
				((this.offsetX * this.m12) - (this.m11 * this.offsetY)) * inv);

		mx.type = MatrixType.IsUnknown;

		return mx;
	}

	validate() {
		this.m11 = (isNaN(this.m11) ? 0 : this.m11);
		this.m12 = (isNaN(this.m12) ? 0 : this.m12);
		this.m21 = (isNaN(this.m21) ? 0 : this.m21);
		this.m22 = (isNaN(this.m22) ? 0 : this.m22);
		this.offsetX = (isNaN(this.offsetX) ? 0 : this.offsetX);
		this.offsetY = (isNaN(this.offsetY) ? 0 : this.offsetY);
	}

	truncateToPrecision(precision) {
		this.m11 = EngineMath.toPrecision(this.m11, precision);
		this.m12 = EngineMath.toPrecision(this.m12, precision);
		this.m21 = EngineMath.toPrecision(this.m21, precision);
		this.m22 = EngineMath.toPrecision(this.m22, precision);
		this.offsetX = EngineMath.toPrecision(this.offsetX, precision);
		this.offsetY = EngineMath.toPrecision(this.offsetY, precision);
	}

	copyFrom(m) {
		this.type = m.type;
		this.m11 = m.m11;
		this.m12 = m.m12;
		this.m21 = m.m21;
		this.m22 = m.m22;
		this.offsetX = m.offsetX;
		this.offsetY = m.offsetY;
	}

	copy() {
		var m = new Matrix2D();
		m.copyFrom(this);

		return m;
	}

	rotate(angle, prepend) {
		this.rotateAt(angle, 0, 0, prepend);
	}

	rotateAt(angle, cx, cy, prepend) {
		var m = Matrix2D.createRotation((angle % 360) * DegreeToRadian, cx, cy);

		if (prepend) {
			this.prepend(m);
		}
		else {
			this.append(m);
		}
	}

	scale(sx, sy, prepend) {
		this.scaleAt(sx, sy, 0, 0, prepend);
	}

	scaleAt(sx, sy, cx, cy, prepend) {
		var m = Matrix2D.createScale(sx, sy, cx, cy);

		if (prepend) {
			this.prepend(m);
		}
		else {
			this.append(m);
		}
	}

	skew(sx, sy, prepend) {
		var m = Matrix2D.createSkew((sx % 360) * DegreeToRadian, (sy % 360) * DegreeToRadian);

		if (prepend) {
			this.prepend(m);
		}
		else {
			this.append(m);
		}
	}

	translate(tx, ty, prepend) {

		if (prepend) {
			var m = Matrix2D.createTranslation(tx, ty);
			this.prepend(m);
		}
		else {
			if (this.type == MatrixType.IsIdentity) {
				this.setMatrix(1, 0, 0, 1, tx, ty);
				this.type = MatrixType.IsTranslation;
			}
			else if (this.type == MatrixType.IsUnknown) {
				this.offsetX += tx;
				this.offsetY += ty;
			}
			else {
				this.offsetX += tx;
				this.offsetY += ty;
				this.type |= MatrixType.IsTranslation;
			}
		}
	}

	append(m) {
		var mx = this.multiply(this, m);
		this.copyFrom(mx);
	}

	prepend(m) {
		var mx = this.multiply(m, this);
		this.copyFrom(mx);
	}

	add(m1, m2) {
		var m = new Matrix2D();
		m.setMatrix(
				m1.m11 + m2.m11,
				m1.m12 + m2.m12,
				m1.m21 + m2.m21,
				m1.m22 + m2.m22,
				m1.offsetX + m2.offsetX,
				m1.offsetY + m2.offsetY
		);
		return m;
	}

	transformVector(v) {
		return this.transform(v, false);
	}

	transformPoint(pt) {
		return this.transform(pt, true);
	}

	transformPoints(points) {
		for (var i = 0; i < points.length; i++) {
			points[i] = this.transformPoint(points[i]);
		}
	}

	transform(xy, isPoint) {
		if (isPoint) {
			return this.multiplyPoint(xy.x, xy.y);
		}
		else {
			var nx = xy.x;
			var ny = xy.y;

			switch (this.type) {
				case MatrixType.IsIdentity:
				case MatrixType.IsTranslation:
					return new Vector2D(nx, ny);
				case MatrixType.IsScaling:
				case (MatrixType.IsScaling | MatrixType.IsTranslation):
					nx *= this.m11;
					ny *= this.m22;

					return new Vector2D(nx, ny);
			}

			var tx = (nx * this.m21);
			var ty = (ny * this.m12);

			nx *= this.m11;
			nx += tx;
			ny *= this.m22;
			ny += ty;

			return new Vector2D(nx, ny);
		}
	}

	transformRect(rect) {
		var newRect = rect.copy();

		if (!newRect.isEmpty()) {
			if (this.type != MatrixType.IsIdentity) {
				if ((this.type & MatrixType.IsScaling) != MatrixType.IsIdentity) {
					newRect.x *= this.m11;
					newRect.y *= this.m22;
					newRect.width *= this.m11;
					newRect.height *= this.m22;

					if (newRect.width < 0) {
						newRect.x += newRect.width;
						newRect.width = -newRect.width;
					}

					if (newRect.height < 0) {
						newRect.y += newRect.height;
						newRect.height = -newRect.height;
					}
				}

				if ((this.type & MatrixType.IsTranslation) != MatrixType.IsIdentity) {
					newRect.x += this.offsetX;
					newRect.y += this.offsetY;
				}

				if (this.type == MatrixType.IsUnknown) {
					var p1 = this.transformPoint(newRect.topLeft());
					var p2 = this.transformPoint(newRect.topRight());
					var p3 = this.transformPoint(newRect.bottomRight());
					var p4 = this.transformPoint(newRect.bottomLeft());

					newRect.x = Math.min(Math.min(p1.x, p2.x), Math.min(p3.x, p4.x));
					newRect.y = Math.min(Math.min(p1.y, p2.y), Math.min(p3.y, p4.y));

					newRect.width = Math.max(Math.max(p1.x, p2.x), Math.max(p3.x, p4.x)) - newRect.x;
					newRect.height = Math.max(Math.max(p1.y, p2.y), Math.max(p3.y, p4.y)) - newRect.y;
				}
			}
		}

		return newRect;
	}

	multiply(m1, m2) {
		var typeA = m1.type;
		var typeB = m2.type;
		var m;

		if (typeB != MatrixType.IsIdentity) {
			if (typeA == MatrixType.IsIdentity) {
				m = new Matrix2D();
				m.setMatrix(m2.m11, m2.m12, m2.m21, m2.m22, m2.offsetX, m2.offsetY);
				return m;
			}

			if (typeB == MatrixType.IsTranslation) {
				m = new Matrix2D();
				m.setMatrix(m1.m11, m1.m12, m1.m21, m1.m22, m1.offsetX, m1.offsetY);

				m.offsetX += m2.offsetX;
				m.offsetY += m2.offsetY;

				if (typeA != MatrixType.IsUnknown) {
					m.type |= MatrixType.IsTranslation;
				}

				return m;
			}

			if (typeA == MatrixType.IsTranslation) {
				m = new Matrix2D();
				m.setMatrix(m2.m11, m2.m12, m2.m21, m2.m22, m2.offsetX, m2.offsetY);

				m.offsetX = ((m1.offsetX * m2.m11) + (m1.offsetY * m2.m21)) + m2.offsetX;
				m.offsetY = ((m1.offsetX * m2.m12) + (m1.offsetY * m2.m22)) + m2.offsetY;

				if (typeB == MatrixType.IsUnknown) {
					m.type = MatrixType.IsUnknown;
				}
				else {
					m.type = MatrixType.IsScaling | MatrixType.IsTranslation;
				}

				return m;
			}

			m = new Matrix2D();
			m.setMatrix(m1.m11, m1.m12, m1.m21, m1.m22, m1.offsetX, m1.offsetY);

			switch ((typeA << 4) | typeB) {
				case 34:
					m.m11 *= m2.m11;
					m.m22 *= m2.m22;
					return m;
				case 35:
					m.m11 *= m2.m11;
					m.m22 *= m2.m22;
					m.offsetX = m2.offsetX;
					m.offsetY = m2.offsetY;
					m.type = MatrixType.IsScaling | MatrixType.IsTranslation;
					return m;
				case 36:
				case 52:
				case 66:
				case 67:
				case 68:
					m.setMatrix(
							(m1.m11 * m2.m11) + // M11
							(m1.m12 * m2.m21),  //

							(m1.m11 * m2.m12) + // M12
							(m1.m12 * m2.m22),  //

							(m1.m21 * m2.m11) + // M21
							(m1.m22 * m2.m21),  //

							(m1.m21 * m2.m12) + // M22
							(m1.m22 * m2.m22),  //

							((m1.offsetX * m2.m11) +				// OffsetX
							(m1.offsetY * m2.m21)) + m2.offsetX,	//

							((m1.offsetX * m2.m12) +				// OffsetY
							(m1.offsetY * m2.m22)) + m2.offsetY); //
					return m;
				case 50:
					m.m11 *= m2.m11;
					m.m22 *= m2.m22;
					m.offsetX *= m2.m11;
					m.offsetY *= m2.m22;
					return m;
				case 51:
					m.m11 *= m2.m11;
					m.m22 *= m2.m22;
					m.offsetX = (m2.m11 * m.offsetX) + m2.offsetX;
					m.offsetY = (m2.m22 * m.offsetY) + m2.offsetY;
					return m;
			}
		}

		m = new Matrix2D();
		m.setMatrix(m1.m11, m1.m12, m1.m21, m1.m22, m1.offsetX, m1.offsetY);
		return m;
	}

	multiplyPoint(x, y) {
		var nx = x;
		var ny = y;

		switch (this.type) {
			case MatrixType.IsIdentity:
				return new Vector2D(nx, ny);
			case MatrixType.IsTranslation:
				nx += this.offsetX;
				ny += this.offsetY;

				return new Vector2D(nx, ny);
			case MatrixType.IsScaling:
				nx *= this.m11;
				ny *= this.m22;

				return new Vector2D(nx, ny);
			case (MatrixType.IsScaling | MatrixType.IsTranslation):
				nx *= this.m11;
				nx += this.offsetX;
				ny *= this.m22;
				ny += this.offsetY;

				return new Vector2D(nx, ny);
		}

		var tx = (ny * this.m21) + this.offsetX;
		var ty = (nx * this.m12) + this.offsetY;

		nx *= this.m11;
		nx += tx;
		ny *= this.m22;
		ny += ty;

		return new Vector2D(nx, ny);
	}

	toString() {
		return "m11=" + this.m11 + ", " +
				"m12=" + this.m12 + ", " +
				"m21=" + this.m21 + ", " +
				"m22=" + this.m22 + ", " +
				"tx=" + this.offsetX + ", " +
				"ty=" + this.offsetY + ", ";
	}

	static createIdentity() {
		return new Matrix2D();
	}

	static createTranslation(tx, ty) {
		var m = new Matrix2D();
		m.offsetX = tx;
		m.offsetY = ty;
		m.type = MatrixType.IsTranslation;

		return m;
	}

	static createRotation(angle, cx, cy) {

		cx = ValueOrDefault(cx, 0);
		cy = ValueOrDefault(cy, 0);

		var m = new Matrix2D();
		var cr = Math.cos(angle);
		var sr = Math.sin(angle);
		var tx = (cx * (1.0 - cr)) + (cy * sr);
		var ty = (cy * (1.0 - cr)) - (cx * sr);

		m.m11 = cr;
		m.m12 = sr;
		m.m21 = -sr;
		m.m22 = cr;
		m.offsetX = tx;
		m.offsetY = ty;
		m.type = MatrixType.IsUnknown;

		return m;
	}

	static createScale(sx, sy, cx, cy) {
		var m = new Matrix2D();

		m.type = MatrixType.IsScaling;
		m.m11 = sx;
		m.m12 = 0;
		m.m21 = 0;
		m.m22 = sy;
		m.offsetX = 0;
		m.offsetY = 0;

		cx = ValueOrDefault(cx, 0);
		cy = ValueOrDefault(cy, 0);

		m.type |= MatrixType.IsTranslation;
		m.offsetX = (cx - (sx * cx));
		m.offsetY = (cy - (sy * cy));

		return m;
	}

	static createSkew(sx, sy) {
		var m = new Matrix2D();

		m.type = MatrixType.IsUnknown;
		m.m11 = 1;
		m.m12 = Math.tan(sy);
		m.m21 = Math.tan(sx);
		m.m22 = 1;
		m.offsetX = 0;
		m.offsetY = 0;

		return m;
	}
}

export default Matrix2D;

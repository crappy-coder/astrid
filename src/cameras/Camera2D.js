import { ValueOrDefault } from "../Engine";
import MatrixTransform from "../transforms/MatrixTransform";
import Matrix2D from "../Matrix2D";
import Rectangle from "../Rectangle";
import Vector2D from "../Vector2D";


class Camera2D {
	constructor(view, x, y, width, height, zoom) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.zoom = ValueOrDefault(zoom, Camera2D.DefaultZoom);
		this.angle = 0;
		this.limits = Rectangle.Empty();
		this.origin = new Vector2D(width * 0.5, height * 0.5);
		this.target = null;
		this.mx = new Matrix2D();
		this.mxtmp = new Matrix2D();

		this.view = view;
		this.view.setRenderTransform(new MatrixTransform(this.mx));
	}

	getView() {
		return this.view;
	}

	getX() {
		return this.x;
	}

	setX(value) {
		this.x = value;
	}

	getY() {
		return this.y;
	}

	setY(value) {
		this.y = value;
	}

	getWidth() {
		return this.width;
	}

	setWidth(value) {
		this.width = value;
	}

	getHeight() {
		return this.height;
	}

	setHeight(value) {
		this.height = value;
	}

	getZoom() {
		return this.zoom;
	}

	setZoom(value) {
		this.zoom = value;
	}

	getRotation() {
		return this.angle;
	}

	setRotation(value) {
		this.angle = value;
	}

	getLimits() {
		return this.limits;
	}

	setLimits(left, top, right, bottom) {
		this.limits.x = left;
		this.limits.y = top;
		this.limits.width = right - left;
		this.limits.height = bottom - top;
	}

	getMatrix() {
		return this.mx;
	}

	lookAt(x, y) {
		this.x = x - (this.width * 0.5);
		this.y = y - (this.height * 0.5);
	}

	lock(target) {
		this.target = target;
	}

	move(x, y, ignoreRotation) {
		if (ignoreRotation) {
			this.mxtmp.setIdentity();
			this.mxtmp.rotate(-this.angle);

			var v = this.mxtmp.transform(new Vector2D(x, y), true);

			x = v.x;
			y = v.y;
		}

		this.x += x;
		this.y += y;
	}

	update(t) {
		if (this.target) {
			this.lookAt(this.target.getX(), this.target.getY());
		}

		if (!this.limits.isEmpty()) {
			this.x = Math.max(this.x, this.limits.x);
			this.y = Math.max(this.y, this.limits.y);
			this.x = Math.min(this.x, this.limits.right() - this.width);
			this.y = Math.min(this.y, this.limits.bottom() - this.height);
		}

		this.updateMatrix();
	}

	updateMatrix() {
		this.mx.setIdentity();
		this.mx.translate(-this.x, -this.y);
		this.mx.translate(-this.origin.x, -this.origin.y);
		this.mx.scale(this.zoom, this.zoom);
		this.mx.rotate(this.angle);
		this.mx.translate(this.origin.x, this.origin.y);
	}
}

Camera2D.DefaultZoom = 1;

export default Camera2D;

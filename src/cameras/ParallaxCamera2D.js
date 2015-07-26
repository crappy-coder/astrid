import Camera2D from "./Camera2D";
import Matrix2D from "./../Matrix2D";
import MatrixTransform from "./../transforms/MatrixTransform";

class ParallaxCamera2D extends Camera2D {
	constructor(view, x, y, width, height, zoom) {
		super(view, x, y, width, height, zoom);

		this.speed = 0.1;
		this.layers = [];
		this.layerMatrices = [];
		this.ratios = [];
	}

	getSpeed() {
		return this.speed;
	}

	setSpeed(value) {
		this.speed = value;
	}

	add(layer, ratio) {
		this.layers.push(layer);
		this.ratios.push(ratio);

		var mx = new Matrix2D();
		layer.setRenderTransform(new MatrixTransform(mx));
		this.layerMatrices.push(mx);
		this.view.add(layer);
	}

	remove(layer) {
		var idx = this.layers.indexOf(layer);

		if (idx != -1) {
			this.layers.removeAt(idx);
			this.layerMatrices.removeAt(idx);
			this.ratios.removeAt(idx);
		}

		this.view.remove(layer);
	}

	clear() {
		var len = this.layers.length;

		for (var i = 0; i < len; ++i) {
			this.view.remove(this.layers[i]);
		}

		this.layers = [];
		this.layerMatrices = [];
		this.ratios = [];
	}

	setLayerRatio(layer, ratio) {
		var idx = this.layers.indexOf(layer);

		if (idx != -1) {
			this.ratios[idx] = ratio;
		}
	}

	updateMatrix() {
		super.updateMatrix();

		var len = this.layers.length;
		var layer = null;
		var ratio = null;
		var mx = null;

		for (var i = 0; i < len; ++i) {
			layer = this.layers[i];
			mx = this.layerMatrices[i];
			ratio = this.ratios[i];

			mx.setIdentity();
			mx.translate(-this.x * (ratio.x * this.speed), -this.y * (ratio.y * this.speed));
			mx.translate(-this.origin.x, -this.origin.y);
			mx.scale(this.zoom, this.zoom);
			mx.rotate(this.angle);
			mx.translate(this.origin.x, this.origin.y);
		}
	}
}

export default ParallaxCamera2D;

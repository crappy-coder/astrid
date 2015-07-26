import Effect from "./Effect";
import PropertyOptions from "./../ui/PropertyOptions";
import Color from "./../graphics/Color";
import { ValueOrDefault } from "./../Engine";
import EngineMath from "./../EngineMath";
import Vector2D from "./../Vector2D";
import Rectangle from "./../Rectangle";
import GraphicsUtil from "./../graphics/GraphicsUtil";

class DropShadowEffect extends Effect {
	constructor(direction, depth, blurRadius, color) {
		super();

		this.setDirection(ValueOrDefault(direction, 315));
		this.setBlurRadius(ValueOrDefault(blurRadius, 5));
		this.setDepth(ValueOrDefault(depth, 5));
		this.setColor(ValueOrDefault(color, Color.Black));

		this.shadowCanvas = document.createElement("canvas");
		this.shadowContext = this.shadowCanvas.getContext("2d");
	}

	initializeAnimatablePropertiesCore() {
		super.initializeAnimatablePropertiesCore();

		this.enableAnimatableProperty("direction", this.getDirection, this.setDirection, PropertyOptions.AffectsRender);
		this.enableAnimatableProperty("blurRadius", this.getBlurRadius, this.setBlurRadius, PropertyOptions.AffectsRender);
		this.enableAnimatableProperty("depth", this.getDepth, this.setDepth, PropertyOptions.AffectsRender);
		this.enableAnimatableProperty("color", this.getColor, this.setColor, PropertyOptions.AffectsRender);
	}

	getDirection() {
		return this.getPropertyValue("direction");
	}

	setDirection(value) {
		this.setPropertyValue("direction", value);
	}

	getBlurRadius() {
		return this.getPropertyValue("blurRadius");
	}

	setBlurRadius(value) {
		this.setPropertyValue("blurRadius", value);
	}

	getDepth() {
		return this.getPropertyValue("depth");
	}

	setDepth(value) {
		this.setPropertyValue("depth", value);
	}

	getColor() {
		return this.getPropertyValue("color");
	}

	setColor(value) {
		this.setPropertyValue("color", value);
	}

	getRenderBounds(contentRect) {
		var r = this.getBlurRadius();
		var d = this.getDepth();
		var dir = EngineMath.degreesToRadians(this.getDirection());
		var p1 = new Vector2D(contentRect.x - r, contentRect.y - r);
		var p2 = new Vector2D(contentRect.bottomRight().x + r, contentRect.bottomRight().y + r);
		var x = d * Math.cos(dir);
		var y = d * Math.sin(dir);

		if (x >= 0) {
			p2.x += x;
		} else {
			p1.x += x;
		}

		if (y >= 0) {
			p1.y -= y;
		} else {
			p2.y -= y;
		}

		return Rectangle.fromPoints(p1, p2);
	}

	processCore(target, pixelData) {
		var canvas = this.shadowCanvas;
		var ctx = this.shadowContext;
		var dir = EngineMath.degreesToRadians(-this.getDirection());
		var depth = this.getDepth();
		var x = depth * Math.cos(dir);
		var y = depth * Math.sin(dir);

		canvas.width = pixelData.width;
		canvas.height = pixelData.height;

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.save();
		ctx.shadowOffsetX = x;
		ctx.shadowOffsetY = y;
		ctx.shadowBlur = this.getBlurRadius();
		ctx.shadowColor = this.getColor().toRGBAString();
		ctx.drawImage(this.getEffectCanvas(), 0, 0);
		ctx.restore();

		return GraphicsUtil.getImageData(ctx, 0, 0, pixelData.width, pixelData.height, true);
	}
}

export default DropShadowEffect;

import Effect from "./Effect";
import { ValueOrDefault } from "./../Engine";
import Vector3D from "./../Vector3D";
import Color from "./../graphics/Color";
import PropertyOptions from "./../ui/PropertyOptions";
import GraphicsUtil from "./../graphics/GraphicsUtil";

class NormalMapEffect extends Effect {
	constructor(normalSource, lightPosition, specularSharpness) {
		super();

		this.setNormalSource(normalSource);
		this.setLightPosition(ValueOrDefault(lightPosition, new Vector3D(0, 0, 150)));
		this.setLightColor(ValueOrDefault(new Color(0.5, 0.5, 0.5, 0.5)));
		this.setSpecularSharpness(ValueOrDefault(specularSharpness, 1.2));

		this.normalCanvas = document.createElement("canvas");
		this.normalContext = this.normalCanvas.getContext("2d");
	}

	initializeAnimatablePropertiesCore() {
		super.initializeAnimatablePropertiesCore();

		this.enableAnimatableProperty("normalSource", this.getNormalSource, this.setNormalSource, PropertyOptions.AffectsRender);
		this.enableAnimatableProperty("lightColor", this.getLightColor, this.setLightColor, PropertyOptions.AffectsRender);
		this.enableAnimatableProperty("lightPosition", this.getLightPosition, this.setLightPosition, PropertyOptions.AffectsRender);
		this.enableAnimatableProperty("specularSharpness", this.getSpecularSharpness, this.setSpecularSharpness, PropertyOptions.AffectsRender);
	}

	getNormalSource() {
		return this.getPropertyValue("normalSource");
	}

	setNormalSource(value) {
		this.setPropertyValue("normalSource", value);
	}

	getLightColor() {
		return this.getPropertyValue("lightColor");
	}

	setLightColor(value) {
		this.setPropertyValue("lightColor", value);
	}

	getLightPosition() {
		return this.getPropertyValue("lightPosition");
	}

	setLightPosition(value) {
		this.setPropertyValue("lightPosition", value);
	}

	getSpecularSharpness() {
		return this.getPropertyValue("specularSharpness");
	}

	setSpecularSharpness(value) {
		this.setPropertyValue("specularSharpness", value);
	}

	processCore(target, pixelData) {
		var normalMap = this.getNormalSource().texture;

		if (normalMap == null || !normalMap.getIsSourceReady()) {
			return null;
		}

		var canvas = this.normalCanvas;
		var ctx = this.normalContext;

		canvas.width = pixelData.width;
		canvas.height = pixelData.height;

		// draw the normals to the scratch canvas so we can
		// can the normal pixel data
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.save();
		ctx.drawImage(normalMap.getNativeData(), 0, 0, canvas.width, canvas.height);
		ctx.restore();


		var normalPixelData = GraphicsUtil.getImageData(ctx, 0, 0, pixelData.width, pixelData.height, true);
		var normalData = normalPixelData.data;
		var data = pixelData.data;
		var sharpness = this.getSpecularSharpness();
		var lightColor = this.getLightColor();
		var lightR = lightColor.r * 255;
		var lightG = lightColor.g * 255;
		var lightB = lightColor.b * 255;
		var lightPos = Vector3D.normalize(this.getLightPosition());
		var intensity = sharpness / 128;
		var ir = lightR * intensity;
		var ig = lightG * intensity;
		var ib = lightB * intensity;
		var ia = 1 - sharpness * (0.75 + lightPos.x + lightPos.y + lightPos.z);
		var colorMatrix = [
			ir * lightPos.x, ir * lightPos.y, ir * lightPos.z, 0, lightR * ia, 	// red
			ig * lightPos.x, ig * lightPos.y, ig * lightPos.z, 0, lightG * ia, 	// green
			ib * lightPos.x, ib * lightPos.y, ib * lightPos.z, 0, lightB * ia   // blue
		];
		var pixelLen = pixelData.data.length;

		for (var i = 0; i < pixelLen; i += 4) {
			var nr = normalData[i];
			var ng = normalData[i + 1];
			var nb = normalData[i + 2];
			var na = normalData[i + 3];
			var sr = data[i];
			var sg = data[i + 1];
			var sb = data[i + 2];
			var sa = data[i + 3];

			// first apply the color matrix to our normal data
			data[i] = (colorMatrix[0] * nr) + (colorMatrix[1] * ng) + (colorMatrix[2] * nb) + (colorMatrix[3] * na) +
					colorMatrix[4];
			data[i + 1] = (colorMatrix[5] * nr) + (colorMatrix[6] * ng) + (colorMatrix[7] * nb) + (colorMatrix[8] * na) +
					colorMatrix[9];
			data[i + 2] = (colorMatrix[10] * nr) + (colorMatrix[11] * ng) + (colorMatrix[12] * nb) + (colorMatrix[13] * na) +
					colorMatrix[14];
			data[i + 3] = lightColor.a * 255;

			// then second apply the blending mode, here we use a hardlight
			// blend against our original image
			nr = data[i];
			ng = data[i + 1];
			nb = data[i + 2];
			na = data[i + 3];

			var a = na / 255;
			var ac = 1 - a;

			if (nr > 127) {
				nr = 255 - 2 * Color.multiply255(255 - nr, 255 - sr);
			}
			else {
				nr = 2 * Color.multiply255(nr, sr);
			}

			if (ng > 127) {
				ng = 255 - 2 * Color.multiply255(255 - ng, 255 - sg);
			}
			else {
				ng = 2 * Color.multiply255(ng, sg);
			}

			if (nb > 127) {
				nb = 255 - 2 * Color.multiply255(255 - nb, 255 - sb);
			}
			else {
				nb = 2 * Color.multiply255(nb, sb);
			}

			data[i] = (a * nr + ac * sr);
			data[i + 1] = (a * ng + ac * sg);
			data[i + 2] = (a * nb + ac * sb);
			data[i + 3] = (na + sa * ac);
		}

		return pixelData;
	}
}

export default NormalMapEffect;

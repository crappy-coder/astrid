import Effect from "./Effect";
import PropertyOptions from "../ui/PropertyOptions";
import Vector2D from "../Vector2D";
import Rectangle from "../Rectangle";

class BoxBlurEffect extends Effect {
	constructor(radiusX, radiusY, quality) {
		super();

		this.setRadiusX(astrid.valueOrDefault(radiusX, 4));
		this.setRadiusY(astrid.valueOrDefault(radiusY, 4));
		this.setQuality(astrid.valueOrDefault(quality, 1));
	}

	initializeAnimatablePropertiesCore() {
		super.initializeAnimatablePropertiesCore();

		this.enableAnimatableProperty("radiusX", this.getRadiusX, this.setRadiusX, PropertyOptions.AffectsRender);
		this.enableAnimatableProperty("radiusY", this.getRadiusY, this.setRadiusY, PropertyOptions.AffectsRender);
		this.enableAnimatableProperty("quality", this.getQuality, this.setQuality, PropertyOptions.AffectsRender);
	}

	getRadiusX() {
		return this.getPropertyValue("radiusX");
	}

	setRadiusX(value) {
		this.setPropertyValue("radiusX", value);
	}

	getRadiusY() {
		return this.getPropertyValue("radiusY");
	}

	setRadiusY(value) {
		this.setPropertyValue("radiusY", value);
	}

	getQuality() {
		return this.getPropertyValue("quality");
	}

	setQuality(value) {
		this.setPropertyValue("quality", value);
	}

	getRenderBounds(contentRect) {
		// this is just an approximation (better yet, a guess)
		// TODO: need to figure out how to accurately calculate the bounding
		// 		 region of the blur, much like the DropShadowEffect does but
		//		 instead of calculating it directionally we need to in each
		//		 direction, that may be the solution, calculate it for east,
		//		 west, north and south... but the quality will also be a factor
		//		 in the caclulation... hmm???
		var rx = this.getRadiusX() * 2;
		var ry = this.getRadiusY() * 2;
		var p1 = new Vector2D(contentRect.x - rx, contentRect.y - ry);
		var p2 = new Vector2D(contentRect.bottomRight().x + rx, contentRect.bottomRight().y + ry);

		return Rectangle.fromPoints(p1, p2);
	}

	processCore(target, pixelData) {

		if (this.getRadiusX() == 0 && this.getRadiusY() == 0) {
			return pixelData;
		}

		var iterations = this.getQuality();
		var data = pixelData.data;
		var rsum, gsum, bsum, asum;
		var x, y;
		var i;
		var p, p1, p2;
		var yp, yi, yw;
		var wm = pixelData.width - 1;
		var hm = pixelData.height - 1;
		var rad1x = this.getRadiusX() + 1;
		var rad1y = this.getRadiusY() + 1;
		var divx = this.getRadiusX() + rad1x;
		var divy = this.getRadiusY() + rad1y;
		var div2 = 1 / (divx * divy);

		var r = [];
		var g = [];
		var b = [];
		var a = [];

		var vmin = [];
		var vmax = [];

		while (iterations-- > 0) {
			yw = yi = 0;

			for (y = 0; y < pixelData.height; y++) {
				rsum = data[yw + 0] * rad1x;
				gsum = data[yw + 1] * rad1x;
				bsum = data[yw + 2] * rad1x;
				asum = data[yw + 3] * rad1x;

				for (i = 1; i <= this.getRadiusX(); i++) {
					p = yw + (((i > wm ? wm : i)) << 2);
					rsum += data[p++];
					gsum += data[p++];
					bsum += data[p++];
					asum += data[p];
				}

				for (x = 0; x < pixelData.width; x++) {
					r[yi] = rsum;
					g[yi] = gsum;
					b[yi] = bsum;
					a[yi] = asum;

					if (y == 0) {
						vmin[x] = Math.min(x + rad1x, wm) << 2;
						vmax[x] = Math.max(x - this.getRadiusX(), 0) << 2;
					}

					p1 = yw + vmin[x];
					p2 = yw + vmax[x];

					rsum += data[p1++] - data[p2++];
					gsum += data[p1++] - data[p2++];
					bsum += data[p1++] - data[p2++];
					asum += data[p1] - data[p2];

					yi++;
				}

				yw += (pixelData.width << 2);
			}

			for (x = 0; x < pixelData.width; x++) {
				yp = x;
				rsum = r[yp] * rad1y;
				gsum = g[yp] * rad1y;
				bsum = b[yp] * rad1y;
				asum = a[yp] * rad1y;

				for (i = 1; i <= this.getRadiusY(); i++) {
					yp += (i > hm ? 0 : pixelData.width);
					rsum += r[yp];
					gsum += g[yp];
					bsum += b[yp];
					asum += a[yp];
				}

				yi = x << 2;

				for (y = 0; y < pixelData.height; y++) {
					data[yi + 0] = (rsum * div2 + 0.5) | 0;
					data[yi + 1] = (gsum * div2 + 0.5) | 0;
					data[yi + 2] = (bsum * div2 + 0.5) | 0;
					data[yi + 3] = (asum * div2 + 0.5) | 0;

					if (x == 0) {
						vmin[y] = Math.min(y + rad1y, hm) * pixelData.width;
						vmax[y] = Math.max(y - this.getRadiusY(), 0) * pixelData.width;
					}

					p1 = x + vmin[y];
					p2 = x + vmax[y];

					rsum += r[p1] - r[p2];
					gsum += g[p1] - g[p2];
					bsum += b[p1] - b[p2];
					asum += a[p1] - a[p2];

					yi += pixelData.width << 2;
				}
			}
		}

		return pixelData;
	}
}

export default BoxBlurEffect;

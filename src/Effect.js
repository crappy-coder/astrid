import EventDispatcher from "./EventDispatcher";
import Rectangle from "./Rectangle";
import GraphicsUtil from "./GraphicsUtil";
import Animatable from "./Animatable";

class Effect extends EventDispatcher {
	constructor() {
		super();

		/** HTMLCanvasElement **/
		this.effectCanvas = document.createElement("canvas");

		/** CanvasRenderingContext2D **/
		this.effectContext = this.effectCanvas.getContext("2d");

		this.initializeAnimatableProperties();
	}

	reset(size) {
		var bounds = this.getRenderBounds(new Rectangle(0, 0, size.width, size.height));

		this.effectCanvas.width = bounds.width;
		this.effectCanvas.height = bounds.height;
		this.effectContext.clearRect(0, 0, bounds.width, bounds.height);
		this.effectContext.setTransform(1, 0, 0, 1, -bounds.x, -bounds.y);

		this.resetCore(size);
	}

	resetCore(size) {
		/** override, to handle any initialization before the effect is processed **/
	}

	getEffectCanvas() {
		return this.effectCanvas;
	}

	getEffectContext() {
		return this.effectContext;
	}

	getRenderBounds(contentRect) {
		/** override, to handle any custom bounds calculation (i.e. pad for a blur ) **/
		return contentRect;
	}

	process(target) {

		// get the full pixel buffer from our effect's context
		var pixelData = GraphicsUtil.getImageData(this.getEffectContext(), 0, 0, this.getEffectCanvas().width, this.getEffectCanvas().height, true);

		// let any subclasses process the pixel buffer, if successful put the modified
		// buffer back into the effect's context
		var processedPixelData = this.processCore(target, pixelData);

		if (processedPixelData != null) {
			// clear it first so we start from a blank slate
			this.getEffectContext().clearRect(0, 0, this.getEffectCanvas().width, this.getEffectCanvas().height);

			// copy the modified pixel buffer back into the context
			this.getEffectContext().putImageData(processedPixelData, 0, 0);

			return true;
		}

		return false;
	}

	processCore(target, pixelData) {
		/** override, to handle custom pixel processing **/
		return null;
	}
}

Object.assign(Effect.prototype, Animatable);

export default Effect;

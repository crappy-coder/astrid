import ImageSource from "./ImageSource";
import Size from "../Size";

class CanvasSource extends ImageSource {
	constructor(canvas) {
		super();

		/** Canvas **/
		this.canvas = null;

		this.reset();
		this.setCanvas(canvas);
	}

	getCanvas() {
		return this.canvas;
	}

	setCanvas(value) {
		if (this.canvas != value) {
			this.reset();
			this.canvas = value;
			this.load();
		}
	}

	getSize() {
		if (this.canvas != null && (this.canvas.width != this.size.width || this.canvas.height != this.size.height)) {
			this.size.width = this.canvas.width;
			this.size.height = this.canvas.height;
		}

		return super.getSize();
	}

	reset() {
		this.data = null;
		this.size = Size.Zero();
		this.isSourceReady = false;
		this.canvas = null;
	}

	load() {
		if (this.isSourceReady) {
			this.raiseSourceReadyEvent();
			return;
		}

		this.data = this.canvas;
		this.size.width = this.canvas.width;
		this.size.height = this.canvas.height;
		this.isSourceReady = true;

		this.raiseSourceReadyEvent();
	}

	isEqualTo(other) {

		// there is really no good way to compare canvas elements
		// for equality, since the contents is what would decide
		// whether two canvases are equal to each other, however,
		// comparing the pixel buffer of both or the png image data
		// would require a significant amount of time, so, for
		// rendering to occur we must return false so that it assumes
		// the previous source and current source has changed and needs
		// to be updated, not optimal but it's better than the compare

		return false;
	}
}

export default CanvasSource;

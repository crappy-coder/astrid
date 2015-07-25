import EventDispatcher from "./../EventDispatcher";
import SourceEvent from "./../SourceEvent";
import Size from "./../Size";

class ImageSource extends EventDispatcher {
	constructor() {
		super();

		this.isSourceReady = false;
		this.size = Size.Zero();
		this.data = null;
	}

	getIsValid() {
		return true;
	}

	getNativeData() {
		return this.data;
	}

	getIsSourceReady() {
		return this.isSourceReady;
	}

	getWidth() {
		return this.getSize().width;
	}

	getHeight() {
		return this.getSize().height;
	}

	getSize() {
		return this.size;
	}

	load() {}

	raiseSourceReadyEvent(args) {
		this.dispatchEvent(new SourceEvent(SourceEvent.READY));
	}
}

export default ImageSource;

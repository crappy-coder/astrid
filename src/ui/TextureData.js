import EventDispatcher from "../EventDispatcher";
import LoadEvent from "../LoadEvent";

class TextureData extends EventDispatcher {
	constructor() {
		super();

		this.image = null;
		this.isLoaded = false;
	}

	load(url) {
		this.isLoaded = false;
		this.image = new Image();
		this.image.addEventListener("load", this.handleLoadEvent.asDelegate(this), false);
		this.image.addEventListener("error", this.handleErrorEvent.asDelegate(this), false);
		this.image.src = url;
	}

	handleLoadEvent(e) {
		this.isLoaded = true;
		this.dispatchEvent(new LoadEvent(LoadEvent.SUCCESS));
	}

	handleErrorEvent(e) {
		this.isLoaded = false;
		this.dispatchEvent(new LoadEvent(LoadEvent.FAILURE));
	}
}

export default TextureData;

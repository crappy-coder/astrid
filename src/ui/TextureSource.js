import ImageSource from "./ImageSource"
import TextureCache from "./TextureCache"
import TextureCachePolicy from "./TextureCachePolicy"
import LoadEvent from "../LoadEvent"
import ProgressEvent from "../ProgressEvent"
import Size from "../Size"
import TextureData from "./TextureData"

class TextureSource extends ImageSource {
	constructor(path, autoload, cachePolicy) {
		super();

		this.url = null;
		this.autoload = astrid.valueOrDefault(autoload, true);
		this.cachePolicy = astrid.valueOrDefault(cachePolicy, TextureCachePolicy.Cache);
		this.hasError = false;
		this.error = null;
		this.setUrl(path);
	}

	getIsValid() {
		return !this.getHasError();
	}

	getHasError() {
		return this.hasError;
	}

	getError() {
		return this.error;
	}

	getCachePolicy() {
		return this.cachePolicy;
	}

	getUrl() {
		return this.url;
	}

	setUrl(value) {
		if (this.url != value) {
			this.reset();
			this.url = value;

			if (this.autoload) {
				this.load();
			}
		}
	}

	raiseLoadCompletedEvent() {
		this.dispatchEvent(new LoadEvent(LoadEvent.SUCCESS));
		this.raiseSourceReadyEvent();
	}

	raiseLoadFailedEvent() {
		this.dispatchEvent(new LoadEvent(LoadEvent.FAILURE));
	}

	raiseLoadProgressEvent() {
		// TODO : need to figure out a good way to dispatch actual progress info
		this.dispatchEvent(new ProgressEvent(ProgressEvent.PROGRESS, 100, 100));
	}

	reset() {
		this.data = null;
		this.size = Size.Zero();
		this.isSourceReady = false;
		this.hasError = false;
		this.error = "";
		this.url = null;
	}

	load() {
		if (this.isSourceReady) {
			this.raiseLoadCompletedEvent();
			return;
		}

		var url = this.url;
		var cacheKey = this.url.toLowerCase();
		var textureData = TextureCache.get(cacheKey);

		// no cached texture, load from the server
		if (textureData == null) {
			// add a random number to the url so we can bypass the browser cache
			if (this.shouldAlwaysLoadFromServer()) {
				var str = "s2=" + astrid.math.randomIntTo(1000);

				if (url.indexOf("?") == -1) {
					url += "?" + str;
				}
				else {
					url += "&" + str;
				}
			}

			// create the texture data proxy and load in the data
			textureData = new TextureData();
			textureData.addEventHandler(LoadEvent.SUCCESS, this.handleLoadEvent.asDelegate(this));
			textureData.addEventHandler(LoadEvent.FAILURE, this.handleErrorEvent.asDelegate(this));

			// cache this texture now so that it can be re-used right away, even before it's fully loaded
			if (this.shouldCacheTexture()) {
				TextureCache.add(cacheKey, textureData);
			}

			textureData.load(url);
		}

		// the texture is cached, load from memory
		else {
			// the texture data is already loaded, so just finish up as usual
			if (textureData.isLoaded) {
				this.finishLoad(textureData);
			}
			else {
				// since the data is not yet loaded, we still need to listen for the events even
				// through we are not the original loader so that everything will get setup correctly
				textureData.addEventHandler(LoadEvent.SUCCESS, this.handleLoadEvent.asDelegate(this));
				textureData.addEventHandler(LoadEvent.FAILURE, this.handleErrorEvent.asDelegate(this));
			}
		}
	}

	finishLoad(textureData) {
		// keep a reference to the native image and sizes
		this.data = textureData.image;
		this.size.width = this.data.width;
		this.size.height = this.data.height;

		// notify this source is now ready to use
		this.isSourceReady = true;
		this.raiseLoadCompletedEvent();
	}

	handleLoadEvent(event) {
		this.removeEventHandlers(event.getTarget());
		this.finishLoad(event.getTarget());
	}

	handleErrorEvent(event) {
		// loading failed, notify this source cannot be used
		//
		// TODO : need to see about using more informative error messages
		//        about that actual reason, response code, etc... that was
		//        returned from the server.
		//
		this.hasError = true;
		this.error = "Texture failed to load.";
		this.isSourceReady = false;

		this.removeEventHandlers(event.getTarget());
		this.raiseLoadFailedEvent();
	}

	shouldAlwaysLoadFromServer() {
		return (this.getCachePolicy() == TextureCachePolicy.InMemory ||
		this.getCachePolicy() == TextureCachePolicy.NoCache);
	}

	shouldCacheTexture() {
		return (this.getCachePolicy() == TextureCachePolicy.InMemory || this.getCachePolicy() == TextureCachePolicy.Cache);
	}

	removeEventHandlers(textureData) {
		if (textureData == null) {
			return;
		}

		textureData.removeEventHandler(LoadEvent.SUCCESS, this.handleLoadEvent.asDelegate(this));
		textureData.removeEventHandler(LoadEvent.FAILURE, this.handleErrorEvent.asDelegate(this));
	}

	static fromFile(path, cachePolicy) {
		return new TextureSource(path, true, cachePolicy);
	}
}

export default TextureSource;

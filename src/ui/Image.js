import Drawable from "./Drawable";
import { ValueOrDefault } from "../Engine";
import Event from "../Event";
import Rectangle from "../Rectangle";
import SourceEvent from "../SourceEvent";
import LoadEvent from "../LoadEvent";
import ImageSource from "./ImageSource";
import CanvasSource from "./CanvasSource";
import VideoSource from "../media/VideoSource";
import TextureSource from "./TextureSource";
import PropertyOptions from "./PropertyOptions";

class Image extends Drawable {
	constructor(name, source, sourceRect, enableSourceTiling) {
		super(name);

		this.autoLoad = true;
		this.keepAspectRatio = false;
		this.source = null;
		this.sourceLoaded = false;
		this.changed = false;

		if (!ValueOrDefault(enableSourceTiling, false)) {
			this.keepAspectRatio = null;
		}

		this.addEventHandler(Event.PRE_INIT, this.handlePreInitEvent.d(this));

		this.setSourceRect(ValueOrDefault(sourceRect, Rectangle.Empty()));
		this.setEnableSourceTiling(ValueOrDefault(enableSourceTiling, false));
		this.setSource(source);
	}

	initializeAnimatablePropertiesCore() {
		super.initializeAnimatablePropertiesCore();

		this.enableAnimatableProperty("enableSourceTiling", this.getEnableSourceTiling, this.setEnableSourceTiling, PropertyOptions.AffectsLayout);
		this.enableAnimatableProperty("sourceRect", this.getSourceRect, this.setSourceRect, PropertyOptions.AffectsLayout | PropertyOptions.AffectsMeasure);
	}

	getAutoLoad() {
		return this.autoLoad;
	}

	setAutoLoad(value) {
		if (this.autoLoad != value) {
			this.autoLoad = value;
			this.changed = true;

			this.invalidateProperties();
			this.requestMeasure();
			this.requestLayout();
		}
	}

	getKeepAspectRatio() {
		return this.keepAspectRatio;
	}

	setKeepAspectRatio(value) {
		if (this.keepAspectRatio != value) {
			this.keepAspectRatio = value;

			this.requestMeasure();
			this.requestLayout();
		}
	}

	getEnableSourceTiling() {
		return this.getPropertyValue("enableSourceTiling");
	}

	setEnableSourceTiling(value) {
		if (value && this.getKeepAspectRatio() == null) {
			this.setKeepAspectRatio(false);
		}

		this.setPropertyValue("enableSourceTiling", value);
	}

	getSourceRect() {
		return this.getPropertyValue("sourceRect");
	}

	setSourceRect(value) {
		this.setPropertyValue("sourceRect", value);
	}

	getSource() {
		return this.source;
	}

	setSource(source) {
		if (this.source != source) {
			this.source = source;
			this.sourceLoaded = false;
			this.changed = true;

			this.invalidateProperties();
			this.requestMeasure();
			this.requestLayout();
		}
	}

	getActualSourceSize() {
		var rect = this.getSourceRect();

		if (rect.isEmpty()) {
			return this.source.getSize();
		}

		return rect.size();
	}

	load() {
		this.sourceLoaded = false;
		this.changed = false;

		if (this.source != null) {
			this.source.addEventHandler(SourceEvent.READY, this.handleSourceReadyEvent.d(this));
			this.source.load();

			this.requestLayout();
			this.requestMeasure();
		}
	}

	commitProperties() {
		super.commitProperties();

		this.loadIfNeeded();
	}

	measure() {
		super.measure();

		if (!this.sourceLoaded) {
			return;
		}

		var imageSize = this.getActualSourceSize();
		var keepAspectRatio = (this.keepAspectRatio || this.keepAspectRatio == null);
		var measuredWidth = imageSize.width;
		var measuredHeight = imageSize.height;

		if (keepAspectRatio) {
			var exactWidth = this.getExactWidth();
			var exactHeight = this.getExactHeight();
			var percentWidth = this.getPercentWidth();
			var percentHeight = this.getPercentHeight();
			var width = this.getWidth();
			var height = this.getHeight();

			// only exact width
			if (!isNaN(exactWidth) && isNaN(exactHeight) && isNaN(percentHeight)) {
				measuredHeight = exactWidth / measuredWidth * measuredHeight;
			}// only exact height
			else if (!isNaN(exactHeight) && isNaN(exactWidth) && isNaN(percentWidth)) {
				measuredWidth = exactHeight / measuredHeight * measuredWidth;
			}// only percent width
			else if (!isNaN(percentWidth) && isNaN(exactHeight) && isNaN(percentHeight) && width > 0) {
				measuredHeight = width / measuredWidth * measuredHeight;
			}// only percent height
			else if (!isNaN(percentHeight) && isNaN(exactWidth) && isNaN(percentWidth) && height > 0) {
				measuredWidth = height / measuredHeight * measuredWidth;
			}
		}

		this.setMeasuredWidth(measuredWidth);
		this.setMeasuredHeight(measuredHeight);
	}

	layout(unscaledWidth, unscaledHeight) {
		super.layout(unscaledWidth, unscaledHeight);

		this.loadIfNeeded();

		if (!this.sourceLoaded) {
			return;
		}

		var drawWidth = unscaledWidth;
		var drawHeight = unscaledHeight;
		var keepAspectRatio = (this.keepAspectRatio || this.keepAspectRatio == null);

		if (keepAspectRatio) {
			var imageSize = this.getActualSourceSize();
			var imageAspectRatio = imageSize.width / imageSize.height;
			var aspectRatio = unscaledWidth / unscaledHeight;

			if (imageAspectRatio > aspectRatio) {
				drawHeight = unscaledWidth / imageAspectRatio;
			}
			else {
				drawWidth = unscaledHeight * imageAspectRatio;
			}

			// re-measure if we have either a percentage width or height and our aspect ratios are
			// not the same, we do this so that the percentage can have a chance to be calculated
			// by our parent layout container
			if ((!isNaN(this.getPercentWidth()) && isNaN(this.getPercentHeight()) && isNaN(this.getExactHeight())) ||
					(!isNaN(this.getPercentHeight()) && isNaN(this.getPercentWidth()) && isNaN(this.getExactWidth()))) {
				if (aspectRatio != imageAspectRatio) {
					this.requestMeasure();
					return;
				}
			}
		}

		this.graphics.clear();
		this.graphics.beginPath();

		var sourceRect = this.getSourceRect();
		var tiled = this.getEnableSourceTiling();

		if (sourceRect.isEmpty()) {
			this.graphics.drawImage(this.source, 0, 0, drawWidth, drawHeight, tiled);
		}
		else {
			this.graphics.drawImageComplex(this.source, sourceRect.x, sourceRect.y, sourceRect.width, sourceRect.height, 0, 0, drawWidth, drawHeight, tiled);
		}
	}

	loadIfNeeded() {
		if (this.changed) {
			this.changed = false;

			if (this.autoLoad) {
				this.load();
			}
		}
	}

	raiseLoadedEvent() {
		this.dispatchEvent(new LoadEvent(LoadEvent.SUCCESS));
	}

	handlePreInitEvent(e) {
		this.loadIfNeeded();
	}

	handleSourceReadyEvent(e) {
		this.source.removeEventHandler(SourceEvent.READY, this.handleSourceReadyEvent.d(this));
		this.sourceLoaded = true;

		this.requestMeasure();
		this.requestLayout();
		this.raiseLoadedEvent();
	}

	/**
	 * Creates a new Image instance from any valid source. The source can be any
	 * of the following values:
	 *    - Url (String)
	 *    - Any type of ImageSource
	 *    - An HTMLCanvasElement or HTMLVideoElement
	 *
	 * @param    name        The name of the new Image instance.
	 * @param    source        Any valid image source, see above.
	 * @param  sourceRect      Optional. A Rectangle that defines the rectangular
	 *                                  region within the source that should be
	 *                                  drawn.
	 * @param enableSourceTiling  Optional. True to enable tiling of the image source,
	 *                                  otherwise false.
	 */
	static create(name, source, sourceRect, enableSourceTiling) {

		// TODO : need to throw an error here
		if (name == null || source == null) {
			return null;
		}

		var actualSource = null;

		// source is already an image source
		if (source instanceof ImageSource) {
			actualSource = source;
		}// source is an HTMLCanvasElement
		else if (source instanceof HTMLCanvasElement) {
			actualSource = new CanvasSource(source);
		}// source is an HTMLVideoElement
		else if (source instanceof HTMLVideoElement) {
			actualSource = new VideoSource(source);
		}// just try it as a url string
		else {
			actualSource = new TextureSource(source.toString(), false);
		}

		return new Image(name, actualSource, sourceRect, enableSourceTiling);
	}
}

export default Image;

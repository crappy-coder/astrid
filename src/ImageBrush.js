import Brush from "./Brush";
import HorizontalAlignment from "./HorizontalAlignment";
import VerticalAlignment from "./VerticalAlignment";
import Stretch from "./Stretch";
import TextureSource from "./TextureSource";
import SourceEvent from "./SourceEvent";

class ImageBrush extends Brush {
	constructor() {
		super();

		/** TextureSource **/
		this.texture = null;

		this.setHorizontalAlignment(HorizontalAlignment.Center);
		this.setVerticalAlignment(VerticalAlignment.Center);
		this.setStretch(Stretch.Fill);
	}

	getSourceUrl() {
		return this.getPropertyValue("sourceUrl");
	}

	setSourceUrl(value) {
		if (this.setPropertyValue("sourceUrl", value)) {
			this.loadImage();
		}
	}

	getHorizontalAlignment() {
		return this.getPropertyValue("horizontalAlignment");
	}

	setHorizontalAlignment(value) {
		this.setPropertyValue("horizontalAlignment", value);
	}

	getVerticalAlignment() {
		return this.getPropertyValue("verticalAlignment");
	}

	setVerticalAlignment(value) {
		this.setPropertyValue("verticalAlignment", value);
	}

	getStretch() {
		return this.getPropertyValue("stretch");
	}

	setStretch(value) {
		this.setPropertyValue("stretch", value);
	}

	loadImage() {

		this.texture = null;

		if (this.getSourceUrl() != null) {
			this.texture = new TextureSource();
			this.texture.addEventHandler(SourceEvent.READY, this.onTextureSourceReady.asDelegate(this));
			this.texture.setUrl(this.getSourceUrl());

			this.raisePropertyChangedEvent("texture");
		}
	}

	onTextureSourceReady(event) {
		this.raiseAvailableEvent();
	}

	isEqualTo(other) {
		return (super.isEqualTo(other) && this.getSourceUrl() == other.getSourceUrl());
	}

	static fromUrl(url) {
		var brush = new ImageBrush();
		brush.setSourceUrl(url);

		return brush;
	}
}

export default ImageBrush;

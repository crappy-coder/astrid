import Brush from "./Brush";
import VideoEvent from "./../media/VideoEvent";
import HorizontalAlignment from "./../ui/HorizontalAlignment";
import VerticalAlignment from "./../ui/VerticalAlignment";
import Stretch from "./../ui/Stretch";

class VideoBrush extends Brush {
	constructor(sourceElement) {
		super();

		this.sourceElement = sourceElement;
		this.sourceElement.addEventHandler(VideoEvent.FRAME_CHANGE, this.handleFrameChangeEvent.asDelegate(this));
		this.isFirstFrame = false;

		this.setHorizontalAlignment(HorizontalAlignment.Center);
		this.setVerticalAlignment(VerticalAlignment.Center);
		this.setStretch(Stretch.Fill);
		this.setFrame(0);
	}

	getNaturalSize() {
		return this.sourceElement.getNaturalSize();
	}

	getSourceElement() {
		return this.sourceElement.getSourceElement();
	}

	getCurrentPosition() {
		return this.sourceElement.getCurrentPosition();
	}

	getStretch() {
		return this.getPropertyValue("stretch");
	}

	setStretch(value) {
		this.setPropertyValue("stretch", value);
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

	getFrame() {
		return this.getPropertyValue("frame");
	}

	setFrame(value) {
		this.setPropertyValue("frame", value);
	}

	handleFrameChangeEvent(event) {
		if (!this.isFirstFrame) {
			this.isFirstFrame = true;
			this.raiseAvailableEvent();
		}

		this.setFrame(this.getFrame() + 1);
	}

	isEqualTo(other) {
		return (super.isEqualTo(other) && this.sourceElement == other.sourceElement);
	}
}

export default VideoBrush;

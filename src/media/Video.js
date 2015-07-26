import MediaBase from "./MediaBase";
import Event from "./../Event";
import { ValueOrDefault } from "./../Engine";
import VideoSource from "./VideoSource";
import Size from "./../Size";
import VideoEvent from "./VideoEvent";
import Drawable from "./../ui/Drawable";

class Video extends Drawable {
	constructor(name, sourceElement) {
		super(name);

		this.alwaysDirty = true;
		this.addEventHandler(Event.ADDED_TO_SCENE, this.handleAddedToSceneEvent.asDelegate(this));

		this.initializeMedia(ValueOrDefault(sourceElement, document.createElement("video")));
		this.videoSourceCache = new VideoSource(this.getSourceElement());
	}

	close() {}

	getNaturalSize() {
		return new Size(this.getSourceElement().videoWidth, this.getSourceElement().videoHeight);
	}

	frameReady() {
		this.requestMeasure();
		this.requestLayout();
		this.raiseFrameChangeEvent();
	}

	frameUpdate() {
		this.requestLayout();
		this.raiseFrameChangeEvent();
	}

	measure() {
		var naturalSize = this.getNaturalSize();
		var exactWidth = this.getExactWidth();
		var exactHeight = this.getExactHeight();
		var measuredWidth, measuredHeight;

		if (isNaN(naturalSize.width)) {
			naturalSize.width = 0;
		}

		if (isNaN(naturalSize.height)) {
			naturalSize.height = 0;
		}

		measuredWidth = naturalSize.width;
		measuredHeight = naturalSize.height;

		if (!isNaN(exactWidth) && isNaN(exactHeight) && measuredWidth > 0) {
			measuredHeight = this.getExactWidth() * measuredHeight / measuredWidth;
		}
		else if (!isNaN(exactHeight) && isNaN(exactWidth) && measuredHeight > 0) {
			measuredWidth = this.getExactHeight() * measuredWidth / measuredHeight;
		}

		this.setMeasuredWidth(measuredWidth);
		this.setMeasuredHeight(measuredHeight);
	}

	layout(unscaledWidth, unscaledHeight) {
		super.layout(unscaledWidth, unscaledHeight);

		this.graphics.clear();
		this.graphics.beginPath();
		this.graphics.drawImage(this.videoSourceCache, 0, 0, unscaledWidth, unscaledHeight);
	}

	handleAddedToSceneEvent(event) {
		this.load();
	}

	raiseFrameChangeEvent() {
		this.dispatchEvent(new VideoEvent(VideoEvent.FRAME_CHANGE));
	}

	// TODO : need to add the video element sources
	static fromVideoElement(videoElement) {
		var name = videoElement.id || videoElement.name || "";
		return new Video(name, videoElement);
	}
}

Object.assign(Video.prototype, MediaBase);

export default Video;

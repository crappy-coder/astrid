import ImageSource from "./../ui/ImageSource";
import Size from "./../Size";

class VideoSource extends ImageSource {
	constructor(videoElement) {
		super();

		this.videoElement = null;

		this.reset();
		this.setVideoElement(videoElement);
	}

	getVideoElement() {
		return this.videoElement;
	}

	setVideoElement(value) {
		if (this.videoElement != value) {
			this.reset();
			this.videoElement = value;
			this.load();
		}
	}

	reset() {
		this.data = null;
		this.size = Size.Zero();
		this.isSourceReady = false;
		this.videoElement = null;
	}

	load() {
		if (this.isSourceReady) {
			this.raiseSourceReadyEvent();
			return;
		}

		var duration = this.videoElement.duration;

		if (isNaN(duration) || duration == 0) {
			this.videoElement.addEventListener("durationchange", this.handleDurationChangeEvent.bind(this), false);
		}
		else {
			this.update();
		}
	}

	update() {
		this.data = this.videoElement;
		this.size.width = this.videoElement.videoWidth;
		this.size.height = this.videoElement.videoHeight;
		this.isSourceReady = true;

		this.raiseSourceReadyEvent();
	}

	handleDurationChangeEvent(e) {
		this.update();
	}
}

export default VideoSource;

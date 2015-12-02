import Event from "../Event"

class VideoEvent extends Event {
	constructor(type, bubbles, cancelable) {
		super(type, bubbles, cancelable);
	}
}

VideoEvent.FRAME_CHANGE = "videoFrameChange";

export default VideoEvent;

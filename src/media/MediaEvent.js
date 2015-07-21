import Event from "./../Event";

class MediaEvent extends Event {
	constructor(type, bubbles, cancelable) {
		super(type, bubbles, cancelable);
	}
}

MediaEvent.OPENED = "mediaOpened";
MediaEvent.ENDED = "mediaEnded";

export default MediaEvent;

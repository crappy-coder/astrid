import MediaSource from "./MediaSource";

class AudioSource extends MediaSource {
	constructor(url, simpleType, codec) {
		super(url, "audio/" + simpleType, codec);
	}
}

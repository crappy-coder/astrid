import { ValueOrDefault } from "./Engine";

class MediaSource {
	constructor(url, type, audioCodec, videoCodec) {
		/** String **/
		this.url = ValueOrDefault(url, null);

		/** String **/
		this.type = ValueOrDefault(type, null);

		/** String **/
		this.audioCodec = ValueOrDefault(audioCodec, null);

		/** String **/
		this.videoCodec = ValueOrDefault(videoCodec, null);
	}

	getUrl() {
		return this.url;
	}

	setUrl(value) {
		this.url = value;
	}

	getType() {
		return this.type;
	}

	setType(value) {
		this.type = value;
	}

	getAudioCodec() {
		return this.audioCodec;
	}

	setAudioCodec(value) {
		this.audioCodec = value;
	}

	getVideoCodec() {
		return this.videoCodec;
	}

	setVideoCodec(value) {
		this.videoCodec = value;
	}

	toString() {
		var str = this.type;

		if (this.audioCodec != null) {
			str += "; codecs=\"" + this.audioCodec;

			if (this.videoCodec == null) {
				str += "\"";
			}
		}

		if (this.videoCodec != null) {
			if (this.audioCodec != null) {
				str += ", " + this.videoCodec + "\"";
			}
			else {
				str += "; codecs=\"" + this.videoCodec + "\"";
			}
		}

		return str;
	}
}

export default MediaSource;

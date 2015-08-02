import NamedObject from "../NamedObject";
import MediaBase from "./MediaBase";
import AudioManager from "./AudioManager";
import { Mixin } from "../Engine";

var Mixed = Mixin(NamedObject, MediaBase);

class Audio extends Mixed {
	constructor(name, sourceElement) {
		super(name);

		this.initializeMedia(MoValueOrDefault(sourceElement, document.createElement("audio")));
	}

	static fromAudioElement(audioElement) {
		var name = (audioElement.id != null ? audioElement.id : (audioElement.name != null ? audioElement.name : ""));

		return new Audio(name, audioElement);
	}

	static create(name, source) {
		var mgr = AudioManager.getInstance();

		// the source is a list of media sources so we
		// add each one
		if (source instanceof Array) {
			var len = source.length;

			for (var i = 0; i < len; ++i) {
				mgr.addSource(name, source[i]);
			}
		}
		else {
			mgr.addSource(name, source);
		}

		return mgr.getAudio(name);
	}

	static play(name, source) {
		var audio = Audio.create(name, source);

		AudioManager.getInstance().play(name);

		return audio;
	}

	static pause(name) {
		AudioManager.getInstance().pause(name);
	}

	static resume(name) {
		AudioManager.getInstance().play(name);
	}

	static stop(name) {
		AudioManager.getInstance().stop(name);
	}

	static seek(name, position) {
		AudioManager.getInstance().seek(name, position);
	}
}

export default Audio;

import Dictionary from "./../Dictionary";
import Audio from "./Audio";

class AudioManager {
	constructor() {
		this.sourceLookup = new Dictionary();
	}

	addSource(name, audioSource) {
		var audio = null;

		if (!this.sourceLookup.containsKey(name)) {
			audio = new Audio(name);
			audio.setAutoPlay(false);

			this.sourceLookup.set(name, audio);
		}

		audio = this.sourceLookup.get(name);
		audio.addSource(audioSource);
	}

	clearSources(name) {
		if (this.sourceLookup.containsKey(name)) {
			var audio = this.sourceLookup.get(name);
			audio.stop();

			this.sourceLookup.remove(name);
		}
	}

	clearAll() {
		var keys = this.sourceLookup.getKeys();

		for (var i = 0; i < keys.length; i++) {
			this.clearSources(keys[i]);
		}
	}

	getAudio(name) {
		return this.sourceLookup.get(name);
	}

	play(name) {
		var audio = this.getAudio(name);

		if (audio != null) {
			if (!audio.getIsReady()) {
				audio.load();
			}

			audio.play();
		}
	}

	playAll() {
		var keys = this.sourceLookup.getKeys();

		for (var i = 0; i < keys.length; i++) {
			this.play(keys[i]);
		}
	}

	pause(name) {
		var audio = this.getAudio(name);

		if (audio != null) {
			audio.pause();
		}
	}

	pauseAll() {
		var keys = this.sourceLookup.getKeys();

		for (var i = 0; i < keys.length; i++) {
			this.pause(keys[i]);
		}
	}

	stop(name) {
		var audio = this.getAudio(name);

		if (audio != null) {
			audio.stop();
		}
	}

	stopAll() {
		var keys = this.sourceLookup.getKeys();

		for (var i = 0; i < keys.length; i++) {
			this.stop(keys[i]);
		}
	}

	seek(name, position) {
		var audio = this.getAudio(name);

		if (audio != null) {
			audio.seek(position);
		}
	}

	static getInstance() {
		if (AudioManager.Instance == null) {
			AudioManager.Instance = new this();
		}

		return AudioManager.Instance;
	}
}

export default AudioManager;

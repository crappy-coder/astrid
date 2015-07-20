import AnimationSet from "./AnimationSet";

class ParallelAnimation extends AnimationSet {
	constructor() {
		super();
	}

	play() {
		this.updateAnimations("play");
	}

	pause() {
		this.updateAnimations("pause");
	}

	stop() {
		this.updateAnimations("stop");
	}

	resume() {
		this.updateAnimations("resume");
	}

	reverse() {
		this.updateAnimations("reverse");
	}

	updateAnimations(toState) {
		var len = this.getAnimationCount();
		var animation = null;

		for (var i = 0; i < len; i++) {
			animation = this.getAnimationAt(i);

			if (animation != null) {
				switch (toState) {
					case "play":
						animation.play();
						break;
					case "pause":
						animation.pause();
						break;
					case "resume":
						animation.resume();
						break;
					case "reverse":
						animation.reverse();
						break;
					case "stop":
						animation.stop();
						break;
				}
			}
		}
	}
}

export default ParallelAnimation;

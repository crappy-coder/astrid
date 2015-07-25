import AnimationSet from "./AnimationSet";
import AnimationEvent from "./AnimationEvent";

class SequenceAnimation extends AnimationSet {
	constructor() {
		super();

		this.currentAnimationIndex = 0;
	}

	getCurrentAnimation() {
		if (this.currentAnimationIndex < this.getAnimationCount()) {
			return this.getAnimationAt(this.currentAnimationIndex);
		}

		return null;
	}

	play() {
		this.playNext();
	}

	playNext() {
		if (this.currentAnimationIndex < this.getAnimationCount()) {
			var animation = this.getAnimationAt(this.currentAnimationIndex++);

			if (animation != null) {
				animation.addEventHandler(AnimationEvent.COMPLETE, this.handleCurrentAnimationCompleteEvent.asDelegate(this));
				animation.play();
			}
		}
	}

	pause() {
		var animation = this.getCurrentAnimation();

		if (animation != null) {
			animation.pause();
		}
	}

	stop() {
		var animation = this.getCurrentAnimation();

		if (animation != null) {
			animation.stop();
		}
	}

	resume() {
		var animation = this.getCurrentAnimation();

		if (animation != null) {
			animation.resume();
		}
	}

	reverse() {
		var animation = this.getCurrentAnimation();

		if (animation != null) {
			animation.reverse();
		}
	}

	handleCurrentAnimationCompleteEvent(event) {
		this.playNext();
	}
}

export default SequenceAnimation;

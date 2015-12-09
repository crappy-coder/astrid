import EventDispatcher from "../EventDispatcher";
import RepeatBehavior from "./RepeatBehavior";
import { ValueOrDefault } from "../Engine";
import System from "../System";
import LinearEase from "./LinearEase";
import Keyframe from "./Keyframe";
import Dictionary from "../Dictionary";
import Timer from "../Timer";
import TimerEvent from "../TimerEvent";

class DelayedAnimator {
	constructor(animator, delay) {
		this.animator = animator;
		this.delay = ValueOrDefault(delay, 0);
	}

	getAnimator() {
		return this.animator;
	}

	setAnimator(value) {
		this.animator = value;
	}

	getDelay() {
		return this.delay;
	}

	setDelay(value) {
		this.delay = value;
	}
}

class Animator extends EventDispatcher {
	constructor(duration) {
		super();

		this.duration = ValueOrDefault(duration, 0);
		this.startTime = -1;
		this.currentTime = -1;
		this.currentStartTime = -1;
		this.totalTime = -1;
		this.delay = 0;
		this.delayTime = -1;
		this.delayIndex = -1;
		this.repeatBehavior = RepeatBehavior.Loop;
		this.repeatDelay = 0;
		this.repeatCount = 1;
		this.isRunning = false;
		this.isReversed = false;
		this.interpolator = null;
		this.target = null;
		this.index = -1;
		this.hasStarted = false;
		this.currentValue = null;
		this.currentFraction = 0;
		this.easer = new LinearEase();
		this.doSeek = false;
		this.doReverse = false;
		this.playInReverse = false;
		this.animationPaths = null;
	}

	getAnimationPaths() {
		return this.animationPaths;
	}

	setAnimationPaths(value) {
		this.animationPaths = value;
	}

	getEaser() {
		return this.easer;
	}

	setEaser(value) {
		this.easer = value;
	}

	getDuration() {
		return this.duration;
	}

	setDuration(value) {
		this.duration = value;
	}

	getDelay() {
		return this.delay;
	}

	setDelay(value) {
		this.delay = value;
	}

	getRepeatBehavior() {
		return this.repeatBehavior;
	}

	setRepeatBehavior(value) {
		this.repeatBehavior = value;
	}

	getRepeatCount() {
		return this.repeatCount;
	}

	setRepeatCount(value) {
		this.repeatCount = value;
	}

	getRepeatDelay() {
		return this.repeatDelay;
	}

	setRepeatDelay(value) {
		this.repeatDelay = value;
	}

	getIsRunning() {
		return this.isRunning;
	}

	getInterpolator() {
		return this.interpolator;
	}

	setInterpolator(value) {
		this.interpolator = value;
	}

	getTarget() {
		return this.target;
	}

	setTarget(value) {
		this.target = value;
	}

	getPlayInReverse() {
		return this.playInReverse;
	}

	setPlayInReverse(value) {

		if (this.isRunning) {
			if (this.isReversed != value) {
				this.isReversed = value;
				this.seek(this.duration - this.currentTime, true);
			}
		}

		this.doReverse = value;
		this.playInReverse = value;
	}

	getElapsedTotalTime() {
		return this.totalTime + this.delay;
	}

	setElapsedTotalTime(value) {
		this.seek(value, true);
	}

	getElapsedTime() {
		return this.currentTime;
	}

	getCurrentFractionValue() {
		return this.currentFraction;
	}

	getCurrentValue() {
		return this.currentValue;
	}

	play() {
		this.stopImpl();

		var len = this.animationPaths.length;
		var keyframes = null;
		var keyframeZero = null;

		for (var i = 0; i < len; ++i) {
			keyframes = this.animationPaths[i].getKeyframes();

			// the path has no keyframes, just move on
			if (keyframes.length == 0) {
				continue;
			}

			keyframeZero = keyframes[0];

			// ensure that the first keyframe is zero
			if (!keyframeZero.getIsValidKeyTime()) {
				keyframeZero.setKeyTime(0);
			}// the first key frame doesn't start at zero so we need to put in
			// some filler frames to make up for the difference
			else if (keyframeZero.getKeyTime() > 0) {
				var startTime = keyframeZero.getKeyTime();

				// add a keyframe at zero with an invalid value
				keyframes.splice(0, 0, new Keyframe(0, null));

				// then add another keyframe right before it, if the first keyframe
				// starts at 1000ms then this keyframe would be 999, so 0-999, 999-1000, etc...
				keyframes.splice(1, 0, new Keyframe(startTime - 1, null));

				// in reverse we just add the first value to the new filler keyframes
				// we just added, this way it just continues to zero with the same end
				// value all the way through
				if (this.getPlayInReverse()) {
					keyframes[0].setValue(keyframes[2].getValue());
					keyframes[1].setValue(keyframes[2].getValue());
				}
			}

			for (var j = 1; j < keyframes.length; ++j) {
				// the keyframe's has an invalid time so the only thing we can really do is
				// just set it to our duration
				//
				// FIXME : we should just figure out the actual time it should be in this case
				//		   based on the keyframe before and after this keyframe
				//		   i.e. just pick something in the middle
				if (!keyframes[j].getIsValidKeyTime()) {
					keyframes[j].setKeyTime(this.getDuration());
				}
			}

			// validate the keyframes, i.e. this will update our keyframes
			// time slice for the specified duration
			this.animationPaths[i].validateKeyframesForDuration(this.getDuration());
		}

		// reverse playback
		if (this.doReverse) {
			this.isReversed = true;
		}

		// don't start the animation now, add to our list of delayed
		// animations until it's ready to go
		if (this.getDelay() > 0 && !this.getPlayInReverse()) {
			this.delayAnimation(this.getDelay());
		}// start it now
		else {
			this.start();
		}
	}

	pause() {
		if (this.delayIndex != -1) {
			var delayedAnimator = Animator.DelayedAnimators[this.delayIndex];
			var pendingTime = delayedAnimator.getDelay();

			if (!isNaN(pendingTime) && pendingTime != -1) {
				this.delayTime = pendingTime - Animator.getCurrentTime();
				this.removeFromDelayedAnimations();
			}
		}

		this.isRunning = false;
	}

	resume() {
		this.isRunning = true;

		if (this.delayTime >= 0) {
			this.delayAnimation(this.delayTime);
		}
		else {
			this.currentStartTime = Animator.CurrentTimeTick - this.currentTime;
			this.startTime = Animator.CurrentTimeTick - this.totalTime;

			if (this.doReverse) {
				this.reverse();
				this.doReverse = false;
			}
		}
	}

	start() {
		var actualStartTime = 0;

		if (!this.playInReverse) {
			if (this.delayIndex != -1) {
				var delayedAnimator = Animator.DelayedAnimators[this.delayIndex];
				var overrun = Animator.getCurrentTime() - delayedAnimator.getDelay();

				if (overrun > 0) {
					actualStartTime = Math.min(overrun, this.duration);
				}

				this.removeFromDelayedAnimations();
			}
		}

		this.updateTargetState(Animator.TargetState.Start);
		this.updateInterpolators();
		this.updateValue(0, true);

		Animator.addAnimator(this);

		this.startTime = this.currentStartTime;
		this.isRunning = true;

		if (actualStartTime > 0) {
			this.seek(actualStartTime);
		}

		this.hasStarted = true;
	}

	stop() {
		this.stopImpl();
		this.updateTargetState(Animator.TargetState.Stop);
	}

	stopImpl() {
		this.removeFromDelayedAnimations();

		if (this.index >= 0) {
			Animator.removeAnimatorAt(this.index);

			this.index = -1;
			this.isReversed = false;
			this.isRunning = false;
		}
	}

	end() {

		// remove the delayed animator, if exists
		if (this.delay > 0) {
			this.removeFromDelayedAnimations();
		}

		// make sure things go through the normal states
		if (!this.hasStarted) {
			this.updateTargetState(Animator.TargetState.Start);
		}

		if (this.repeatCount > 1 && this.repeatBehavior == RepeatBehavior.Reverse && (this.repeatCount % 2 == 0)) {
			this.isReversed = true;
		}

		// update to the end
		if (!(this.doReverse && this.delay > 0)) {
			this.updateValue(this.duration, true);
		}

		// stop officially
		if (this.isRunning) {
			this.stopImpl();
		} else {
			Animator.stopTimerIfDone();
		}

		// update targets state
		this.updateTargetState(Animator.TargetState.End);
	}

	seek(time, includeDelay) {
		includeDelay = ValueOrDefault(includeDelay, false);

		this.startTime = this.currentStartTime = (Animator.CurrentTimeTick - time);
		this.doSeek = true;

		if (!this.isRunning || this.playInReverse) {
			var isRunningTmp = this.isRunning;

			Animator.CurrentTimeTick = Animator.getCurrentTime();

			if (includeDelay && this.delay > 0) {
				if (this.delayIndex != -1) {
					var delayedAnimator = Animator.DelayedAnimators[this.delayIndex];
					var postDelaySeekTime = time - this.delay;

					this.removeFromDelayedAnimations();

					if (this.playInReverse) {
						postDelaySeekTime -= this.duration;
					}

					if (postDelaySeekTime < 0) {
						this.delayAnimation(this.delay - time);
						return;
					}
					else {
						time -= this.delay;

						if (!this.isRunning) {
							this.start();
						}

						this.startTime = this.currentStartTime = (Animator.CurrentTimeTick - time);

						this.update();
						this.doSeek = false;
						return;
					}
				}
			}

			if (!isRunningTmp) {
				this.updateTargetState(Animator.TargetState.Start);
				this.updateInterpolators();
			}

			this.startTime = this.currentStartTime = (Animator.CurrentTimeTick - time);
		}

		this.update();
		this.doSeek = false;
	}

	reverse() {
		if (this.isRunning) {
			this.doReverse = false;
			this.seek(this.duration - this.currentTime);
			this.isReversed = !this.isReversed;
		}
		else {
			this.doReverse = !this.doReverse;
		}
	}

	updateInterpolators() {
		if (this.interpolator != null && this.animationPaths != null) {
			var len = this.animationPaths.length;

			for (var i = 0; i < len; ++i) {
				this.animationPaths[i].setInterpolator(this.getInterpolator());
			}
		}
	}

	updateValue(time, updateTarget) {
		this.currentValue = new Dictionary();

		// there is no specified duration so just update the animation
		// to the final values
		if (this.duration == 0) {
			this.updateValueForZeroDuration(updateTarget);
			return;
		}

		if (this.isReversed) {
			time = this.duration - time;
		}

		// compute the current easing fraction and update our value table
		this.currentFraction = this.easer.ease(time / this.duration);
		this.updateValueForFraction(this.currentFraction);

		// update the targets state
		if (updateTarget) {
			this.updateTargetState(Animator.TargetState.Update);
		}
	}

	updateValueForFraction(fraction) {
		if (this.animationPaths != null) {
			var len = this.animationPaths.length;

			for (var i = 0; i < len; ++i) {
				this.currentValue.set(
					this.animationPaths[i].getProperty(),
					this.animationPaths[i].getValue(fraction));
			}
		}
	}

	updateValueForZeroDuration(updateTarget) {
		var len = this.animationPaths.length;

		for (var i = 0; i < len; ++i) {
			var keyframeIndex = (this.isReversed ? 0 : this.animationPaths[i].getKeyframes().length - 1);

			this.currentValue.set(
				this.animationPaths[i].getProperty(),
				this.animationPaths[i].getKeyframes()[keyframeIndex].getValue());
		}

		if (updateTarget) {
			this.updateTargetState(Animator.TargetState.Update);
		}
	}

	update() {
		var repeated = false;

		if (this.isRunning || this.doSeek) {
			var currentTimeTick = Animator.CurrentTimeTick;
			var currentTime = currentTimeTick - this.currentStartTime;

			// update our total running time
			this.totalTime = currentTimeTick - this.startTime;

			if (currentTime >= this.duration) {
				var currentRepeatCount = 2;

				if ((this.duration + this.repeatDelay) > 0) {
					currentRepeatCount += Math.floor((this.totalTime - this.duration) / (this.duration + this.repeatDelay));
				}

				// continue repetition
				if (this.repeatCount == 0 || currentRepeatCount <= this.repeatCount) {
					// there is no delay, so repeat this animation right away
					if (this.repeatDelay == 0) {
						this.currentTime = currentTime % this.duration;
						this.currentStartTime = Animator.CurrentTimeTick - this.currentTime;

						currentTime = this.currentTime;

						if (this.repeatBehavior == RepeatBehavior.Reverse) {
							this.isReversed = !this.isReversed;
						}

						repeated = true;
					}
					else {
						// there is a delay in repeating, if we are seeking we need to 
						// compensate for this
						if (this.doSeek) {
							this.currentTime = currentTime % (this.duration + this.repeatDelay);

							if (this.currentTime > this.duration) {
								this.currentTime = this.duration;
							}

							this.updateValue(this.currentTime, true);
							return false;
						}

						// otherwise just remove this animator and wait for the
						// repeatDelay time to pass to start again
						else {
							this.currentTime = this.duration;
							this.updateValue(this.currentTime, true);

							Animator.removeAnimator(this);

							var timer = new Timer(this.repeatDelay, 1);
							timer.addEventHandler(TimerEvent.TICK, this.repeatDelayTimerTick.asDelegate(this));
							timer.start();

							return false;
						}
					}
				}

				// this is done
				else if (currentTime > this.duration) {
					currentTime = this.duration;
					this.totalTime = this.duration;
				}
			}

			// update the current animation time
			this.currentTime = currentTime;

			if (currentTime >= this.duration && !this.doSeek) {
				// this animation is finished
				if (!this.playInReverse || this.delay == 0) {
					this.updateValue(currentTime, false);
					this.end();

					return true;
				}
				else {
					this.stopImpl();
					this.delayAnimation(this.delay);
				}
			}
			else {
				if (repeated) {
					this.updateTargetState(Animator.TargetState.Repeat);
				}

				this.updateValue(currentTime, true);
			}
		}

		return false;
	}

	repeatDelayTimerTick(event) {
		// swap reverse
		if (this.repeatBehavior == RepeatBehavior.Reverse) {
			this.isReversed = !this.isReversed;
		}

		// update the target back to the start
		this.updateValue(0, true);
		this.updateTargetState(Animator.TargetState.Repeat);

		// add the animator back into our running list
		Animator.addAnimator(this);
	}

	updateTargetState(state) {

		if (this.target == null) {
			return;
		}

		switch (state) {
		case Animator.TargetState.Start:
			this.target.startAnimationImpl(this);
			break;
		case Animator.TargetState.Stop:
			this.target.stopAnimationImpl(this);
			break;
		case Animator.TargetState.Update:
			this.target.updateAnimationImpl(this);
			break;
		case Animator.TargetState.Repeat:
			this.target.repeatAnimationImpl(this);
			break;
		case Animator.TargetState.End:
			this.target.endAnimationImpl(this);
			break;
		}
	}

	delayAnimation(delayTime) {

		// ensure our timer is running
		Animator.startTimerIfNeeded();

		// determine the index at which the new animation should be added
		// delayed animators are ordered by their delayed time
		var startTime = this.computeDelayedAnimationStartTime(delayTime);
		var index = this.getDelayedAnimationIndexBeforeTime(startTime);
		var delayedAnimator = new DelayedAnimator(this, startTime);

		if (index == -1) {
			Animator.DelayedAnimators.push(delayedAnimator);
		} else {
			Animator.DelayedAnimators.splice(index, 0, delayedAnimator);
		}

		// make sure all the delayed animations have their index
		// values updated so there are in sequential order
		this.updateDelayedAnimationIndices();
	}

	computeDelayedAnimationStartTime(delayTime) {
		return Animator.getCurrentTime() + delayTime;
	}

	getDelayedAnimationIndexBeforeTime(t) {
		var len = Animator.DelayedAnimators.length;

		for (var i = 0; i < len; ++i) {
			if (t < Animator.DelayedAnimators[i].getDelay()) {
				return i;
			}
		}

		return -1;
	}

	updateDelayedAnimationIndices() {
		var len = Animator.DelayedAnimators.length;
		var animator = null;

		for (var i = 0; i < len; ++i) {
			animator = Animator.DelayedAnimators[i].getAnimator();
			animator.delayIndex = i;
		}
	}

	removeFromDelayedAnimations() {
		if (this.delayIndex != -1) {
			Animator.DelayedAnimators.removeAt(this.delayIndex);
			this.delayIndex = -1;
		}
	}

	static addAnimator(animator) {
		animator.index = Animator.getActiveAnimationCount();

		Animator.ActiveAnimators.push(animator);
		Animator.startTimerIfNeeded();
		Animator.CurrentTimeTick = Animator.getCurrentTime();

		animator.currentStartTime = Animator.CurrentTimeTick;
	}

	static removeAnimator(animator) {
		Animator.removeAnimatorAt(animator.index);
	}

	static removeAnimatorAt(index) {
		if (index >= 0 && index < Animator.getActiveAnimationCount()) {
			Animator.ActiveAnimators.removeAt(index);

			for (var i = index; i < Animator.getActiveAnimationCount(); i++) {
				var animation = Animator.ActiveAnimators[i];
				animation.index--;
			}
		}

		this.stopTimerIfDone();
	}

	static startTimerIfNeeded() {
		if (Animator.AnimationTimer == null) {
			Animator.pulse();

			var timer = new Timer(Animator.AnimationTimerInterval);
			timer.addEventHandler(TimerEvent.TICK, Animator.animationTimerTick.bind(Animator));
			timer.start();

			Animator.AnimationTimer = timer;
		}
	}

	static stopTimerIfDone() {
		if (Animator.AnimationTimer != null && Animator.getActiveAnimationCount() == 0 &&
			Animator.getDelayedAnimationCount() == 0) {
			Animator.CurrentTimeTick = -1;
			Animator.AnimationTimer.reset();
			Animator.AnimationTimer = null;
		}
	}

	static animationTimerTick(event) {
		var i = 0;

		Animator.CurrentTimeTick = Animator.pulse();

		while (i < Animator.ActiveAnimators.length) {
			var incrementIndex = true;
			var animation = Animator.ActiveAnimators[i];

			if (animation != null) {
				incrementIndex = !animation.update();
			}

			if (incrementIndex) {
				++i;
			}
		}

		while (Animator.DelayedAnimators.length > 0) {
			var delayedAnim = Animator.DelayedAnimators[0].getAnimator();
			var delay = Animator.DelayedAnimators[0].getDelay();

			if (delay < Animator.getCurrentTime()) {
				if (delayedAnim.getPlayInReverse()) {
					delayedAnim.end();
				} else {
					delayedAnim.start();
				}
			}
			else {
				break;
			}
		}
	}

	static pulse() {
		var startTime = Animator.CurrentStartTime;
		var currentTime;

		if (startTime < 0) {
			startTime = System.getTimer();
		}

		currentTime = System.getTimer() - startTime;

		Animator.CurrentStartTime = startTime;
		Animator.CurrentTime = currentTime;

		return currentTime;
	}

	static getCurrentTime() {
		if (Animator.CurrentTime < 0) {
			return Animator.pulse();
		}

		return Animator.CurrentTime;
	}

	static getActiveAnimationCount() {
		return Animator.ActiveAnimators.length;
	}

	static getDelayedAnimationCount() {
		return Animator.DelayedAnimators.length;
	}
}

Animator.TargetState = {
	"Start": 1,
	"Stop": 2,
	"Update": 3,
	"Repeat": 4,
	"End": 5
};
Animator.ActiveAnimators = [];
Animator.DelayedAnimators = [];
Animator.AnimationTimer = null;
Animator.AnimationTimerInterval = 10;
Animator.CurrentTimeTick = -1;
Animator.CurrentTime = -1;
Animator.CurrentStartTime = -1;

export default Animator;

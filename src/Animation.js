import EventDispatcher from "./EventDispatcher";
import SineEase from "./SineEase";
import EasingMode from "./EasingMode";
import NumberInterpolator from "./NumberInterpolator";
import RepeatBehavior from "./RepeatBehavior";
import Animation from "./Animation";
import Timer from "./Timer";
import TimerEvent from "./TimerEvent";
import Animator from "./Animator";
import AnimationEvent from "./AnimationEvent";
import LinearEase from "./LinearEase";

/**
 * SUMMARY:
 *  This class defines the base for all other animations, typically you do not create an instance of this
 *  class directly, but instead use one of it's subclasses.
 *
 *  When another animation class does not meet your needs, this class can be used to create custom animations
 *  by specifying the properties and values using the animationPaths property, interpolation, easing and repeat
 *  behavior.
 *
 *
 * @EVENT AnimationEvent.BEGIN
 *
 * SUMMARY:
 *  Dispatched when the animation has begun.
 *
 * @EVENT AnimationEvent.STOP
 *
 * SUMMARY:
 *  Dispatched when the animation has been stopped.
 *
 * REMARKS:
 *  This event doesn't always indicate the animation is finished, to
 *  find out when the animation has actually been completed, use the
 *  AnimationEvent.COMPLETE event instead.
 *
 * @EVENT AnimationEvent.COMPLETE
 *
 * SUMMARY:
 *  Dispatched when the animation has completed all the way to the end.
 *
 * @EVENT AnimationEvent.REPEAT
 *
 * SUMMARY:
 *  Dispatched when the animation has repeated.
 *
 */
class Animation extends EventDispatcher {
	constructor(drawable) {
		/**
		 * SUMMARY:
		 *  Creates a new Animation object that animates one or more properties on
		 *  the specified animatable.
		 *
		 *  Even though the parameter name is drawable, any object that has been defined
		 *  with the Animatable mixin can participate in animations.
		 *
		 * PARAMS:
		 *  Animatable drawable:
		 *    An instance of a Animatable that will receive the animation updates.
		 */
		super();

		this.drawable = drawable;
		this.animationPaths = [];
		this.easingFunction = new SineEase(EasingMode.Out);
		this.interpolator = NumberInterpolator.getInstance();
		this.repeatBehavior = RepeatBehavior.Loop;
		this.repeatCount = 1;
		this.repeatDelay = 0;
		this.delay = 0;
		this.seekTime = 0;
		this.duration = 500;
		this.durationHasBeenSet = false;
		this.reverseAnimation = false;
		this.animator = null;
	}

	getDrawable() {
		/**
		 * SUMMARY:
		 *  Gets the drawable associated with this animation.
		 *
		 * RETURNS (Drawable):
		 *  The drawable that was specified during initialization.
		 */

		return this.drawable;
	}

	setDrawable(value) {
		/**
		 * SUMMARY:
		 *  Associates a drawable with this animation.
		 *
		 * REMARKS:
		 *  Throws an error if the animator has already been created.
		 *
		 * PARAMS:
		 *  Drawable value:
		 *    An instance of a Drawable, this drawable will be
		 *    updated according to the animating property's options.
		 *
		 * RETURNS (void):
		 */

		this.throwIfHaveAnimator();
		this.drawable = value;
	}

	getAnimationPaths() {
		/**
		 * SUMMARY:
		 *  Gets an array of AnimationPath objects that can be used to
		 *  find tune your animation.
		 *
		 * RETURNS (AnimationPath[]):
		 *  An array of AnimationPath objects.
		 */

		return this.animationPaths;
	}

	clearAnimationPaths() {
		/**
		 * SUMMARY:
		 *  Removes all animation paths from this animation.
		 *
		 * REMARKS:
		 *  Throws an error if the animator has already been created.
		 *
		 * RETURNS (void):
		 */

		this.throwIfHaveAnimator();
		this.animationPaths = [];
	}

	addAnimationPath(path) {
		/**
		 * SUMMARY:
		 *  Adds a new AnimationPath to this animation.
		 *
		 * REMARKS:
		 *  Throws an error if the animator has already been created.
		 *
		 * PARAMS:
		 *  AnimationPath path:
		 *    The AnimationPath you wish to add.
		 *
		 * RETURNS (void):
		 */

		this.throwIfHaveAnimator();
		this.animationPaths.push(path);
	}

	getEasingFunction() {
		/**
		 * SUMMARY:
		 *  Gets the easing function associated with this animation.
		 *
		 *  The default easing function is a SineEase.
		 *
		 * RETURNS (EasingFunction):
		 *  A EasingFunction, if no easing function was set then
		 *  the default SineEase will be returned
		 */

		return this.easingFunction;
	}

	setEasingFunction(value) {
		/**
		 * SUMMARY:
		 *  Sets the easing function for this animation.
		 *
		 * REMARKS:
		 *  Throws an error if the animator has already been created.
		 *
		 * PARAMS:
		 *  EasingFunction value:
		 *    An instance of an easing function.
		 *
		 * RETURNS (void):
		 */

		this.throwIfHaveAnimator();

		if (value == null) {
			value = Animation.getNullEasingFunction();
		}

		this.easingFunction = value;
	}

	getInterpolator() {
		/**
		 * SUMMARY:
		 *  Gets the current interpolator associated with this animation.
		 *
		 *  The default is a NumberInterpolator.
		 *
		 * RETURNS (Interpolator):
		 *  A Interpolator, if no interpolator was set then
		 *  the default NumberInterpolator will be returned.
		 */

		return this.interpolator;
	}

	setInterpolator(value) {
		/**
		 * SUMMARY:
		 *  Sets the interpolator for this animation. By default the
		 *  NumberInterpolator is used which performs the interpolation
		 *  from one number value to another, however, if your value is a
		 *  color, for example, you may wish to use the ColorInterpolator
		 *  instead.
		 *
		 * REMARKS:
		 *  Throws an error if the animator has already been created.
		 *
		 * PARAMS:
		 *  Interpolator value:
		 *    An instance of an interpolator.
		 *
		 * RETURNS (void):
		 */

		this.throwIfHaveAnimator();
		this.interpolator = value;
	}

	getRepeatBehavior() {
		/**
		 * SUMMARY:
		 *  Gets the current repeat behavior for this animation.
		 *
		 *  The default is a RepeatBehavior.Loop.
		 *
		 * RETURNS (RepeatBehavior):
		 *  A value indicating one of the constants in RepeatBehavior.
		 */

		return this.repeatBehavior;
	}

	setRepeatBehavior(value) {
		/**
		 * SUMMARY:
		 *  Sets the repeat behavior for this animation.
		 *
		 * REMARKS:
		 *  Throws an error if the animator has already been created.
		 *
		 * PARAMS:
		 *  RepeatBehavior value:
		 *    A constant RepeatBehavior value.
		 *
		 * RETURNS (void):
		 */

		this.throwIfHaveAnimator();
		this.repeatBehavior = value;
	}

	getRepeatCount() {
		/**
		 * SUMMARY:
		 *  Gets the number of times this animation should be repeated.
		 *
		 *  The default is a 1, meaning it will play a single time.
		 *
		 * RETURNS (Integer):
		 *  The number of times this animation will be repeated. If the
		 *  value is 0, then it will repeat forever.
		 */

		return this.repeatCount;
	}

	setRepeatCount(value) {
		/**
		 * SUMMARY:
		 *  Sets the repeat count for this animation.
		 *
		 * REMARKS:
		 *  Throws an error if the animator has already been created.
		 *
		 * PARAMS:
		 *  Integer value:
		 *    A number that indicates how many times this animation
		 *    should be repeated, 0 indicates it will repeat forever,
		 *    1 will make the animation play once, 2 will make it play
		 *    twice and so on...
		 *
		 * RETURNS (void):
		 */

		this.throwIfHaveAnimator();
		this.repeatCount = value;
	}

	getRepeatDelay() {
		/**
		 * SUMMARY:
		 *  Gets the delay (in milliseconds) for when the animation should
		 *  start playing again after it has finished.
		 *
		 *  The default is a 0.
		 *
		 * RETURNS (Number):
		 *  The number of milliseconds to wait before repeating this animation.
		 */

		return this.repeatDelay;
	}

	setRepeatDelay(value) {
		/**
		 * SUMMARY:
		 *  Sets the delay (in milliseconds) before the animation is
		 *  repeated.
		 *
		 * REMARKS:
		 *  Throws an error if the animator has already been created.
		 *
		 * PARAMS:
		 *  Number value:
		 *    The number of milliseconds to wait before repeating.
		 *
		 * RETURNS (void):
		 */

		this.throwIfHaveAnimator();
		this.repeatDelay = value;
	}

	getDelay() {
		/**
		 * SUMMARY:
		 *  Gets the delay (in milliseconds) for when this animation should
		 *  start for the first time.
		 *
		 *  The default is a 0.
		 *
		 * RETURNS (Number):
		 *  The number of milliseconds to wait before playing this animation.
		 */

		return this.delay;
	}

	setDelay(value) {
		/**
		 * SUMMARY:
		 *  Sets the delay (in milliseconds) before the animation is
		 *  played.
		 *
		 * REMARKS:
		 *  Throws an error if the animator has already been created.
		 *
		 * PARAMS:
		 *  Number value:
		 *    The number of milliseconds to wait before playing.
		 *
		 * RETURNS (void):
		 */

		this.throwIfHaveAnimator();
		this.delay = value;
	}

	getDuration() {
		/**
		 * SUMMARY:
		 *  Gets the duration (in milliseconds) that the animation should play for.
		 *
		 *  The default is a 500 (half a second).
		 *
		 * RETURNS (Number):
		 *  The number of milliseconds this animation should last.
		 */

		return this.duration;
	}

	setDuration(value) {
		/**
		 * SUMMARY:
		 *  Sets the duration (in milliseconds) for how long the animation should
		 *  last.
		 *
		 * PARAMS:
		 *  Number value:
		 *    The number of milliseconds to play before the animation stops.
		 *
		 * RETURNS (void):
		 */

		this.duration = value;
		this.durationHasBeenSet = true;
	}

	getCurrentTime() {
		/**
		 * SUMMARY:
		 *  Gets the current time (in milliseconds).
		 *
		 * RETURNS (Number):
		 *  The number of milliseconds that have elapsed since the animation
		 *  started.
		 */

		return (this.animator != null ? this.animator.getElapsedTotalTime() : this.seekTime);
	}

	setCurrentTime(value) {
		/**
		 * SUMMARY:
		 *  Moves the playhead (in milliseconds) to the specified value.
		 *
		 * PARAMS:
		 *  Number value:
		 *    The number of milliseconds from (0 - duration) to seek to.
		 *
		 * RETURNS (void):
		 */

		if (this.animator != null) {
			this.animator.setElapsedTotalTime(value);
		}

		this.seekTime = value;
	}

	getIsRunning() {
		/**
		 * SUMMARY:
		 *  Determines whether or not this animation is currently running.
		 *
		 * RETURNS (Boolean):
		 *  true if the animation is running; otherwise false.
		 */

		return (this.animator != null ? this.animator.getIsRunning() : false);
	}

	setPlayInReversed(value) {
		/**
		 * SUMMARY:
		 *  Sets whether or not this animation should play forward or reverse.
		 *
		 * PARAMS:
		 *  Boolean value:
		 *    true to play the animation in reverse; otherwise false.
		 *
		 * RETURNS (void):
		 */

		if (value && this.animator != null) {
			this.animator.reverse();
		}

		this.reverseAnimation = value;
	}

	play() {
		/**
		 * SUMMARY:
		 *  Begins playing the animation from the start.
		 *
		 * RETURNS (void):
		 */

		this.playImpl();
	}

	playImpl() {
		// @PRIVATE
		var paths = this.getAnimationPaths();

		// since there is nothing to animate just fire off a timer when the
		// animation is supposed to finish so that any code expecting a completion 
		// event can still function
		if (paths == null || paths.length == 0) {
			var timer = new Timer(this.getDuration(), 1);
			timer.addEventHandler(TimerEvent.TICK, this.handleEmptyAnimationTick.asDelegate(this));
			timer.start();

			return;
		}

		var len = paths.length;

		for (var i = 0; i < len; ++i) {
			var ka = paths[i];
			var keyframes = ka.getKeyframes();

			if (keyframes == null) {
				continue;
			}

			// if we have a global interpolator then use it for
			// our key frame animations instead
			if (this.getInterpolator() != null) {
				ka.setInterpolator(this.getInterpolator());
			}

			var maxKeyframeDuration = ka.getDuration();

			if (this.getDuration() > 0 && maxKeyframeDuration > this.getDuration()) {
				this.setDuration(maxKeyframeDuration);
			}
		}

		this.animator = new Animator(this.getDuration());
		this.animator.setTarget(this);
		this.animator.setRepeatBehavior(this.getRepeatBehavior());
		this.animator.setRepeatCount(this.getRepeatCount());
		this.animator.setRepeatDelay(this.getRepeatDelay());
		this.animator.setDelay(this.getDelay());
		this.animator.setAnimationPaths(paths);
		this.animator.setInterpolator(this.getInterpolator());
		this.animator.setEaser(this.getEasingFunction());

		if (this.reverseAnimation) {
			this.animator.setPlayInReversed(true);
		}

		this.animator.play();

		if (this.seekTime > 0) {
			this.animator.setElapsedTotalTime(this.seekTime);
		}
	}

	pause() {
		/**
		 * SUMMARY:
		 *  Pauses this animation at the current time.
		 *
		 * RETURNS (void):
		 */

		if (this.animator != null) {
			this.animator.pause();
		}
	}

	stop() {
		/**
		 * SUMMARY:
		 *  Stops the animation and resets the playhead back to zero.
		 *
		 * RETURNS (void):
		 */

		if (this.animator != null) {
			this.animator.stop();
		}
	}

	resume() {
		/**
		 * SUMMARY:
		 *  Resumes playback from the current position.
		 *
		 * RETURNS (void):
		 */

		if (this.animator != null) {
			this.animator.resume();
		}
	}

	reverse() {
		/**
		 * SUMMARY:
		 *  Reverses the playback.
		 *
		 * RETURNS (void):
		 */

		if (this.animator != null) {
			this.animator.reverse();
		}

		this.reverseAnimation = !this.reverseAnimation;
	}

	end() {
		/**
		 * SUMMARY:
		 *  Immediately ends this animation an sends a AnimationEvent.COMPLETE event,
		 *  this is called internally, however, there may times when you wish to manually
		 *  end an animation and have it's COMPLETE event dispatched.
		 *
		 * RETURNS (void):
		 */
		if (this.animator != null) {
			this.animator.end();
			this.animator = null;
		}
	}

	finish() {
		// @PRIVATE
		this.dispatchEvent(new AnimationEvent(AnimationEvent.COMPLETE));
		this.animator = null;
	}

	handleEmptyAnimationTick(event) {
		// @PRIVATE
		this.finish();
	}

	applyValues(animator) {
		// @PRIVATE
		var paths = this.getAnimationPaths();
		var len = paths.length;

		for (var i = 0; i < len; ++i) {
			var propertyName = paths[i].getProperty();

			this.setValue(propertyName, animator.getCurrentValue().get(propertyName));
		}
	}

	finalizeValues() {
		// @PRIVATE

		var prevValue = null;
		var path = null;
		var keyframes = null;
		var len = this.animationPaths.length;

		for (var i = 0; i < len; ++i) {
			path = this.animationPaths[i];
			keyframes = path.keyframes;

			if (keyframes == null || keyframes.length == 0) {
				continue;
			}

			if (!this.isValidValue(keyframes[0].value)) {
				keyframes[0].value = this.getCurrentValue(path.property);
			}

			prevValue = keyframes[0].value;

			for (var j = 1; j < keyframes.length; ++j) {
				var kf = keyframes[j];

				if (!this.isValidValue(kf.value)) {
					kf.value = prevValue;
				}

				prevValue = kf.value;
			}
		}
	}

	isValidValue(value) {
		// @PRIVATE
		return ((value instanceof Number && !isNaN(Number(value))) || (!(value instanceof Number) && value !== null));
	}

	startAnimationImpl(animator) {
		// @PRIVATE
		this.finalizeValues();
		this.dispatchEvent(new AnimationEvent(AnimationEvent.BEGIN));
	}

	updateAnimationImpl(animator) {
		// @PRIVATE
		this.applyValues(animator);
	}

	repeatAnimationImpl(animator) {
		// @PRIVATE
		this.dispatchEvent(new AnimationEvent(AnimationEvent.REPEAT));
	}

	endAnimationImpl(animator) {
		// @PRIVATE
		this.finish();
	}

	stopAnimationImpl(animator) {
		// @PRIVATE
		this.dispatchEvent(new AnimationEvent(AnimationEvent.STOP));
	}

	setValue(propertyName, value) {
		// @PRIVATE
		var setter = this.drawable.getAnimatablePropertySetter(propertyName);

		if (setter != null) {
			setter.apply(this.drawable, [value]);
		}
	}

	getCurrentValue(propertyName) {
		// @PRIVATE
		var getter = this.drawable.getAnimatablePropertyGetter(propertyName);

		if (getter != null) {
			return getter.apply(this.drawable);
		}
	}

	throwIfHaveAnimator() {
		// @PRIVATE
		if (this.animator != null && this.getIsRunning()) {
			throw new Error("Cannot set property value when animation has already started.");
		}
	}

	static getNullEasingFunction() {
		// @PRIVATE
		if (Animation.NullEasingFunction == null) {
			Animation.NullEasingFunction = new LinearEase();
		}

		return Animation.NullEasingFunction;
	}
}

Animation.NullEasingFunction = null;

export default Animation;

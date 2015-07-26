MoAnimation = Class.create(MoEventDispatcher, 
/**
 * @CLASS
 *
 * SUMMARY:
 *  The base class for animations, you generally do not use this class directly, however
 *  for advanced usage and control you may wish to create your own animation subclass.
 *
 *  See existing subclasses or MoAnimationSet subclasses for classes you will more
 *  likely want to use.
 *
 */
{	
	initialize : function($super, drawable) {
		$super();
		
		this.drawable = drawable;
		this.animationPaths = [];
		this.easingFunction = new MoSineEase(MoEasingMode.Out);
		this.interpolator = MoNumberInterpolator.getInstance();
		this.repeatBehavior = MoRepeatBehavior.Loop;
		this.repeatCount = 1;
		this.repeatDelay = 0;
		this.delay = 0;
		this.seekTime = 0;
		this.duration = 500;
		this.durationHasBeenSet = false;
		this.reverseAnimation = false;
		this.animator = null;
	},
	
	getDrawable : function() {
		/**
		 * SUMMARY:
		 * 	Gets the drawable associated with this animation.
		 *
		 * RETURNS (MoDrawable):
		 *  The drawable that was specified during initialization.
		 */
	
		return this.drawable;
	},
	
	setDrawable : function(value) {
		/**
		 * SUMMARY:
		 * 	Associates a drawable with this animation.
		 *
		 * REMARKS:
		 *  Throws an error if the animator has already been created.
		 *
		 * PARAMS:
		 *  MoDrawable value:
		 *		An instance of a MoDrawable, this drawable will be
		 *		updated according to the animating property's options.
		 *
		 * RETURNS (void):
		 */

		this.throwIfHaveAnimator();
		this.drawable = value;
	},

	getAnimationPaths : function() {
		/**
		 * SUMMARY:
		 * 	Gets an array of MoAnimationPath objects that can be used to
		 *  find tune your animation.
		 *
		 * RETURNS (MoAnimationPath[]):
		 *  An array of MoAnimationPath objects.
		 */
	
		return this.animationPaths;
	},

	clearAnimationPaths : function() {
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
	},

	addAnimationPath : function(path) {
		/**
		 * SUMMARY:
		 *  Adds a new MoAnimationPath to this animation.
		 *
		 * REMARKS:
		 *  Throws an error if the animator has already been created.
		 *
		 * PARAMS:
		 *  MoAnimationPath path:
		 *		The MoAnimationPath you wish to add.
		 *
		 * RETURNS (void):
		 */
		 
		this.throwIfHaveAnimator();
		this.animationPaths.push(path);
	},

	getEasingFunction : function() {
		/**
		 * SUMMARY:
		 *  Gets the easing function associated with this animation.
		 *
		 *  The default easing function is a MoSineEase.
		 *
		 * RETURNS (MoEasingFunction):
		 *  A MoEasingFunction, if no easing function was set then
		 *  the default MoSineEase will be returned
		 */
		 
		return this.easingFunction;
	},
	
	setEasingFunction : function(value) {
		/**
		 * SUMMARY:
		 *  Sets the easing function for this animation.
		 *
		 * REMARKS:
		 *  Throws an error if the animator has already been created.
		 *
		 * PARAMS:
		 *  MoEasingFunction value:
		 *		An instance of an easing function.
		 *
		 * RETURNS (void):
		 */
		 
		this.throwIfHaveAnimator();
		
		if(value == null)
			value = MoAnimation.getNullEasingFunction();
		
		this.easingFunction = value;
	},

	getInterpolator : function() {
		/**
		 * SUMMARY:
		 *  Gets the current interpolator associated with this animation.
		 *
		 *  The default is a MoNumberInterpolator.
		 *
		 * RETURNS (MoInterpolator):
		 *  A MoInterpolator, if no interpolator was set then
		 *  the default MoNumberInterpolator will be returned.
		 */
	
		return this.interpolator;
	},
	
	setInterpolator : function(value) {
		/**
		 * SUMMARY:
		 *  Sets the interpolator for this animation. By default the
		 *  MoNumberInterpolator is used which performs the interpolation
		 *  from one number value to another, however, if your value is a
		 *  color, for example, you may wish to use the MoColorInterpolator
		 *  instead.
		 *
		 * REMARKS:
		 *  Throws an error if the animator has already been created.
		 *
		 * PARAMS:
		 *  MoInterpolator value:
		 *		An instance of an interpolator.
		 *
		 * RETURNS (void):
		 */
		 
		this.throwIfHaveAnimator();
		this.interpolator = value;
	},
	
	getRepeatBehavior : function() {
		/**
		 * SUMMARY:
		 *  Gets the current repeat behavior for this animation.
		 *
		 *  The default is a MoRepeatBehavior.Loop.
		 *
		 * RETURNS (MoRepeatBehavior):
		 *  A value indicating one of the constants in MoRepeatBehavior.
		 */

		return this.repeatBehavior;
	},
	
	setRepeatBehavior : function(value) {
		/**
		 * SUMMARY:
		 *  Sets the repeat behavior for this animation.
		 *
		 * REMARKS:
		 *  Throws an error if the animator has already been created.
		 *
		 * PARAMS:
		 *  MoRepeatBehavior value:
		 *		A constant MoRepeatBehavior value.
		 *
		 * RETURNS (void):
		 */
		 
		this.throwIfHaveAnimator();
		this.repeatBehavior = value;
	},
	
	getRepeatCount : function() {
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
	},
	
	setRepeatCount : function(value) {
		/**
		 * SUMMARY:
		 *  Sets the repeat count for this animation.
		 *
		 * REMARKS:
		 *  Throws an error if the animator has already been created.
		 *
		 * PARAMS:
		 *  Integer value:
		 *		A number that indicates how many times this animation
		 *		should be repeated, 0 indicates it will repeat forever,
		 *		1 will make the animation play once, 2 will make it play
		 *		twice and so on...
		 *
		 * RETURNS (void):
		 */
	
		this.throwIfHaveAnimator();
		this.repeatCount = value;
	},
	
	getRepeatDelay : function() {
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
	},
	
	setRepeatDelay : function(value) {
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
		 *		The number of milliseconds to wait before repeating.
		 *
		 * RETURNS (void):
		 */
	
		this.throwIfHaveAnimator();
		this.repeatDelay = value;
	},
	
	getDelay : function() {
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
	},
	
	setDelay : function(value) {
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
		 *		The number of milliseconds to wait before playing.
		 *
		 * RETURNS (void):
		 */
	
		this.throwIfHaveAnimator();
		this.delay = value;
	},
	
	getDuration : function() {
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
	},
	
	setDuration : function(value) {
		/**
		 * SUMMARY:
		 *  Sets the duration (in milliseconds) for how long the animation should
		 *  last.
		 *
		 * PARAMS:
		 *  Number value:
		 *		The number of milliseconds to play before the animation stops.
		 *
		 * RETURNS (void):
		 */
	
		this.duration = value;
		this.durationHasBeenSet = true;
	},
	
	getCurrentTime : function() {
		/**
		 * SUMMARY:
		 *  Gets the current time (in milliseconds).
		 *
		 * RETURNS (Number):
		 *  The number of milliseconds that have elapsed since the animation
		 *  started.
		 */
	
		return (this.animator != null ? this.animator.getElapsedTotalTime() : this.seekTime);
	},
	
	setCurrentTime : function(value) {
		/**
		 * SUMMARY:
		 *  Moves the playhead (in milliseconds) to the specified value.
		 *
		 * PARAMS:
		 *  Number value:
		 *		The number of milliseconds from (0 - duration) to seek to.
		 *
		 * RETURNS (void):
		 */
	
		if(this.animator != null)
			this.animator.setElapsedTotalTime(value);
		
		this.seekTime = value;
	},
	
	getIsRunning : function() {
		/**
		 * SUMMARY:
		 *  Determines whether or not this animation is currently running.
		 *
		 * RETURNS (Boolean):
		 *  true if the animation is running; otherwise false.
		 */
		 
		return (this.animator != null ? this.animator.getIsRunning() : false);
	},
	
	setPlayInReversed : function(value) {
		/**
		 * SUMMARY:
		 *  Sets whether or not this animation should play forward or reverse.
		 *
		 * PARAMS:
		 *  Boolean value:
		 *		true to play the animation in reverse; otherwise false.
		 *
		 * RETURNS (void):
		 */
	
		if(value && this.animator != null)
			this.animator.reverse();

		this.reverseAnimation = value;
	},
	
	play : function() {
		/**
		 * SUMMARY:
		 *  Begins playing the animation from the start.
		 *
		 * RETURNS (void):
		 */
	
		this.playImpl();
	},

	playImpl : function() {
		// @PRIVATE
		var paths = this.getAnimationPaths();
	
		// since there is nothing to animate just fire off a timer when the
		// animation is supposed to finish so that any code expecting a completion 
		// event can still function
		if(paths == null || paths.length == 0)
		{
			var timer = new MoTimer(this.getDuration(), 1);
			timer.addEventHandler(MoTimerEvent.TICK, this.handleEmptyAnimationTick.asDelegate(this));
			timer.start();

			return;
		}
		
		var len = paths.length;

		for(var i = 0; i < len; ++i)
		{
			var ka = paths[i];
			var keyframes = ka.getKeyframes();
			
			if(keyframes == null)
				continue;
				
			// if we have a global interpolator then use it for
			// our key frame animations instead
			if(this.getInterpolator() != null)
				ka.setInterpolator(this.getInterpolator());

			var maxKeyframeDuration = ka.getDuration();
			
			if(this.getDuration() > 0 && maxKeyframeDuration > this.getDuration())
				this.setDuration(maxKeyframeDuration);
		}
		
		this.animator = new MoAnimator(this.getDuration());
		this.animator.setTarget(this);
		this.animator.setRepeatBehavior(this.getRepeatBehavior());
		this.animator.setRepeatCount(this.getRepeatCount());
		this.animator.setRepeatDelay(this.getRepeatDelay());
		this.animator.setDelay(this.getDelay());
		this.animator.setAnimationPaths(paths);
		this.animator.setInterpolator(this.getInterpolator());
		this.animator.setEaser(this.getEasingFunction());
		
		if(this.reverseAnimation)
			this.animator.setPlayInReversed(true);
		
		this.animator.play();
		
		if(this.seekTime > 0)
			this.animator.setElapsedTotalTime(this.seekTime);
	},
	
	pause : function() {
		/**
		 * SUMMARY:
		 *  Pauses this animation at the current time.
		 *
		 * RETURNS (void):
		 */
	
		if(this.animator != null)
			this.animator.pause();
	},
	
	stop : function() {
		/**
		 * SUMMARY:
		 *  Stops the animation and resets the playhead back to zero.
		 *
		 * RETURNS (void):
		 */
	
		if(this.animator != null)
			this.animator.stop();
	},
	
	resume : function() {
		/**
		 * SUMMARY:
		 *  Resumes playback from the current position.
		 *
		 * RETURNS (void):
		 */
	
		if(this.animator != null)
			this.animator.resume();
	},
	
	reverse : function() {
		/**
		 * SUMMARY:
		 *  Reverses the playback.
		 *
		 * RETURNS (void):
		 */
		 
		if(this.animator != null)
			this.animator.reverse();
		
		this.reverseAnimation = !this.reverseAnimation;
	},
	
	end : function() {
		/**
		 * SUMMARY:
		 *  Immediately ends this animation an sends a MoAnimationEvent.COMPLETE event, 
		 *  this is called internally, however, there may times when you wish to manually
		 *  end an animation and have it's COMPLETE event dispatched.
		 *
		 * RETURNS (void):
		 */
		if(this.animator != null)
		{
			this.animator.end();
			this.animator = null;
		}
	},
	
	finish : function() {
		// @PRIVATE
		this.dispatchEvent(new MoAnimationEvent(MoAnimationEvent.COMPLETE));
		this.animator = null;
	},
	
	handleEmptyAnimationTick : function(event) {
		// @PRIVATE
		this.finish();
	},
	
	applyValues : function(animator) {
		// @PRIVATE
		var paths = this.getAnimationPaths();
		var len = paths.length;

		for(var i = 0; i < len; ++i)
		{
			var propertyName = paths[i].getProperty();

			this.setValue(propertyName, animator.getCurrentValue().get(propertyName));
		}
	},
	
	finalizeValues : function() {
		// @PRIVATE
		
		var prevValue = null;
		var path = null;
		var keyframes = null;
		var len = this.animationPaths.length;
		
		for(var i = 0; i < len; ++i)
		{
			path = this.animationPaths[i];
			keyframes = path.keyframes;
			
			if(MoIsNull(keyframes) || keyframes.length == 0)
				continue;
				
			if(!this.isValidValue(keyframes[0].value))
				keyframes[0].value = this.getCurrentValue(path.property);
				
			prevValue = keyframes[0].value;
			
			for(var j = 1; j < keyframes.length; ++j)
			{
				var kf = keyframes[j];

				if(!this.isValidValue(kf.value))
					kf.value = prevValue;

				prevValue = kf.value;
			}
		}
	},
	
	isValidValue : function(value) {
		// @PRIVATE
		return ((value instanceof Number && !isNaN(Number(value))) || (!(value instanceof Number) && value !== null));
	},

	startAnimationImpl : function(animator) {
		// @PRIVATE
		this.finalizeValues();
		this.dispatchEvent(new MoAnimationEvent(MoAnimationEvent.BEGIN));
	},

	updateAnimationImpl : function(animator) {
		// @PRIVATE
		this.applyValues(animator);
	},

	repeatAnimationImpl : function(animator) {
		// @PRIVATE
		this.dispatchEvent(new MoAnimationEvent(MoAnimationEvent.REPEAT));
	},
	
	endAnimationImpl : function(animator) {
		// @PRIVATE
		this.finish();
	},
	
	stopAnimationImpl : function(animator) {
		// @PRIVATE
		this.dispatchEvent(new MoAnimationEvent(MoAnimationEvent.STOP));
	},
	
	setValue : function(propertyName, value) {
		// @PRIVATE
		var setter = this.drawable.getAnimatablePropertySetter(propertyName);
		
		if(setter != null)
			setter.apply(this.drawable, [value]);
	},
	
	getCurrentValue : function(propertyName) {
		// @PRIVATE
		var getter = this.drawable.getAnimatablePropertyGetter(propertyName);
		
		if(getter != null)
			return getter.apply(this.drawable);
	},

	throwIfHaveAnimator : function() {
		// @PRIVATE
		if(!MoIsNull(this.animator) && this.getIsRunning())
			throw new Error("Cannot set property value when animation has already started.");
	}
});

Object.extend(MoAnimation, {
	// @PRIVATE
	NullEasingFunction : null,
	
	getNullEasingFunction : function() {
		// @PRIVATE
		if(MoIsNull(MoAnimation.NullEasingFunction))
			MoAnimation.NullEasingFunction = new MoLinearEase();
			
		return MoAnimation.NullEasingFunction;
	}
});
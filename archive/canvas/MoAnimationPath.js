MoAnimationPath = Class.create(MoEquatable, 
/**
 * @CLASS
 *
 * SUMMARY:
 *  The MoAnimationPath class represents a collection of MoKeyframe objects for an animation and the name of the 
 *  property on the target that should be animated. Each keyframe defines the property value at a specific instance
 *  in time while an animation is running. The animation then interpolates between the values specified by two keyframes
 *  to compute the final property value.
 *
 */
{
	initialize : function(property) {
		/**
		 * SUMMARY:
		 *  Initializes a new instance of the MoAnimationPath class with the specified property.
		 *
		 * PARAMS:
		 *  String property:
		 *		The name of the property you wish to animate.
		 *
		 * RETURNS (void):
		 */
		 
		this.property = MoValueOrDefault(property, null);
		this.keyframes = new Array();
		this.interpolator = MoNumberInterpolator.getInstance();
	},
	
	getProperty : function() {
		/**
		 * SUMMARY:
		 *  Gets the name of the target property to be animated.
		 *
		 * RETURNS (String):
		 *  The property name.
		 */
	
		return this.property;
	},
	
	setProperty : function(value) {
		/**
		 * SUMMARY:
		 *  Sets the name of the target property to be animated.
		 *
		 * PARAMS:
		 *  String property:
		 *		The name of the property you wish to animate.
		 *
		 * RETURNS (void):
		 */
		 
		this.property = value;
	},
	
	getInterpolator : function() {
		/**
		 * SUMMARY:
		 *  Gets the current interpolator, if no interpolator was set
		 *  then the default MoNumberInterpolator is returned.
		 *
		 * RETURNS (MoInterpolator):
		 *  The interpolator.
		 */
		return this.interpolator;
	},
	
	setInterpolator : function(value) {
		/**
		 * SUMMARY:
		 *  Sets the interpolator that will determine how the value of two keyframes
		 *  will be calculated.
		 *
		 * PARAMS:
		 *  MoInterpolator value:
		 *		The interpolator to use, this value cannot be null.
		 *
		 * RETURNS (void):
		 */
		this.interpolator = value;
	},
	
	getKeyframes : function() {
		/**
		 * SUMMARY:
		 *  Gets an array of MoKeyframe objects that represent the time/value pairs
		 *  that the property will take during animation.
		 *
		 * RETURNS (MoKeyframe[]):
		 *  A reference to the MoKeyframe array.
		 */
		return this.keyframes;
	},
	
	setKeyframes : function(value) {
		/**
		 * SUMMARY:
		 *  Set a sequence of MoKeyframe objects that will represent the time/value pairs
		 *  that the property will take duration animation. Each pair of keyframes determines
		 *  the animation during the time interval between the two. If the later of the two 
		 *  keyframes contains an easing function, then it will be used to determine the 
		 *  behavior during that time interval.
		 *
		 *  The sequence of keyframes must be of increasing time values, sorted from lowest
		 *  to highest.
		 *
		 * REMARKS:
		 *  All animations always start at 0 and will last for the duration equal to the time
		 *  value of the last keyframe. If no keyframe is defined at 0, then that keyframe is
		 *  implicit and uses the value of the target property at the time the animation begins.
		 *
		 * PARAMS:
		 *  MoKeyframe[] value:
		 *		An array of MoKeyframe objects.
		 *
		 * RETURNS (void):
		 */
		this.keyframes = value;
	},

	clearKeyframes : function() {
		/**
		 * SUMMARY:
		 *  Removes all keyframes.
		 *
		 * RETURNS (void):
		 */
		this.keyframes = [];
	},

	addKeyframe : function(keyframe) {
		/**
		 * SUMMARY:
		 *  Adds a single keyframe to the path. See setKeyframes for a description of how
		 *  keyframes work.
		 *
		 * PARAMS:
		 *  MoKeyframe keyframe:
		 *		The keyframe to set, the time must be greater than the time of the last keyframe
		 *		and the keyframe cannot be null.
		 *
		 * RETURNS (void):
		 */
		this.keyframes.push(keyframe);
	},
	
	getDuration : function() {
		// @PRIVATE
		if(this.getKeyframes() == null)
			return -1;

		var keyframes = this.getKeyframes();
		var len = keyframes.length;
		var duration = 0;
		
		for(var i = 0; i < len; i++)
			duration = Math.max(keyframes[i].getKeyTime(), duration);

		return duration;
	},
	
	getValue : function(fraction) {
		/**
		 * SUMMARY:
		 *  Gets the interpolated value from the specified elapsed time fraction. The value is calculated by
		 *  determining the keyframe interval that the specified fraction falls within and then interpolates
		 *  between the values of the keyframes in that interval.
		 *
		 * PARAMS:
		 *  Number fraction:
		 *		The elapsed time fraction, specified in the overall duration of the animation, from 0.0 - 1.0.
		 *
		 *		For example, if the total duration is 1 seconds long, and you want to find out what the value
		 *		would be at half a second, you would pass in 0.5.
		 *
		 * RETURNS (Any):
		 *  The interpolated property value.
		 */
		if(this.getKeyframes() == null)
			return null;

		var keyframes = this.getKeyframes();
		var len = keyframes.length;
		
		// only two key frames, so this is a from/to, just interpolate using the
		// provided fraction, this may be outside of 0.0-1.0 for elastic type easing
		if(len == 2 && keyframes[1].getTimeFraction() == 1)
		{		
			return this.interpolator.interpolate(
				keyframes[1].getEaser() == null ? fraction : keyframes[1].getEaser().ease(fraction),
				keyframes[0].getValue(), 
				keyframes[1].getValue());
		}
		
		// ensure that all the key frame fractions are valid, if not
		// we need to update them so they are all scaled out according
		// to the last key frames duration
		if(!this.areKeyframesValid())
			this.validateKeyframesForDuration(keyframes[len-1].getKeyTime());

		// don't waste cpu cycles if we are at the last keyframe
		if(fraction == 1 && keyframes[len-1].keyTimeFraction == 1)
			return keyframes[len-1].getValue();
			
		// start with the first keyframe
		var prevValue = keyframes[0].getValue();
		var prevTimeFraction = keyframes[0].getTimeFraction();

		for(var i = 1; i < len; i++)
		{
			var kf = keyframes[i];
			
			// find the key frame that the specified fraction falls between
			if(fraction >= prevTimeFraction && fraction < kf.getTimeFraction())
			{
				var easer = kf.getEaser();
				var t = (fraction - prevTimeFraction) / (kf.getTimeFraction() - prevTimeFraction);
	
				if(easer != null)
					t = easer.ease(t);

				// interpolate between the previous value and this value
				return this.interpolator.interpolate(t, prevValue, kf.getValue());
			}

			prevTimeFraction = kf.getTimeFraction();
			prevValue = kf.getValue();
		}

		return keyframes[len-1].getValue();
	},

	areKeyframesValid : function() {
		// @PRIVATE
		return (this.keyframes[0].getTimeFraction() != -1);
	},

	validateKeyframesForDuration : function(duration) {
		// @PRIVATE
		var keyframes = this.getKeyframes();
		var len = keyframes.length;

		for(var i = 0; i < len; i++)
		{
			var kf = keyframes[i];
			kf.keyTimeFraction = (kf.getKeyTime() / duration);
		}
	}
});
MoAnimator = Class.create(MoEventDispatcher, 
// @PRIVATE
{

	initialize : function($super, duration) {
		$super();

		this.duration = MoValueOrDefault(duration, 0);
		this.startTime = -1;
		this.currentTime = -1;
		this.currentStartTime = -1;
		this.totalTime = -1;
		this.delay = 0;
		this.delayTime = -1;
		this.delayIndex = -1;
		this.repeatBehavior = MoRepeatBehavior.Loop;
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
		this.easer = new MoLinearEase();
		this.doSeek = false;
		this.doReverse = false;
		this.playInReverse = false;
		this.animationPaths = null;
	},
	
	getAnimationPaths : function() {
		return this.animationPaths;
	},

	setAnimationPaths : function(value) {
		this.animationPaths = value;
	},
	
	getEaser : function() {
		return this.easer;
	},
	
	setEaser : function(value) {
		this.easer = value;
	},
	
	getDuration : function() {
		return this.duration;
	},
	
	setDuration : function(value) {
		this.duration = value;
	},
	
	getDelay : function() {
		return this.delay;
	},
	
	setDelay : function(value) {
		this.delay = value;
	},
	
	getRepeatBehavior : function() {
		return this.repeatBehavior;
	},
	
	setRepeatBehavior : function(value) {
		this.repeatBehavior = value;
	},
	
	getRepeatCount : function() {
		return this.repeatCount;
	},
	
	setRepeatCount : function(value) {
		this.repeatCount = value;
	},
	
	getRepeatDelay : function() {
		return this.repeatDelay;
	},
	
	setRepeatDelay : function(value) {
		this.repeatDelay = value;
	},
	
	getIsRunning : function() {
		return this.isRunning;
	},
	
	getInterpolator : function() {
		return this.interpolator;
	},
	
	setInterpolator : function(value) {
		this.interpolator = value;
	},
	
	getTarget : function() {
		return this.target;
	},
	
	setTarget : function(value) {
		this.target = value;
	},
	
	getPlayInReverse : function() {
		return this.playInReverse;
	},
	
	setPlayInReverse : function(value) {

		if(this.isRunning)
		{
			if(this.isReversed != value)
			{
				this.isReversed = value;
				this.seek(this.duration - this.currentTime, true);
			}
		}
		
		this.doReverse = value;
		this.playInReverse = value;
	},
	
	getElapsedTotalTime : function() {
		return this.totalTime + this.delay;
	},
	
	setElapsedTotalTime : function(value) {
		this.seek(value, true);
	},
	
	getElapsedTime : function() {
		return this.currentTime;
	},
	
	getCurrentFractionValue : function() {
		return this.currentFraction;
	},
	
	getCurrentValue : function() {
		return this.currentValue;
	},
	
	play : function() {
		this.stopImpl();
		
		var len = this.animationPaths.length;
		var keyframes = null;
		var keyframeZero = null;

		for(var i = 0; i < len; ++i)
		{
			keyframes = this.animationPaths[i].getKeyframes();

			// the path has no keyframes, just move on
			if(keyframes.length == 0)
				continue;

			keyframeZero = keyframes[0];
			
			// ensure that the first keyframe is zero
			if(!keyframeZero.getIsValidKeyTime())
				keyframeZero.setKeyTime(0);

			// the first key frame doesn't start at zero so we need to put in
			// some filler frames to make up for the difference
			else if(keyframeZero.getKeyTime() > 0)
			{
				var startTime = keyframeZero.getKeyTime();
				
				// add a keyframe at zero with an invalid value
				keyframes.splice(0, 0, new MoKeyframe(0, null));
				
				// then add another keyframe right before it, if the first keyframe
				// starts at 1000ms then this keyframe would be 999, so 0-999, 999-1000, etc...
				keyframes.splice(1, 0, new MoKeyframe(startTime-1, null));

				// in reverse we just add the first value to the new filler keyframes
				// we just added, this way it just continues to zero with the same end
				// value all the way through
				if(this.getPlayInReverse())
				{
					keyframes[0].setValue(keyframes[2].getValue());
					keyframes[1].setValue(keyframes[2].getValue());
				}
			}

			for(var j = 1; j < keyframes.length; ++j)
			{
				// the keyframe's has an invalid time so the only thing we can really do is
				// just set it to our duration
				//
				// FIXME : we should just figure out the actual time it should be in this case
				//		   based on the keyframe before and after this keyframe
				//		   i.e. just pick something in the middle
				if(!keyframes[j].getIsValidKeyTime())
					keyframes[j].setKeyTime(this.getDuration());
			}

			// validate the keyframes, i.e. this will update our keyframes
			// time slice for the specified duration
			this.animationPaths[i].validateKeyframesForDuration(this.getDuration());
		}
		
		// reverse playback
		if(this.doReverse)
			this.isReversed = true;
		
		// don't start the animation now, add to our list of delayed
		// animations until it's ready to go
		if(this.getDelay() > 0 && !this.getPlayInReverse())
			this.delayAnimation(this.getDelay());

		// start it now
		else
			this.start();
	},
	
	pause : function() {
		if(this.delayIndex != -1)
		{
			var delayedAnimator = MoAnimator.DelayedAnimators[this.delayIndex];
			var pendingTime = delayedAnimator.getDelay();
			
			if(!isNaN(pendingTime) && pendingTime != -1)
			{
				this.delayTime = pendingTime - MoAnimator.getCurrentTime();
				this.removeFromDelayedAnimations();
			}
		}
		
		this.isRunning = false;
	},
	
	resume : function() {
		this.isRunning = true;
		
		if(this.delayTime >= 0)
		{
			this.delayAnimation(this.delayTime);
		}
		else
		{
			this.currentStartTime = MoAnimator.CurrentTimeTick - this.currentTime;
			this.startTime = MoAnimator.CurrentTimeTick - this.totalTime;
			
			if(this.doReverse)
			{
				this.reverse();
				this.doReverse = false;
			}
		}
	},
	
	start : function() {

		var actualStartTime = 0;
		
		if(!this.playInReverse)
		{
			if(this.delayIndex != -1)
			{
				var delayedAnimator = MoAnimator.DelayedAnimators[this.delayIndex];
				var overrun = MoAnimator.getCurrentTime() - delayedAnimator.getDelay();
				
				if(overrun > 0)
					actualStartTime = Math.min(overrun, this.duration);

				this.removeFromDelayedAnimations();
			}
		}
		
		this.updateTargetState(MoAnimator.TargetState.Start);
		this.updateInterpolators();
		this.updateValue(0, true);

		MoAnimator.addAnimator(this);

		this.startTime = this.currentStartTime;
		this.isRunning = true;
		
		if(actualStartTime > 0)
			this.seek(actualStartTime);
		
		this.hasStarted = true;
	},
	
	stop : function() {
		this.stopImpl();
		this.updateTargetState(MoAnimator.TargetState.Stop);
	},
	
	stopImpl : function() {
		this.removeFromDelayedAnimations();
	
		if(this.index >= 0)
		{
			MoAnimator.removeAnimatorAt(this.index);

			this.index = -1;
			this.isReversed = false;
			this.isRunning = false;
		}
	},
	
	end : function() {
		
		// remove the delayed animator, if exists
		if(this.delay > 0)
			this.removeFromDelayedAnimations();
		
		// make sure things go through the normal states
		if(!this.hasStarted)
			this.updateTargetState(MoAnimator.TargetState.Start);
		
		if(this.repeatCount > 1 && this.repeatBehavior == MoRepeatBehavior.Reverse && (this.repeatCount % 2 == 0))
			this.isReversed = true;
		
		// update to the end
		if(!(this.doReverse && this.delay > 0))
			this.updateValue(this.duration, true);

		// stop officially
		if(this.isRunning)
			this.stopImpl();
		else
			MoAnimator.stopTimerIfDone();
		
		// update targets state
		this.updateTargetState(MoAnimator.TargetState.End);		
	},
	
	seek : function(time, includeDelay) {
		includeDelay = MoValueOrDefault(includeDelay, false);
		
		this.startTime = this.currentStartTime = (MoAnimator.CurrentTimeTick - time);
		this.doSeek = true;
		
		if(!this.isRunning || this.playInReverse)
		{
			var isRunningTmp = this.isRunning;
			
			MoAnimator.CurrentTimeTick = MoAnimator.getCurrentTime();
			
			if(includeDelay && this.delay > 0)
			{
				if(this.delayIndex != -1)
				{
					var delayedAnimator = MoAnimator.DelayedAnimators[this.delayIndex];
					var postDelaySeekTime = time - this.delay;
					
					this.removeFromDelayedAnimations();
					
					if(this.playInReverse)
						postDelaySeekTime -= this.duration;
					
					if(postDelaySeekTime < 0)
					{
						this.delayAnimation(this.delay - time);
						return;
					}
					else
					{						
						time -= this.delay;
						
						if(!this.isRunning)
							this.start();
						
						this.startTime = this.currentStartTime = (MoAnimator.CurrentTimeTick - time);

						this.update();
						this.doSeek = false;
						return;
					}
				}
			}
			
			if(!isRunningTmp)
			{
				this.updateTargetState(MoAnimator.TargetState.Start);
				this.updateInterpolators();
			}
			
			this.startTime = this.currentStartTime = (MoAnimator.CurrentTimeTick - time);
		}
		
		this.update();
		this.doSeek = false;
	},
	
	reverse : function() {
		if(this.isRunning)
		{
			this.doReverse = false;
			this.seek(this.duration - this.currentTime);
			this.isReversed = !this.isReversed;
		}
		else
		{
			this.doReverse = !this.doReverse;
		}
	},
	
	updateInterpolators : function() {
		if(this.interpolator != null && this.animationPaths != null)
		{
			var len = this.animationPaths.length;

			for(var i = 0; i < len; ++i)
				this.animationPaths[i].setInterpolator(this.getInterpolator());
		}
	},	
	
	updateValue : function(time, updateTarget) {
		this.currentValue = new MoDictionary();

		// there is no specified duration so just update the animation
		// to the final values
		if(this.duration == 0)
		{
			this.updateValueForZeroDuration(updateTarget);
			return;
		}
		
		if(this.isReversed)
			time = this.duration - time;
		
		// compute the current easing fraction and update our value table
		this.currentFraction = this.easer.ease(time / this.duration);
		this.updateValueForFraction(this.currentFraction);

		// update the targets state
		if(updateTarget)
			this.updateTargetState(MoAnimator.TargetState.Update);
	},

	updateValueForFraction : function(fraction) {
		if(this.animationPaths != null)
		{
			var len = this.animationPaths.length;

			for(var i = 0; i < len; ++i)
			{
				this.currentValue.set(
					this.animationPaths[i].getProperty(),
					this.animationPaths[i].getValue(fraction));
			}
		}
	},

	updateValueForZeroDuration : function(updateTarget) {
		var len = this.animationPaths.length;

		for(var i = 0; i < len; ++i)
		{
			var keyframeIndex = (this.isReversed ? 0 : this.animationPaths[i].getKeyframes().length-1);
				
			this.currentValue.set(
				this.animationPaths[i].getProperty(), 
				this.animationPaths[i].getKeyframes()[keyframeIndex].getValue());
		}
			
		if(updateTarget)
			this.updateTargetState(MoAnimator.TargetState.Update);
	},
	
	update : function() {
		var repeated = false;
		
		if(this.isRunning || this.doSeek)
		{
			var currentTimeTick = MoAnimator.CurrentTimeTick;
			var currentTime = currentTimeTick - this.currentStartTime;

			// update our total running time
			this.totalTime = currentTimeTick - this.startTime;
			
			if(currentTime >= this.duration)
			{
				var currentRepeatCount = 2;
				
				if((this.duration + this.repeatDelay) > 0)
					currentRepeatCount += Math.floor((this.totalTime - this.duration) / (this.duration + this.repeatDelay));

				// continue repetition
				if(this.repeatCount == 0 || currentRepeatCount <= this.repeatCount)
				{
					// there is no delay, so repeat this animation right away
					if(this.repeatDelay == 0)
					{
						this.currentTime = currentTime % this.duration;
						this.currentStartTime = MoAnimator.CurrentTimeTick - this.currentTime;
						
						currentTime = this.currentTime;
						
						if(this.repeatBehavior == MoRepeatBehavior.Reverse)
							this.isReversed = !this.isReversed;
						
						repeated = true;
					}
					else
					{
						// there is a delay in repeating, if we are seeking we need to 
						// compensate for this
						if(this.doSeek)
						{
							this.currentTime = currentTime % (this.duration + this.repeatDelay);
							
							if(this.currentTime > this.duration)
								this.currentTime = this.duration;
							
							this.updateValue(this.currentTime, true);
							return false;
						}

						// otherwise just remove this animator and wait for the
						// repeatDelay time to pass to start again
						else
						{
							this.currentTime = this.duration;
							this.updateValue(this.currentTime, true);
							
							MoAnimator.removeAnimator(this);
							
							var timer = new MoTimer(this.repeatDelay, 1);
							timer.addEventHandler(MoTimerEvent.TICK, this.repeatDelayTimerTick.asDelegate(this));
							timer.start();
							
							return false;
						}
					}
				}

				// this is done
				else if(currentTime > this.duration)
				{	
					currentTime = this.duration;
					this.totalTime = this.duration;
				}
			}
			
			// update the current animation time
			this.currentTime = currentTime;

			if(currentTime >= this.duration && !this.doSeek)
			{
				// this animation is finished
				if(!this.playInReverse || this.delay == 0)
				{
					this.updateValue(currentTime, false);
					this.end();
					
					return true;
				}
				else
				{
					this.stopImpl();
					this.delayAnimation(this.delay);
				}
			}
			else
			{
				if(repeated)
					this.updateTargetState(MoAnimator.TargetState.Repeat);
				
				this.updateValue(currentTime, true);
			}
		}

		return false;
	},
	
	repeatDelayTimerTick : function(event) {
		// swap reverse
		if(this.repeatBehavior == MoRepeatBehavior.Reverse)
			this.isReversed = !this.isReversed;

		// update the target back to the start
		this.updateValue(0, true);
		this.updateTargetState(MoAnimator.TargetState.Repeat);

		// add the animator back into our running list
		MoAnimator.addAnimator(this);
	},

	updateTargetState : function(state) {

		if(this.target == null)
			return;

		switch(state)
		{
			case MoAnimator.TargetState.Start:
				this.target.startAnimationImpl(this);
				break;
			case MoAnimator.TargetState.Stop:
				this.target.stopAnimationImpl(this);
				break;
			case MoAnimator.TargetState.Update:
				this.target.updateAnimationImpl(this);
				break;
			case MoAnimator.TargetState.Repeat:
				this.target.repeatAnimationImpl(this);
				break;
			case MoAnimator.TargetState.End:
				this.target.endAnimationImpl(this);
				break;
		}
	},
	
	delayAnimation : function(delayTime) {

		// ensure our timer is running
		MoAnimator.startTimerIfNeeded();

		// determine the index at which the new animation should be added
		// delayed animators are ordered by their delayed time
		var startTime = this.computeDelayedAnimationStartTime(delayTime);
		var index = this.getDelayedAnimationIndexBeforeTime(startTime);
		var delayedAnimator = new MoDelayedAnimator(this, startTime);

		if(index == -1)
			MoAnimator.DelayedAnimators.push(delayedAnimator);
		else
			MoAnimator.DelayedAnimators.splice(index, 0, delayedAnimator);

		// make sure all the delayed animations have their index
		// values updated so there are in sequential order
		this.updateDelayedAnimationIndices();
	},

	computeDelayedAnimationStartTime : function(delayTime) {
		return MoAnimator.getCurrentTime() + delayTime;
	},

	getDelayedAnimationIndexBeforeTime : function(t) {
		var len = MoAnimator.DelayedAnimators.length;

		for(var i = 0; i < len; ++i)
		{
			if(t < MoAnimator.DelayedAnimators[i].getDelay())
				return i;
		}

		return -1;
	},

	updateDelayedAnimationIndices : function() {
		var len = MoAnimator.DelayedAnimators.length;
		var animator = null;
		
		for(var i = 0; i < len; ++i)
		{
			animator = MoAnimator.DelayedAnimators[i].getAnimator();
			animator.delayIndex = i;
		}
	},

	removeFromDelayedAnimations : function() {
		if(this.delayIndex != -1)
		{
			MoAnimator.DelayedAnimators.removeAt(this.delayIndex);
			this.delayIndex = -1;
		}
	}
});

MoDelayedAnimator = Class.create({	
	initialize : function(animator, delay) {
		this.animator = animator;
		this.delay = MoValueOrDefault(delay, 0);
	},
	
	getAnimator : function() {
		return this.animator;
	},
	
	setAnimator : function(value) {
		this.animator = value;
	},
	
	getDelay : function() {
		return this.delay;
	},
	
	setDelay : function(value) {
		this.delay = value;
	}
});

Object.extend(MoAnimator, 
// @PRIVATE
{
	TargetState : {
		"Start"		: 1,
		"Stop"		: 2,
		"Update"	: 3,
		"Repeat"	: 4,
		"End"		: 5
	},
	
	ActiveAnimators : new Array(),
	DelayedAnimators : new Array(),
	AnimationTimer : null,
	AnimationTimerInterval : 10,
	CurrentTimeTick : -1,
	CurrentTime : -1,
	CurrentStartTime : -1,
	
	addAnimator : function(animator) {
	
		animator.index = MoAnimator.getActiveAnimationCount();
		
		MoAnimator.ActiveAnimators.push(animator);
		MoAnimator.startTimerIfNeeded();
		MoAnimator.CurrentTimeTick = MoAnimator.getCurrentTime();
		
		animator.currentStartTime = MoAnimator.CurrentTimeTick;
	},
	
	removeAnimator : function(animator) {
		MoAnimator.removeAnimatorAt(animator.index);
	},
	
	removeAnimatorAt : function(index) {
		if(index >= 0 && index < MoAnimator.getActiveAnimationCount())
		{
			MoAnimator.ActiveAnimators.removeAt(index);
			
			for(var i = index; i < MoAnimator.getActiveAnimationCount(); i++)
			{
				var animation = MoAnimator.ActiveAnimators[i];
				animation.index--;
			}
		}
		
		MoAnimator.stopTimerIfDone();
	},
	
	startTimerIfNeeded : function() {
		if(MoAnimator.AnimationTimer == null)
		{
			MoAnimator.pulse();
			
			var timer = new MoTimer(MoAnimator.AnimationTimerInterval);
			timer.addEventHandler(MoTimerEvent.TICK, MoAnimator.animationTimerTick);
			timer.start();

			MoAnimator.AnimationTimer = timer;
		}
	},

	stopTimerIfDone : function() {
		if(MoAnimator.AnimationTimer != null && MoAnimator.getActiveAnimationCount() == 0 && MoAnimator.getDelayedAnimationCount() == 0)
		{
			MoAnimator.CurrentTimeTick = -1;
			MoAnimator.AnimationTimer.reset();
			MoAnimator.AnimationTimer = null;
		}
	},
	
	animationTimerTick : function(event) {
		var i = 0;
		
		MoAnimator.CurrentTimeTick = MoAnimator.pulse();

		while(i < MoAnimator.ActiveAnimators.length)
		{
			var incrementIndex = true;
			var animation = MoAnimator.ActiveAnimators[i];
			
			if(animation != null)
				incrementIndex = !animation.update();

			if(incrementIndex)
				++i;
		}
		
		while(MoAnimator.DelayedAnimators.length > 0)
		{
			var delayedAnim = MoAnimator.DelayedAnimators[0].getAnimator();
			var delay = MoAnimator.DelayedAnimators[0].getDelay();
			
			if(delay < MoAnimator.getCurrentTime())
			{
				if(delayedAnim.getPlayInReverse())
					delayedAnim.end();
				else
					delayedAnim.start();
			}
			else
			{
				break;
			}
		}
	},
	
	pulse : function() {
		var startTime = MoAnimator.CurrentStartTime;
		var currentTime = MoAnimator.CurrentTime;
		
		if(startTime < 0)
			startTime = MoGetTimer();

		currentTime = MoGetTimer() - startTime;

		MoAnimator.CurrentStartTime = startTime;
		MoAnimator.CurrentTime = currentTime;

		return currentTime;
	},
	
	getCurrentTime : function() {
		if(MoAnimator.CurrentTime < 0)
			return MoAnimator.pulse();

		return MoAnimator.CurrentTime;
	},
	
	getActiveAnimationCount : function() {
		return MoAnimator.ActiveAnimators.length;
	},
	
	getDelayedAnimationCount : function() {
		return MoAnimator.DelayedAnimators.length;
	}
});
MoSequenceAnimation = Class.create(MoAnimationSet, {	
	initialize : function($super) {
		$super();
		
		this.currentAnimationIndex = 0;
	},
	
	getCurrentAnimation : function() {
		if(this.currentAnimationIndex < this.getAnimationCount())
			return this.getAnimationAt(this.currentAnimationIndex);

		return null;
	},
	
	play : function() {
		this.playNext();
	},
	
	playNext : function() {
		if(this.currentAnimationIndex < this.getAnimationCount())
		{
			var animation = this.getAnimationAt(this.currentAnimationIndex++);

			if(animation != null)
			{
				animation.addEventHandler(MoAnimationEvent.COMPLETE, this.handleCurrentAnimationCompleteEvent.asDelegate(this));
				animation.play();
			}
		}
	},
	
	pause : function() {
		var animation = this.getCurrentAnimation();
		
		if(animation != null)
			animation.pause();
	},
	
	stop : function() {
		var animation = this.getCurrentAnimation();
		
		if(animation != null)
			animation.stop();
	},
	
	resume : function() {
		var animation = this.getCurrentAnimation();
		
		if(animation != null)
			animation.resume();
	},
	
	reverse : function() {
		var animation = this.getCurrentAnimation();
		
		if(animation != null)
			animation.reverse();
	},
	
	handleCurrentAnimationCompleteEvent : function(event) {
		this.playNext();
	}
});
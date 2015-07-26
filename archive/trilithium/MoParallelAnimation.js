MoParallelAnimation = Class.create(MoAnimationSet, {	
	initialize : function($super) {
		$super();
	},
	
	play : function() {
		this.updateAnimations("play");
	},
	
	pause : function() {
		this.updateAnimations("pause");
	},
	
	stop : function() {
		this.updateAnimations("stop");
	},
	
	resume : function() {
		this.updateAnimations("resume");
	},
	
	reverse : function() {
		this.updateAnimations("reverse");
	},
	
	updateAnimations : function(toState) {
		var len = this.getAnimationCount();
		var animation = null;

		for(var i = 0; i < len; i++)
		{
			animation = this.getAnimationAt(i);
			
			if(animation != null)
			{
				switch(toState)
				{
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
});
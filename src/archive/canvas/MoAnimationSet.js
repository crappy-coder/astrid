MoAnimationSet = Class.create(MoEventDispatcher, {	
	initialize : function($super) {
		$super();
		
		this.animations = new Array();
	},

	play : function() {
		/** override **/
	},

	pause : function() {
		/** override **/
	},

	resume : function() {
		/** override **/
	},

	stop : function() {
		/** override **/
	},

	reverse : function() {
		/** override **/
	},

	getAnimationAt : function(index) {
		return this.animations[index];
	},
	
	getAnimationCount : function() {
		return this.animations.length;
	},
	
	indexOfAnimation : function(animation) {
		return this.animations.indexOf(animation);
	},
	
	addAnimation : function(animation) {
		this.animations.push(animation);
	},
	
	removeAnimation : function(animation) {
		this.animations.remove(animation);
	},
	
	removeAnimationAt : function(index) {
		this.animations.removeAt(index);
	},
		
	clear : function() {
		this.animations.clear();
	}
});
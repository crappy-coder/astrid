MoBasicAnimation = Class.create(MoAnimation, {
	initialize : function($super, target, propertyName, fromValue, toValue) {
		$super(target);

		this.fromValue = fromValue;
		this.toValue = toValue;
		this.propertyName = propertyName;
	},

	getFromValue : function() {
		return this.fromValue;
	},

	setFromValue : function(value) {
		this.fromValue = value;
	},
	
	getToValue : function() {
		return this.toValue;
	},
	
	setToValue : function(value) {
		this.toValue = value;
	},
	
	getPropertyName : function() {
		return this.propertyName;
	},

	setPropertyName : function(value) {
		this.propertyName = value;
	},
	
	play : function() {
		var animationPath = new MoAnimationPath(this.getPropertyName());
		animationPath.addKeyframe(new MoKeyframe(0, this.getFromValue()));
		animationPath.addKeyframe(new MoKeyframe(this.getDuration(), this.getToValue()));

		this.clearAnimationPaths();
		this.addAnimationPath(animationPath);

		this.playImpl();
	}
});
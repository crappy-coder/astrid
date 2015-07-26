MoColorAnimation = Class.create(MoBasicAnimation, {	
	initialize : function($super, target, propertyName, fromColor, toColor) {
		$super(target, propertyName, fromColor, toColor);

		this.setInterpolator(MoColorInterpolator.getInstance());
	}
});
MoCubicEase = Class.create(MoPowerEase, {
	initialize : function($super, easingModeOrPercent) {
		$super(easingModeOrPercent, 2);
	}
});
MoQuartEase = Class.create(MoPowerEase, {
	initialize : function($super, easingModeOrPercent) {
		$super(easingModeOrPercent, 4);
	}
});
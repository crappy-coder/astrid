MoAudioSource = Class.create(MoMediaSource, {
	initialize : function($super, url, simpleType, codec) {
		$super(url, "audio/" + simpleType, codec);
	}
});
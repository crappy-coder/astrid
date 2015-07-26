MoAudio = Class.create(MoNamedObject, MoMediaBase, {
	initialize : function($super, name, sourceElement) {
		$super(name);

		this.initializeMedia(MoValueOrDefault(sourceElement, document.createElement("audio")));
	}
});

Object.extend(MoAudio, {

	// TODO : need to add the audio element sources
	fromAudioElement : function(audioElement) {
		var name = (audioElement.id != null ? audioElement.id : (audioElement.name != null ? audioElement.name : ""));

		return new MoAudio(name, audioElement);
	},
	
	create : function(name, source) {
		var mgr = MoAudioManager.getInstance();

		// the source is a list of media sources so we
		// add each one
		if(source instanceof Array)
		{
			var len = source.length;

			for(var i = 0; i < len; ++i)
				mgr.addSource(name, source[i]);
		}
		else
		{
			mgr.addSource(name, source);
		}

		return mgr.getAudio(name);
	},

	play : function(name, source) {
		var audio = MoAudio.create(name, source);

		MoAudioManager.getInstance().play(name);

		return audio;
	},

	pause : function(name) {
		MoAudioManager.getInstance().pause(name);
	},

	resume : function(name) {
		MoAudioManager.getInstance().play(name);
	},

	stop : function(name) {
		MoAudioManager.getInstance().stop(name);
	},

	seek : function(name, position) {
		MoAudioManager.getInstance().seek(name, position);
	}	
	
});
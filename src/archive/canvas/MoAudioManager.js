MoAudioManager = Class.create({
	initialize : function() {
		this.sourceLookup = new MoDictionary();
	},
	
	addSource : function(name, audioSource) {
		var audio = null;
		
		if(!this.sourceLookup.containsKey(name))
		{
			audio = new MoAudio(name);
			audio.setAutoPlay(false);
			
			this.sourceLookup.set(name, audio);
		}

		audio = this.sourceLookup.get(name);
		audio.addSource(audioSource);
	},

	clearSources : function(name) {
		if(this.sourceLookup.containsKey(name))
		{
			var audio = this.sourceLookup.get(name);
			audio.stop();
			
			this.sourceLookup.remove(name);
		}
	},
	
	clearAll : function() {
		var keys = this.sourceLookup.getKeys();
		
		for(var i = 0; i < keys.length; i++)
			this.clearSources(keys[i]);
	},
	
	getAudio : function(name) {
		return this.sourceLookup.get(name);
	},
	
	play : function(name) {
		var audio = this.getAudio(name);
		
		if(audio != null)
		{
			if(!audio.getIsReady())
				audio.load();

			audio.play();
		}
	},
	
	playAll : function() {
		var keys = this.sourceLookup.getKeys();
		
		for(var i = 0; i < keys.length; i++)
			this.play(keys[i]);
	},
	
	pause : function(name) {
		var audio = this.getAudio(name);
		
		if(audio != null)
			audio.pause();
	},

	pauseAll : function() {
		var keys = this.sourceLookup.getKeys();
		
		for(var i = 0; i < keys.length; i++)
			this.pause(keys[i]);
	},
	
	stop : function(name) {
		var audio = this.getAudio(name);
		
		if(audio != null)
			audio.stop();
	},
	
	stopAll : function() {
		var keys = this.sourceLookup.getKeys();
		
		for(var i = 0; i < keys.length; i++)
			this.stop(keys[i]);
	},
	
	seek : function(name, position) {
		var audio = this.getAudio(name);
		
		if(audio != null)
			audio.seek(position);
	}
});

Object.extend(MoAudioManager, {
	Instance : null,
	
	getInstance : function() {
		if(MoAudioManager.Instance == null)
			MoAudioManager.Instance = new MoAudioManager();

		return MoAudioManager.Instance;
	}
});
MoMediaSource = Class.create({
	initialize : function(url, type, audioCodec, videoCodec) {
		/** String **/
		this.url = MoValueOrDefault(url, null);
		
		/** String **/
		this.type = MoValueOrDefault(type, null);
		
		/** String **/
		this.audioCodec = MoValueOrDefault(audioCodec, null);
		
		/** String **/
		this.videoCodec = MoValueOrDefault(videoCodec, null);
	},
	
	getUrl : function() {
		return this.url;
	},
	
	setUrl : function(value) {
		this.url = value;
	},
	
	getType : function() {
		return this.type;
	},
	
	setType : function(value) {
		this.type = value;
	},
	
	getAudioCodec : function() {
		return this.audioCodec;
	},
	
	setAudioCodec : function(value) {
		this.audioCodec = value;
	},
	
	getVideoCodec : function() {
		return this.videoCodec;
	},
	
	setVideoCodec : function(value) {
			this.videoCodec = value;
	},
	
	toString : function() {
		var str = this.type;
		
		if(this.audioCodec != null)
		{
			str += "; codecs=\"" + this.audioCodec;
			
			if(this.videoCodec == null)
				str += "\"";
		}
		
		if(this.videoCodec != null)
		{
			if(this.audioCodec != null)
				str += ", " + this.videoCodec + "\"";
			else
				str += "; codecs=\"" + this.videoCodec + "\"";
		}
			
		return str;
	}
});
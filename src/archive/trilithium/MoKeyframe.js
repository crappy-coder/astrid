MoKeyframe = Class.create(MoEquatable, {
	initialize : function(keyTime, value) {
	
		/** Number **/
		this.keyTime = MoValueOrDefault(keyTime, -1);
		
		/** Object **/
		this.value = value;
		
		/** Number **/
		this.keyTimeFraction = -1;

		/** MoAnimationEaser **/
		this.easer = MoKeyframe.DefaultEaser;
	},
	
	getValue : function() {
		return this.value;
	},
	
	setValue : function(value) {
		this.value = value;
	},
	
	getKeyTime : function() {
		return this.keyTime;
	},
	
	setKeyTime : function(value) {
		this.keyTime = value;
	},
	
	getEaser : function() {
		return this.easer;
	},

	setEaser : function(value) {
		this.easer = MoValueOrDefault(value, MoKeyframe.DefaultEaser);
	},

	getTimeFraction : function() {
		return this.keyTimeFraction;
	},

	getIsValidKeyTime : function() {
		var t = this.getKeyTime();

		return (!isNaN(t) && t != -1);
	}
});

Object.extend(MoKeyframe, {
	DefaultEaser : new MoLinearEase()
});
MoDictionary = Class.create({
	initialize : function() {
		this.keys = new Array();
		this.values = new Array();
	},
	
	getKeys : function() {
		return this.keys;
	},
	
	getValues : function() {
		return this.values;
	},
	
	getCount : function() {
		return this.keys.length;
	},
	
	get : function(key) {
		var idx = this.keys.indexOf(key);
		
		if(idx == -1)
			return null;

		return this.values[idx];
	},
	
	set : function(key, value) {
		var idx = this.keys.indexOf(key);

		if(idx == -1)
		{
			this.keys.push(key);
			this.values.push(value);
		}
		else
		{
			this.values[idx] = value;
		}
	},
	
	remove : function(key) {
		var idx = this.keys.indexOf(key);
		
		if(idx != -1)
		{
			this.keys.removeAt(idx);
			this.values.removeAt(idx);
		}
	},

	clear : function() {
		this.keys = new Array();
		this.values = new Array();
	},
	
	containsKey : function(key) {
		return (this.keys.indexOf(key) != -1);
	},
	
	containsValue : function(value) {
		return (this.values.indexOf(value) != -1);
	},
	
	toString : function() {
		var str = "Dictionary (count=" + this.getCount() + ") :\n";
		var len = this.getCount();
		var key = null;
		var value = null;
		
		for(var i = 0; i < len; i++)
		{
			key = this.keys[i];
			value = this.values[i];
			
			str += "[key=" + key + ", value=" + value + "]\n";
		}
		
		return str;
	}
});
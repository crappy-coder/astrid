MoPair = Class.create({
	initialize : function(first, second) {
		this.first = first;
		this.second = second;
	},
	
	getFirst : function() {
		return this.first;
	},
	
	setFirst : function(value) {
		this.first = value;
	},
	
	getSecond : function() {
		return this.second;
	},
	
	setSecond : function(value) {
		this.second = value;
	},
	
	toString : function() {
		return "Pair[ first: " + this.first + ", second: " + this.second + " ]";
	}
});
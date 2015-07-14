MoTuple = Class.create({
	initialize : function(first, second, third) {
		this.first = first;
		this.second = second;
		this.third = third;
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
	
	getThird : function() {
		return this.third;
	},
	
	setThird : function(value) {
		this.third = value;
	},
	
	toString : function() {
		return "Tuple[ first: " + this.first + ", second: " + this.second + ", third: " + this.third + " ]";
	}
});
MoBorderMetrics = Class.create(MoEquatable, {
	initialize : function (left, top, right, bottom) {
		this.left = MoValueOrDefault(left, 0);
		this.top = MoValueOrDefault(top, 0);
		this.right = MoValueOrDefault(right, 0);
		this.bottom = MoValueOrDefault(bottom, 0);
	},
	
	getLeft : function() {
		return this.left;
	},
	
	setLeft : function(value) {
		this.left = value;
	},
	
	getTop : function() {
		return this.top;
	},
	
	setTop : function(value) {
		this.top = value;
	},
	
	getRight : function() {
		return this.right;
	},
	
	setRight : function(value) {
		this.right = value;
	},
	
	getBottom : function() {
		return this.bottom;
	},
	
	setBottom : function(value) {
		this.bottom = value;
	},
	
	getSizeX : function() {
		return this.left + this.right;
	},
	
	getSizeY : function() {
		return this.top + this.bottom;
	},

	isZero : function() {
		return (this.left == 0 &&
				this.top == 0 &&
				this.right == 0 &&
				this.bottom == 0);
	},

	isEqualTo : function(obj) {
		return (this.left == obj.left && this.top == obj.top && this.right == obj.right && this.bottom == obj.bottom);
	},

	toString : function() {
		return ("left:" + this.left + ", top:" + this.top + ", right:" + this.right + ", bottom:" + this.bottom);
	}
});

Object.extend(MoBorderMetrics, {
	Zero : function() {
		return new MoBorderMetrics(0, 0, 0, 0);
	},

	fromUniform : function(value) {
		return new MoBorderMetrics(value, value, value, value);
	}
});
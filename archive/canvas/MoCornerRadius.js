MoCornerRadius = Class.create(MoEquatable, {
	initialize : function(tl, tr, bl, br) {
		this.topLeft = tl;
		this.topRight = tr;
		this.bottomLeft = bl;
		this.bottomRight = br;
	},
	
	getTopLeft : function() {
		return this.topLeft;
	},
	
	setTopLeft : function(value) {
		this.topLeft = value;
	},
	
	getTopRight : function() {
		return this.topRight;
	},
	
	setTopRight : function(value) {
		this.topRight = value;
	},
	
	getBottomLeft : function() {
		return this.bottomLeft;
	},
	
	setBottomLeft : function(value) {
		this.bottomLeft = value;
	},
	
	getBottomRight : function() {
		return this.bottomRight;
	},
	
	setBottomRight : function(value) {
		this.bottomRight = value;
	},
	
	isUniform : function() {
		return (this.topLeft == this.topRight && 
				this.topLeft == this.bottomLeft && 
				this.topLeft == this.bottomRight);
	},

	isSquare : function() {
		return (this.isUniform() && this.topLeft == 0);
	},

	isEqualTo : function(obj) {
		return (this.topLeft == obj.topLeft &&
				this.topRight == obj.topRight &&
				this.bottomLeft == obj.bottomLeft &&
				this.bottomRight == obj.bottomRight);
	},

	toString : function() {
		return "CornerRadius[ tl=" + this.getTopLeft() + ", tr=" + this.getTopRight() + ", bl=" + this.getBottomLeft() + ", br=" + this.getBottomRight() + " ]";
	}
});


Object.extend(MoCornerRadius, {
	
	fromUniform : function(value) {
		return new MoCornerRadius(value, value, value, value);
	}
	
});
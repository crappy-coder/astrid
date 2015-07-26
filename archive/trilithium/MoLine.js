MoLine = Class.create(MoEquatable, {
	initialize : function(x1, y1, x2, y2) {
		this.x1 = x1;
		this.y1 = y1;
		this.x2 = x2;
		this.y2 = y2;
	},
	
	pointAt : function(t) {
		var vx = this.x2 - this.x1;
		var vy = this.y2 - this.y1;

		return new MoVector2D(this.x1 + vx * t, this.y1 + vy * t);
	},
	
	length : function() {
		var x = this.x2 - this.x1;
		var y = this.y2 - this.y1;

		return Math.sqrt(x * x + y * y);
	},
	
	getPixelsOutside : function(xcoords, ycoords, end) {
		var count = 0;
		var x = 0;
		var y = 0;
		var yNeeded = 0;
		
		for(var i = 0; i < end; ++i)
		{
			x = xcoords[i];
			y = ycoords[i];
			yNeeded = this.getYForX(x);
			
			if(Math.abs(yNeeded - y) >= 2)
				count++;
		}
		
		return count;
	},
	
	getYForX : function(x) {
		var dx = this.x2 - this.x1;
		var dy = this.y2 - this.y1;
		
		return (dy / dx) * (x - this.x1) + this.y1;
	},
	
	isEqualTo : function(other) {
		return (this.x1 == other.x1 &&
				this.y1 == other.y1 &&
				this.x2 == other.x2 &&
				this.y2 == other.y2);
	},

	toString : function() {
		return ("x1:" + this.x1 + ", y1:" + this.y1 + ", x2:" + this.x2 + ", y2:" + this.y2);
	}
});
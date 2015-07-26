MoRectangle = Class.create(MoEquatable, {
	initialize : function (x, y, width, height) {
		this.x = MoValueOrDefault(x, 0);
		this.y = MoValueOrDefault(y, 0);
		this.width = MoValueOrDefault(width, 0);
		this.height = MoValueOrDefault(height, 0);
	},
	
	top : function() {
		return this.y;
	},

	bottom : function() {
		return (this.y + this.height);
	},

	left : function() {
		return this.x;
	},

	right : function() {
		return (this.x + this.width);
	},

	topLeft : function() {
		return new MoVector2D(this.left(), this.top());
	},

	topRight : function() {
		return new MoVector2D(this.right(), this.top());
	},

	bottomLeft : function() {
		return new MoVector2D(this.left(), this.bottom());
	},

	bottomRight : function() {
		return new MoVector2D(this.right(), this.bottom());
	},

	position : function() {
		return new MoVector2D(this.x, this.y);
	},

	size : function() { 
		return new MoSize(this.width, this.height);
	},
	
	center : function(local) {
		if(local)
			return new MoVector2D(this.width * 0.5, this.height * 0.5);

		return new MoVector2D(this.x + (this.width * 0.5), this.y + (this.height * 0.5));
	},
	
	scale : function(scaleX, scaleY) {
		if(!this.isEmpty())
		{
			this.x *= scaleX;
			this.y *= scaleY;
			this.width *= scaleX;
			this.height *= scaleY;
			
			if(scaleX < 0)
			{
				this.x += this.width;
				this.width *= -1;
			}
			
			if(scaleY < 0)
			{
				this.y += this.height;
				this.height *= -1;
			}
		}
	},
	
	inflate : function(byX, byY) {
		if(this.isEmpty())
			return;
		
		this.x -= byX;
		this.y -= byY;
		this.width += byX;
		this.width += byX;
		this.height += byY;
		this.height += byY;
		
		if(this.width < 0 || this.height < 0)
		{
			this.x = MoPositiveInfinity;
			this.y = MoPositiveInfinity;
			this.width = MoNegativeInfinity;
			this.height = MoNegativeInfinity;
		}
	},

	offset : function(x, y) {
		this.x += x;
		this.y += y;
	},
	
	clamp : function(x, y, width, height) {
		this.x = Math.max(this.x, x);
		this.y = Math.max(this.y, y);
		this.width = Math.min(this.width, width);
		this.height = Math.min(this.height, height);
	},
	
	union : function(left, top, right, bottom) {
		if(this.isZero())
		{
			this.initialize(left, top, right - left, bottom - top);
			return;
		}
		
		var minX = Math.min(this.x, left);
		var minY = Math.min(this.y, top);
		var maxX = Math.max(this.right(), right);
		var maxY = Math.max(this.bottom(), bottom);
		
		this.x = minX;
		this.y = minY;
		this.width = maxX - minX;
		this.height = maxY - minY;
	},

	unionWithPoint : function(pt) {
		this.unionWithRect(new MoRectangle(pt.x, pt.y, pt.x, pt.y));
	},

	unionWithRect : function(rect) {
		if(this.isZero())
		{
			this.initialize(rect.x, rect.y, rect.width, rect.height);
			return;
		}

		this.union(rect.left(), rect.top(), rect.right(), rect.bottom());
	},

	contains : function(x, y) {
		if(this.isZero())
			return false;

		return ((x >= this.x) && ((x - this.width) <= this.x) && (y >= this.y) && ((y - this.height) <= this.y));
	},

	containsPoint : function(pt) {
		return this.contains(pt.x, pt.y);
	},

	containsRect : function(rect) {
		if(this.isZero() || rect.isZero())
			return false;

		return ((this.x <= rect.x) && (this.y <= rect.y) && (this.right() >= rect.right()) && (this.bottom() >= rect.bottom()));
	},
	
	intersects : function(rect) {
		if(this.isEmpty() || this.isZero() || rect.isZero())
			return false;
		
		return (rect.right() > this.x &&
				rect.bottom() > this.y &&
				rect.x < this.right() &&
				rect.y < this.bottom());
	},
	
	round : function() {
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);
		this.width = Math.ceil(this.width);
		this.height = Math.ceil(this.height);
	},

	isZero : function() {
		return (this.x == 0 && this.y == 0 && this.width == 0 && this.height == 0);
	},
	
	isEmpty : function() {
		return (this.width < 0.0);
	},

	isEqualTo : function(obj) {
		return (this.x == obj.x && this.y == obj.y && this.width == obj.width && this.height == obj.height);
	},

	toString : function() {
		if(this.isEmpty())
			return "empty";

		return (this.x + "," + this.y + "," + this.width + "," + this.height);
	}
});

Object.extend(MoRectangle, {
	Empty : function() {
		return new MoRectangle(MoPositiveInfinity, MoPositiveInfinity, MoNegativeInfinity, MoNegativeInfinity);
	},

	Zero : function() {
		return new MoRectangle(0, 0, 0, 0);
	},

	fromPoints : function(p1, p2) {
		var x = Math.min(p1.x, p2.x);
		var y = Math.min(p1.y, p2.y);
		var width = Math.max(Math.max(p1.x, p2.x) - x, 0);
		var height = Math.max(Math.max(p1.y, p2.y) - y, 0);

		return new MoRectangle(x, y, width, height);
	},
	
	parse : function(str) {
		if(str == "empty")
			return MoRectangle.Empty();
	
		var tokenizer = new MoStringTokenizer(str);
		var x = parseFloat(tokenizer.next());
		var y = parseFloat(tokenizer.next());
		var width = parseFloat(tokenizer.next());
		var height = parseFloat(tokenizer.next());

		return new MoRectangle(x, y, width, height);
	}
});

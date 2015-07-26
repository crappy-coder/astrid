MoVector2D = Class.create(MoEquatable, {
	initialize : function(x, y) {
		this.x = MoValueOrDefault(x, 0);
		this.y = MoValueOrDefault(y, 0);
	},

	add : function(vector) {
		return new MoVector2D(
			this.x + vector.x, 
			this.y + vector.y);
	},

	subtract : function(vector) {
		return new MoVector2D(
			this.x - vector.x,
			this.y - vector.y);
	},

	multiply : function(vector) {
		return new MoVector2D(
			this.x * vector.x,
			this.y * vector.y);
	},

	divide : function(vector) {
		return new MoVector2D(
			this.x / vector.x,
			this.y / vector.y);
	},
	
	interpolate : function(vector, level) {
		return new MoVector2D(
			this.x + vector.x * level,
			this.y + vector.y * level);
	},

	negate : function()
	{
		return new MoVector2D(-this.x, -this.y);
	},

	length : function() {
		return Math.sqrt(this.lengthSquared());
	},

	lengthSquared : function() {
		return (this.x * this.x + this.y * this.y);
	},

	distance : function(vector) {
		return this.subtract(vector).length();
	},

	distanceSquared : function(vector) {
		return this.subtract(vector).lengthSquared();
	},

	dotProduct : function(vector) {
		return (this.x * vector.x + this.y * vector.y);
	},

	crossProduct : function(vector) {
		return (this.x * vector.y - this.y * vector.x);
	},

	normalize : function(thickness) {
		thickness = MoValueOrDefault(thickness, 1);
	
		var len = this.length();
		
		if(len == 0)
		{
			this.x = this.y = 0;
		}
		else
		{
			len = thickness / len;

			this.x = this.x * len;
			this.y = this.y * len;
		}
	},
	
	normalizeZero : function() {
		this.x = MoMath.normalizeZero(this.x);
		this.y = MoMath.normalizeZero(this.y);

		return this;
	},
	
	angle : function(point) {
		var delta = point.subtract(this);

		return MoMath.radiansToDegrees(Math.atan2(delta.y, delta.x));
	},
	
	pointTo : function(distance, angle) {
		var rads = MoMath.degreesToRadians(angle);

		return new MoVector2D(
			this.x + distance * Math.cos(rads),
			this.y + distance * Math.sin(rads)
		);
	},

	midPoint : function(vector) {
		return new MoVector2D(
			(this.x + vector.x) * 0.5,
			(this.y + vector.y) * 0.5);
	},
	
	rotate : function(angle) {
		var r = MoMath.degreesToRadians(angle);
		var x =  this.x * Math.cos(-r) + this.y * Math.sin(-r);
		var y = -this.x * Math.sin(-r) + this.y * Math.cos(-r);

		return new MoVector2D(x, y);
	},

	isLessThan : function(vector) {
		return (this.x < vector.x && this.y < vector.y);
	},

	isGreaterThan : function(vector) {
		return (this.x > vector.x && this.y > vector.y);
	},

	isEqualTo : function(obj) {
		return (this.x == obj.x && this.y == obj.y);
	},

	isZero : function() {
		return (this.x == 0 && this.y == 0);
	},

	toString : function() {
		return ("x:" + this.x + ", y:" + this.y);
	}
});

Object.extend(MoVector2D, {

	NotSet : function() { 
		return new MoVector2D(Infinity, Infinity);
	},

	Zero : function() { 
		return new MoVector2D(0, 0);
	},

	UnitX : function() { 
		return new MoVector2D(1, 0);
	},

	UnitY : function() { 
		return new MoVector2D(0, 1);
	},

	NegativeUnitX : function() { 
		return new MoVector2D(-1, 0);
	},

	NegativeUnitY : function() { 
		return new MoVector2D(0, -1);
	},

	UnitScale : function() { 
		return new MoVector2D(1, 1);
	}
});

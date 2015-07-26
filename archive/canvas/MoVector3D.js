MoVector3D = Class.create(MoEquatable, {
	initialize : function(x, y, z) {
		this.x = MoValueOrDefault(x, 0);
		this.y = MoValueOrDefault(y, 0);
		this.z = MoValueOrDefault(z, 0);
	},

	add : function(vector) {
		return MoVector3D.add(this, vector);
	},

	subtract : function(vector) {
		return MoVector3D.subtract(this, vector);
	},

	multiply : function(vector) {
		return MoVector3D.multiply(this, vector);
	},

	divide : function(vector) {
		return MoVector3D.divide(this, vector);
	},

	negate : function()
	{
		return MoVector3D.negate(this);
	},

	length : function() {
		return Math.sqrt(this.lengthSquared());
	},

	lengthSquared : function() {
		return (this.x * this.x + this.y * this.y + this.z * this.z);
	},

	distance : function(vector) {
		return this.subtract(vector).length();
	},

	distanceSquared : function(vector) {
		return this.subtract(vector).lengthSquared();
	},

	dot : function(vector) {
		return MoVector3D.dot(this, vector);
	},

	cross : function(vector) {
		return MoVector3D.cross(this, vector);
	},

	normalize : function() {
		return MoVector3D.normalize(this);
	},
	
	normalizeZero : function() {
		this.x = MoMath.normalizeZero(this.x);
		this.y = MoMath.normalizeZero(this.y);
		this.z = MoMath.normalizeZero(this.z);
		
		return this;
	},

	isEqualTo : function(obj) {
		return (this.x == obj.x && this.y == obj.y && this.z == obj.z);
	},

	toString : function() {
		return "Vector3D[ x:" + this.x + ", y:" + this.y + ", z:" + this.z + " ]";
	}
});

Object.extend(MoVector3D, {

	add : function(v1, v2) {
		return new MoVector3D(
			v1.x + v2.x,
			v1.y + v2.y,
			v1.z + v2.z);
	},
	
	subtract : function(v1, v2) {
		return new MoVector3D(
			v1.x - v2.x,
			v1.y - v2.y,
			v1.z - v2.z);
	},
	
	multiply : function(v1, v2) {
		return new MoVector3D(
			v1.x * v2.x,
			v1.y * v2.y,
			v1.z * v2.z);
	},

	divide : function(v1, v2) {
		return new MoVector3D(
			v1.x / v2.x,
			v1.y / v2.y,
			v1.z / v2.z);
	},
	
	cross : function(v1, v2) {
		return new MoVector3D(
			(v1.y * v2.z) - (v1.z * v2.y),
			(v1.z * v2.x) - (v1.x * v2.z),
			(v1.x * v2.y) - (v1.y * v2.x));
	},
	
	dot : function(v1, v2) {
		return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
	},

	negate : function(v) {
		return new MoVector3D(-v.x, -v.y, -v.z);
	},
	
	normalize : function(v) {
		var len = 1 / v.length();
		
		return new MoVector3D(
			v.x * len,
			v.y * len,
			v.z * len);
	},
	
	lerp : function(v1, v2, value) {
		return new MoVector3D(
			v1.x + ((v2.x - v1.x) * value),
			v1.y + ((v2.y - v1.y) * value),
			v1.z + ((v2.z - v1.z) * value));
	},
	
	reflect : function(v, n) {
		var len = v.lengthSquared();
		
		return new MoVector3D(
			v.x - ((len * 2) * n.x),
			v.y - ((len * 2) * n.y),
			v.z - ((len * 2) * n.z));
	},

	min : function(v1, v2) {
		return new MoVector3D(
			Math.min(v1.x, v2.x),
			Math.min(v1.y, v2.y),
			Math.min(v1.z, v2.z));
	},
	
	max : function(v1, v2) {
		return new MoVector3D(
			Math.max(v1.x, v2.x),
			Math.max(v1.y, v2.y),
			Math.max(v1.z, v2.z));	
	},

	NotSet : function() { 
		return new MoVector3D(Infinity, Infinity, Infinity);
	},

	Zero : function() { 
		return new MoVector3D(0, 0, 0);
	},
	
	One : function() { 
		return new MoVector3D(1, 1, 1);
	},

	UnitX : function() { 
		return new MoVector3D(1, 0, 0);
	},

	UnitY : function() { 
		return new MoVector3D(0, 1, 0);
	},

	UnitZ : function() { 
		return new MoVector3D(0, 0, 1);
	},
	
	NegativeUnitX : function() { 
		return new MoVector3D(-1, 0, 0);
	},

	NegativeUnitY : function() { 
		return new MoVector3D(0, -1, 0);
	},
	
	NegativeUnitZ : function() { 
		return new MoVector3D(0, 0, -1);
	},

	Up : function() { 
		return new MoVector3D(0, 1, 0);
	},
	
	Down : function() { 
		return new MoVector3D(0, -1, 0);
	},
	
	Left : function() { 
		return new MoVector3D(-1, 0, 0);
	},
	
	Right : function() { 
		return new MoVector3D(1, 0, 0);
	},
	
	Forward : function() { 
		return new MoVector3D(0, 0, -1);
	},
	
	Backward : function() { 
		return new MoVector3D(0, 0, 1);
	}
});

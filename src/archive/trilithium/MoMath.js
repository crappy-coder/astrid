MoMath = {};

Object.extend(MoMath, {

	isNaN : function(num) {
		return isNaN(num);
	},

	isInfinity : function(num) {
		return (MoMath.isPositiveInfinity(num) || 
				MoMath.isNegativeInfinity(num));
	},

	isPositiveInfinity : function(num) {
		return (num == MoPositiveInfinity);
	},

	isNegativeInfinity : function(num) {
		return (num == MoNegativeInfinity);
	},

	isZero : function(num) {
		return (Math.abs(num) <= MoEpsilon);
	},
	
	signum : function(num) {		
		if(num > 0)
			return 1.0;
		
		if(num < 0)
			return -1.0;
			
		return 0.0;
	},
	
	signEpsilon : function(num) {
		if(num > MoEpsilon)
			return 1.0;
		
		if(num < -MoEpsilon)
			return -1.0;
			
		return 0.0;
	},
	
	clamp : function(value, min, max) {
		return Math.max(Math.min(value, max), min);
	},
	
	normalize : function(value, start, end) {
		if(start == end)
			throw new Error("start must not be equal to end");
			
		var delta = end - start;
		var offset = value - start;
		
		return (offset - (Math.floor(offset / delta) * delta) + start);
	},
	
	normalizeAngle : function(angle) {
		return (angle % 360);
	},
	
	normalizeZero : function(num) {
		if(num <= 0 || MoMath.isZero(num))
			return 0;

		return num;
	},
	
	pointOfAngle : function(radians) {
		return new MoVector2D(
			Math.cos(radians),
			Math.sin(radians));
	},

	hypot : function(x, y) {
		return Math.sqrt(x * x + y * y) || 0;
	},
	
	degreesToRadians : function(degrees) {
		return ((degrees * Math.PI) / 180);
	},
	
	radiansToDegrees : function(radians) {
		return ((radians * 180) / Math.PI);
	},
	
	randomTo : function(max) {
		return (Math.random() * max);
	},
	
	randomIntTo : function(max) {
		return Math.round(MoMath.randomTo(max));
	},

	randomInRange : function(min, max) {
		return (Math.random() * (max - min)) + min;
	},

	randomIntInRange : function(min, max) {
		return Math.round(MoMath.randomInRange(min, max));
	},

	round : function(value) {
		// a fast rounding technique via bitwise truncation
		// TODO : fix negative values, for the most part they work fine, however if
		//		  the value is directly on the .5 boundary it rounds in the wrong direction,
		//		  should be a simple fix, but i need sleep, revisit this later. -JT
		
		return ((value + (value >= 0 ? 0.5 : -0.5)) | 0);
	},

	evenRoundDown : function(value) {
		return (value & ~1);
	},
	
	evenRoundUp : function(value) {
		return ((value + 1) & ~1);
	},
	
	toInt : function(value) {
		return this.toPrecision(value, 0);
	},

	toPrecision : function(value, n) {
		return Number(value.toFixed(n));
	}
});
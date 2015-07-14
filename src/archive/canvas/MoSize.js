MoSize = Class.create(MoEquatable, {
	initialize : function (width, height) {
		this.width = MoValueOrDefault(width, 0);
		this.height = MoValueOrDefault(height, 0);

		if(this.width < 0 || this.height < 0)
			throw new Error("width and height must be a non-negative value.");
	},

	isEmpty : function() {
		return (this.width < 0);
	},

	isEqualTo : function(obj) {
		return (this.width == obj.width && this.height == obj.height);
	},

	toString : function() {
		return ("width:" + this.width + ", height:" + this.height);
	}
});

Object.extend(MoSize, {
	Empty : function() {
		var s = MoSize.Zero();
		s.width = MoNegativeInfinity;
		s.height = MoNegativeInfinity;

		return s;
	},

	Zero : function() {
		return new MoSize(0, 0);
	}
});
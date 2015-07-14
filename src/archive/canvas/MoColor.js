MoColor = Class.create(MoEquatable, {
	initialize : function($super, r, g, b, a) {
		this.r = MoValueOrDefault(r, 1.0);
		this.g = MoValueOrDefault(g, 1.0);
		this.b = MoValueOrDefault(b, 1.0);
		this.a = MoValueOrDefault(a, 1.0);
	},

	add : function(color) {
		return new MoColor(
			Math.min(this.r + color.r, 1.0),
			Math.min(this.g + color.g, 1.0),
			Math.min(this.b + color.b, 1.0),
			Math.min(this.a + color.a, 1.0));
	},

	subtract : function(color) {
		return new MoColor(
			Math.max(this.r - color.r, 0.0),
			Math.max(this.g - color.g, 0.0),
			Math.max(this.b - color.b, 0.0),
			Math.max(this.a - color.a, 0.0));
	},
	
	toRGB : function() {
		return (((this.r * 255) << 16) | ((this.g * 255) << 8) | (this.b * 255));
	},

	toRGBString : function() {
		return "rgb(" + parseInt(this.r * 255) + "," + parseInt(this.g * 255) + "," + parseInt(this.b * 255) + ")";
	},

	toRGBAString : function() {
		return "rgba(" + parseInt(this.r * 255) + "," + parseInt(this.g * 255) + "," + parseInt(this.b * 255) + "," + Math.max(Math.min(this.a.toFixed(2), 1.0), 0.0) + ")";
	},

	toHex : function() {
		return "#" + this.toRGB().toString(16);
	},

	isEqualTo : function(color) {
		return (color.r == this.r && color.g == this.g && color.b == this.b && color.a == this.a);
	},

	toString : function() {
		return this.toRGBString();	
	}
});

Object.extend(MoColor, {
	Black : new MoColor(0, 0, 0, 1),
	White : new MoColor(1, 1, 1, 1),
	Red : new MoColor(1, 0, 0, 1),
	Green : new MoColor(0, 1, 0, 1),
	Blue : new MoColor(0, 0, 1, 1),
	Yellow : new MoColor(1, 1, 0, 1),
	Magenta : new MoColor(1, 0, 1, 1),
	Turquoise : new MoColor(0, 1, 1, 1),
	Transparent : new MoColor(0, 0, 0, 0),
	
	fromColor : function(color) {
		return new MoColor(color.r, color.g, color.b, color.a);
	},
	
	fromRGB : function(value) {
		return new MoColor(
			((value >> 16) & 0xff) / 255, 
			((value >> 8) & 0xff) / 255, 
			((value & 0xff)) / 255, 1);
	},

	fromCSSColor : function(value) {
		if(MoStringIsNullOrEmpty(value))
			return MoColor.Transparent;

		if(value[0] == "#")
			return MoColor.fromHex(value);

		// parse as rgb(0,0,0) or rgba(0,0,0,0)
		var colorString = value.toLowerCase();

		if(colorString[0] == "r" && colorString[1] == "g" && colorString[2] == "b")
		{
			var components = value.substring(value.indexOf("(")+1, value.length-1).split(",");

			for(var i = 0; i < components.length; ++i)
				components[i] = components[i].replace(" ", "");

			var r = components[0];
			var g = components[1];
			var b = components[2];
			var a = components.length > 3 ? components[3] : "1";
			
			return new MoColor(
				parseInt(r) / 255,
				parseInt(g) / 255,
				parseInt(b) / 255,
				parseFloat(a));
		}

		return MoColor.Transparent;
	},
	
	fromHSV : function(h, s, v, a) {
		s = Math.max(0.0, Math.min(1.0, s));
		v = Math.max(0.0, Math.min(1.0, v));

		if(s > 0)
		{
			h = ((h < 0) ? h % 360 + 360 : h % 360) / 60;
			
			if(h < 1)
			{
				return new MoColor(
					(v), 
					(v * (1 - s * (1 - h))), 
					(v * (1 - s)), a);
			}
			else if(h < 2)
			{
				return new MoColor(
					(v * ( 1 - s * (h - 1) )),
					(v),
					(v * ( 1 - s )), a);			
			}
			else if(h < 3)
			{
				return new MoColor(
					(v * ( 1 - s )),
					(v),
					(v * ( 1 - s * (3 - h) )), a);			
			}
			else if(h < 4)
			{
				return new MoColor(
					(v * ( 1 - s )),
					(v * ( 1 - s * (h - 3) )),
					(v), a);			
			}
			else if(h < 5)
			{
				return new MoColor(
					(v * ( 1 - s * (5 - h) )),
					(v * ( 1 - s )),
					(v), a);			
			}
			else
			{
				return new MoColor(
					(v),
					(v * ( 1 - s )),
					(v * ( 1 - s * (h - 5) ), a));			
			}
		}

		return new MoColor(v, v, v, a);
	},

	fromHex : function(value) {
	
		if(value.length == 9) // # + 8 color components (includes an alpha)
		{
			return new MoColor(
				parseInt('0x' + value.substring(1, 3)) / 255,
				parseInt('0x' + value.substring(3, 5)) / 255,
				parseInt('0x' + value.substring(5, 7)) / 255, 
				parseInt('0x' + value.substring(7, 9)) / 255);
		}
		else // # + 6 color components
		{
			return new MoColor(
				parseInt('0x' + value.substring(1, 3)) / 255,
				parseInt('0x' + value.substring(3, 5)) / 255,
				parseInt('0x' + value.substring(5, 7)) / 255, 1);
		}
	},

	fromHexWithAlpha : function(value, alpha) {
		var color = MoColor.fromHex(value);
		color.a = alpha;

		return color;
	},
	
	multiply255 : function(a, b) {
		var v = a * b + 128;
		return ((v >> 8) + v) >> 8;
	},
	
	
	// helper functions to initialize a color variable with a default color that
	// is expected to be changed, this way the color 'constant' doesn't also change
	// since assigning the 'constant' to a variable is by reference
	black : function() {
		return MoColor.fromColor(MoColor.Black);
	},
	
	white : function() {
		return MoColor.fromColor(MoColor.White);
	},
	
	red : function() {
		return MoColor.fromColor(MoColor.Red);
	},
	
	green : function() {
		return MoColor.fromColor(MoColor.Green);
	},
	
	blue : function() {
		return MoColor.fromColor(MoColor.Blue);
	},
	
	yellow : function() {
		return MoColor.fromColor(MoColor.Yellow);
	},
	
	magenta : function() {
		return MoColor.fromColor(MoColor.Magenta);
	},
	
	turquoise : function() {
		return MoColor.fromColor(MoColor.Turquoise);
	},
	
	transparent : function() {
		return MoColor.fromColor(MoColor.Transparent);
	}
});

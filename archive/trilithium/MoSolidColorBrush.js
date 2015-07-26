MoSolidColorBrush = Class.create(MoBrush, {
	initialize : function($super, color) {
		$super();

		this.setColor(color);
	},

	initializeAnimatablePropertiesCore : function($super) {
		$super();

		this.enableAnimatableProperty("color", this.getColor, this.setColor, MoPropertyOptions.AffectsLayout);
	},

	getColor : function() {
		return this.getPropertyValue("color");
	},

	setColor : function(value) {
		this.setPropertyValue("color", value);
	},

	isEqualTo : function($super, other) {
		if($super(other))
			return MoAreEqual(this.getColor(), other.getColor());

		return false;
	}
});

Object.extend(MoSolidColorBrush, {
	
	fromColor : function(color) {
		return new MoSolidColorBrush(color);
	},

	fromColorHex : function(hexColor) {
		return MoSolidColorBrush.fromColor(MoColor.fromHex(hexColor));
	},

	fromColorHexWithAlpha : function(hexColor, alpha) {
		return MoSolidColorBrush.fromColor(MoColor.fromHexWithAlpha(hexColor, alpha));
	},
	
	fromColorRGB : function(r, g, b) {
		return MoSolidColorBrush.fromColor(new MoColor(r, g, b));
	},
	
	fromColorRGBA : function(r, g, b, a) {
		return MoSolidColorBrush.fromColor(new MoColor(r, g, b, a));
	},
	
	black : function() {
		return MoSolidColorBrush.fromColor(MoColor.black());
	},
	
	white : function() {
		return MoSolidColorBrush.fromColor(MoColor.white());
	},
	
	red : function() {
		return MoSolidColorBrush.fromColor(MoColor.red());
	},
	
	green : function() {
		return MoSolidColorBrush.fromColor(MoColor.green());
	},
	
	blue : function() {
		return MoSolidColorBrush.fromColor(MoColor.blue());
	},
	
	yellow : function() {
		return MoSolidColorBrush.fromColor(MoColor.yellow());
	},
	
	magenta : function() {
		return MoSolidColorBrush.fromColor(MoColor.magenta());
	},
	
	turquoise : function() {
		return MoSolidColorBrush.fromColor(MoColor.turquoise());
	},
	
	transparent : function() {
		return MoSolidColorBrush.fromColor(MoColor.transparent());
	}
});
MoFont = Class.create(MoEquatable, {
	initialize : function() {

		/** String **/
		this.fontName = "sans-serif";
		
		/** Number **/
		this.fontSize = 10;
		
		/** MoFontStretch **/
		this.fontStretch = MoFontStretch.Normal;
		
		/** MoFontStyle **/
		this.fontStyle = MoFontStyle.Normal;

		/** MoFontWeight **/
		this.fontWeight = MoFontWeight.Normal;
	},
	
	getFontName : function() {
		return this.fontName;
	},
	
	setFontName : function(value) {
		this.fontName = value;
	},
	
	getFontSize : function() {
		return this.fontSize;
	},

	setFontSize : function(value) {
		this.fontSize = value;
	},
	
	getFontStretch : function() {
		return this.fontStretch;
	},
	
	setFontStretch : function(value) {
		this.fontStretch = value;
	},
	
	getFontStyle : function() {
		return this.fontStyle;
	},
	
	setFontStyle : function(value) {
		this.fontStyle = value;
	},
	
	getFontWeight : function() {
		return this.fontWeight;
	},
	
	setFontWeight : function(value) {
		this.fontWeight = value;
	},
	
	getStretchCSSValue : function() {
		switch(this.fontStretch)
		{
			case MoFontStretch.SemiCondensed:
				return "semi-condensed";
			case MoFontStretch.Condensed:
				return "condensed";
			case MoFontStretch.ExtraCondensed:
				return "extra-condensed";
			case MoFontStretch.UltraCondensed:
				return "ultra-condensed";
			case MoFontStretch.SemiExpanded:
				return "semi-expanded";
			case MoFontStretch.Expanded:
				return "expanded";
			case MoFontStretch.ExtraExpanded:
				return "extra-expanded";
			case MoFontStretch.UltraExpanded:
				return "ultra-expanded";
		}
		
		return "normal";
	},
	
	getStyleCSSValue : function() {
		switch(this.fontStyle)
		{
			case MoFontStyle.Oblique:
				return "oblique";
			case MoFontStyle.Italic:
				return "italic";
		}
		
		return "normal";
	},
	
	getStringWidth : function(canvas, str) {
		var textBlock = engine.createTextBlock(str, this.toTextFormat([1,1,1,1]), 100000);
		var textBounds = textBlock.getTextBoundsFor(0);

		return textBounds.bounds.width;
	},
	
	measureString : function(str, maxWidth) {
		maxWidth = MoValueOrDefault(maxWidth, MoMaxShort);

		var textBlock = engine.createTextBlock(str, this.toTextFormat([1,1,1,1]), maxWidth);
		var textBounds = textBlock.getTextBoundsFor(0);

		return new MoSize(textBounds.bounds.width, textBounds.bounds.height);
	},
	
	toString : function() {
		var sizeString = this.fontSize.toString() + "px";
		var weightString = this.fontWeight.toString();
		var styleString = this.getStyleCSSValue();

		return styleString + " normal " + weightString + " " + sizeString + " " + this.fontName
	},
	
	toCSSFontRule : function(srcOrDataUri) {
		var rule = "@font-face { font-family: '" + this.fontName + "'; ";
		
		if(this.fontStyle != MoFontStyle.Normal)
			rule += "font-style: " + this.getStyleCSSValue() + "; ";
			
		if(this.fontWeight != MoFontWeight.Normal)
			rule += "font-weight: " + this.fontWeight.toString() + "; ";
		
		if(this.fontStretch != MoFontStretch.Normal)
			rule += "font-stretch: " + this.getStretchCSSValue() + "; ";

		rule += "src: url('" + srcOrDataUri + "'); }";

		return rule;
	},

	toTextFormat : function(color) {
		return {
			alignment: "left",
			color: color,
			font: this.fontName,
			size: this.fontSize
		};
	}
});

Object.extend(MoFont, {
	create : function(name, style, weight, stretch, size) {
		var f = new MoFont();
		
		f.setFontName(name);
		f.setFontStyle(MoValueOrDefault(style, MoFontStyle.Normal));
		f.setFontWeight(MoValueOrDefault(weight, MoFontWeight.Normal));
		f.setFontStretch(MoValueOrDefault(stretch, MoFontStretch.Normal));
		f.setFontSize(MoValueOrDefault(size, 10));

		return f;
	}
});

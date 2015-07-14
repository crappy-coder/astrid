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
		var ctx = canvas.getContext("2d");
		var prevFont = ctx.font;
		var width = 0;
		
		ctx.font = this.toString();
		width = ctx.measureText(str).width;
		ctx.font = prevFont;

		return width;
	},
	
	measureString : function(str, maxWidth) {		
		var canvas = document.createElement("canvas");
		var ctx = canvas.getContext("2d");
		var metrics = null;
		var actualWidth = 0;
		
		canvas.font = this.toString();
		metrics = ctx.measureText(str);
		actualWidth = metrics.width;
		
		if(!MoIsNull(maxWidth) && maxWidth < actualWidth)
			actualWidth = maxWidth;

		// make sure these references are removed
		// just in case
		ctx = null;
		canvas = null;

		////////////////////////////////////////////////////////
		//                             can only approximate here
		return new MoSize(actualWidth, this.fontSize * 1.2);
		
		// var elLastChild = document.lastChild;
		
		// // create a temp span element, assign the text and font css style
		// var elSpan = document.createElement("span");
		// elSpan.textContent = str;
		// elSpan.style.font = this.toString();

		// if(maxWidth != null)
		// {
			// elSpan.style.display = "inline-block";
			// elSpan.style.width = maxWidth + "px";
		// }

		// // add the span to the end of the document, just so we
		// // can get the measurements
		// elLastChild.appendChild(elSpan);
		
		// // now get the measurements
		// var bounds = elSpan.getBoundingClientRect();
		
		// // finally, remove the span, this should be good enough to
		// // avoid any flicker or wierdness with the current page
		// elLastChild.removeChild(elSpan);
		
		// return new MoSize(bounds.width, bounds.height);
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

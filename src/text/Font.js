import Equatable from "./../Equatable";
import FontStretch from "./FontStretch";
import FontStyle from "./FontStyle";
import FontWeight from "./FontWeight";
import { ValueOrDefault } from "./../Engine";
import Size from "./../Size";

class Font extends Equatable {
	constructor() {
		super();

		/** String **/
		this.fontName = "sans-serif";

		/** Number **/
		this.fontSize = 10;

		/** FontStretch **/
		this.fontStretch = FontStretch.Normal;

		/** FontStyle **/
		this.fontStyle = FontStyle.Normal;

		/** FontWeight **/
		this.fontWeight = FontWeight.Normal;
	}

	getFontName() {
		return this.fontName;
	}

	setFontName(value) {
		this.fontName = value;
	}

	getFontSize() {
		return this.fontSize;
	}

	setFontSize(value) {
		this.fontSize = value;
	}

	getFontStretch() {
		return this.fontStretch;
	}

	setFontStretch(value) {
		this.fontStretch = value;
	}

	getFontStyle() {
		return this.fontStyle;
	}

	setFontStyle(value) {
		this.fontStyle = value;
	}

	getFontWeight() {
		return this.fontWeight;
	}

	setFontWeight(value) {
		this.fontWeight = value;
	}

	getStretchCSSValue() {
		switch (this.fontStretch) {
		case FontStretch.SemiCondensed:
			return "semi-condensed";
		case FontStretch.Condensed:
			return "condensed";
		case FontStretch.ExtraCondensed:
			return "extra-condensed";
		case FontStretch.UltraCondensed:
			return "ultra-condensed";
		case FontStretch.SemiExpanded:
			return "semi-expanded";
		case FontStretch.Expanded:
			return "expanded";
		case FontStretch.ExtraExpanded:
			return "extra-expanded";
		case FontStretch.UltraExpanded:
			return "ultra-expanded";
		}

		return "normal";
	}

	getStyleCSSValue() {
		switch (this.fontStyle) {
		case FontStyle.Oblique:
			return "oblique";
		case FontStyle.Italic:
			return "italic";
		}

		return "normal";
	}

	getStringWidth(canvas, str) {
		var ctx = canvas.getContext("2d");
		var prevFont = ctx.font;
		var width = 0;

		ctx.font = this.toString();
		width = ctx.measureText(str).width;
		ctx.font = prevFont;

		return width;
	}

	measureString(str, maxWidth) {
		var canvas = document.createElement("canvas");
		var ctx = canvas.getContext("2d");
		var metrics = null;
		var actualWidth = 0;

		canvas.font = this.toString();
		metrics = ctx.measureText(str);
		actualWidth = metrics.width;

		if (maxWidth != null && maxWidth < actualWidth) {
			actualWidth = maxWidth;
		}

		// make sure these references are removed
		// just in case
		ctx = null;
		canvas = null;

		////////////////////////////////////////////////////////
		//                             can only approximate here
		return new Size(actualWidth, this.fontSize * 1.2);

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

		// return new Size(bounds.width, bounds.height);
	}

	toString() {
		var sizeString = this.fontSize.toString() + "px";
		var weightString = this.fontWeight.toString();
		var styleString = this.getStyleCSSValue();

		return styleString + " normal " + weightString + " " + sizeString + " " + this.fontName
	}

	toCSSFontRule(srcOrDataUri) {
		var rule = "@font-face { font-family: '" + this.fontName + "'; ";

		if (this.fontStyle != FontStyle.Normal) {
			rule += "font-style: " + this.getStyleCSSValue() + "; ";
		}

		if (this.fontWeight != FontWeight.Normal) {
			rule += "font-weight: " + this.fontWeight.toString() + "; ";
		}

		if (this.fontStretch != FontStretch.Normal) {
			rule += "font-stretch: " + this.getStretchCSSValue() + "; ";
		}

		rule += "src: url('" + srcOrDataUri + "'); }";

		return rule;
	}

	static create(name, style, weight, stretch, size) {
		var f = new Font();

		f.setFontName(name);
		f.setFontStyle(ValueOrDefault(style, FontStyle.Normal));
		f.setFontWeight(ValueOrDefault(weight, FontWeight.Normal));
		f.setFontStretch(ValueOrDefault(stretch, FontStretch.Normal));
		f.setFontSize(ValueOrDefault(size, 10));

		return f;
	}
}

export default Font;

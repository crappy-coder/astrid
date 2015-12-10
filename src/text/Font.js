import Equatable from "../Equatable";
import FontStretch from "./FontStretch";
import FontStyle from "./FontStyle";
import FontWeight from "./FontWeight";
import Size from "../Size";

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
		maxWidth = astrid.valueOrDefault(maxWidth, 10000);

		if(!Font.MeasureTextElement)
		{
			Font.MeasureTextElement = document.createElement("span");
			Font.MeasureTextElement.style.position = "absolute";
			Font.MeasureTextElement.style.left = "-2000px";
			Font.MeasureTextElement.style.top = "-2000px";

			document.body.appendChild(Font.MeasureTextElement);
		}

		var textNode = document.createTextNode(str);
		var size = new Size(0, 0);

		Font.MeasureTextElement.style.font = this.toString();
		Font.MeasureTextElement.appendChild(textNode);

		size.width = Math.max(0, Math.min(Font.MeasureTextElement.offsetWidth, maxWidth));
		size.height = Math.max(0, Font.MeasureTextElement.offsetHeight);

		Font.MeasureTextElement.removeChild(textNode);

		return size;
	}

	isEqualTo(other) {
		return (this.fontName === other.fontName &&
				this.fontSize === other.fontSize &&
				this.fontStretch === other.fontStretch &&
				this.fontStyle === other.fontStyle &&
				this.fontWeight === other.fontWeight);
	}

	toString() {
		var sizeString = this.fontSize.toString() + "px";
		var weightString = this.fontWeight.toString();
		var styleString = this.getStyleCSSValue();

		return styleString + " normal " + weightString + " " + sizeString + " '" + this.fontName + "'";
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

	static fromFont(font) {
		var f = new Font();

		f.setFontName(font.fontName);
		f.setFontStyle(font.fontStyle);
		f.setFontWeight(font.fontWeight);
		f.setFontStretch(font.fontStretch);
		f.setFontSize(font.fontSize);

		return f;
	}

	static create(name, style, weight, stretch, size) {
		var f = new Font();

		f.setFontName(name);
		f.setFontStyle(astrid.valueOrDefault(style, FontStyle.Normal));
		f.setFontWeight(astrid.valueOrDefault(weight, FontWeight.Normal));
		f.setFontStretch(astrid.valueOrDefault(stretch, FontStretch.Normal));
		f.setFontSize(astrid.valueOrDefault(size, 10));

		return f;
	}
}

Font.MeasureTextElement = null;

export default Font;

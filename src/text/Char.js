import UnicodeCategoryData from "./UnicodeCategoryData";
import UnicodeCategory from "./UnicodeCategory";

var Char = {
	getUnicodeCategory: function (ch) {
		return UnicodeCategoryData.CategoryData[ch.charCodeAt(0)];
	},

	getNumericValue: function (ch) {
		if (ch > 0x3289) {
			if (ch >= 0xff10 && ch <= 0xff19) {
				return (ch - 0xff10);
			}

			return -1;
		}

		return UnicodeCategoryData.NumericDataValues[
			UnicodeCategoryData.NumericData[ch.charCodeAt(0)]];
	},

	isLetter: function (ch) {
		return (this.getUnicodeCategory(ch) <= UnicodeCategory.OtherLetter);
	},

	isLetterOrDigit: function (ch) {
		return (this.isLetter(ch) || this.isDigit(ch));
	},

	isDigit: function (ch) {
		return (this.getUnicodeCategory(ch) == UnicodeCategory.DecimalDigitNumber);
	},

	isNumber: function (ch) {
		var category = this.getUnicodeCategory(ch);

		return (category >= UnicodeCategory.DecimalDigitNumber &&
		category <= UnicodeCategory.OtherNumber);
	},

	isControl: function (ch) {
		return (this.getUnicodeCategory(ch) == UnicodeCategory.Control);
	},

	isWhiteSpace: function (ch) {
		var category = this.getUnicodeCategory(ch);

		if (category <= UnicodeCategory.OtherNumber) {
			return false;
		}

		if (category <= UnicodeCategory.ParagraphSeparator) {
			return true;
		}

		return (ch >= 0x09 && ch <= 0x0d || ch == 0x85 || ch == 0x205f);
	},

	isPunctuation: function (ch) {
		var category = this.getUnicodeCategory(ch);

		return (category >= UnicodeCategory.ConnectorPunctuation &&
		category <= UnicodeCategory.OtherPunctuation);
	},

	isSymbol: function (ch) {
		var category = this.getUnicodeCategory(ch);

		return (category >= UnicodeCategory.MathSymbol &&
		category <= UnicodeCategory.OtherSymbol);
	},

	isSeparator: function (ch) {
		var category = this.getUnicodeCategory(ch);

		return (category >= UnicodeCategory.SpaceSeparator &&
		category <= UnicodeCategory.ParagraphSeparator);
	},

	isLower: function (ch) {
		return (this.getUnicodeCategory(ch) == UnicodeCategory.LowercaseLetter);
	},

	isUpper: function (ch) {
		return (this.getUnicodeCategory(ch) == UnicodeCategory.UppercaseLetter);
	},

	isSurrogate: function (ch) {
		return (this.getUnicodeCategory(ch) == UnicodeCategory.Surrogate);
	},

	isSurrogatePair: function (lowSurrogate, highSurrogate) {
		return '\uD800' <= highSurrogate && highSurrogate <= '\uDBFF' &&
			'\uDC00' <= lowSurrogate && lowSurrogate <= '\uDFFF';
	},

	isLowSurrogate: function (ch) {
		return ch >= '\uDC00' && ch <= '\uDFFF';
	},

	isHighSurrogate: function (ch) {
		return ch >= '\uD800' && ch <= '\uDBFF';
	}
};

export default Char;

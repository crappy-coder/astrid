MoChar = {
	getUnicodeCategory : function(ch) {
		return MoUnicodeCategoryData.CategoryData[ch.charCodeAt(0)];
	},
	
	getNumericValue : function(ch) {
		if(ch > 0x3289)
		{
			if(ch >= 0xff10 && ch <= 0xff19)
				return (ch - 0xff10);

			return -1;
		}

		return MoUnicodeCategoryData.NumericDataValues[
			MoUnicodeCategoryData.NumericData[ch.charCodeAt(0)]];
	},
	
	isLetter : function(ch) {
		return (MoChar.getUnicodeCategory(ch) <= MoUnicodeCategory.OtherLetter);
	},
	
	isLetterOrDigit : function(ch) {
		return (MoChar.isLetter(ch) || MoChar.isDigit(ch));
	},
	
	isDigit : function(ch) {
		return (MoChar.getUnicodeCategory(ch) == MoUnicodeCategory.DecimalDigitNumber);
	},
	
	isNumber : function(ch) {
		var category = MoChar.getUnicodeCategory(ch);
		
		return (category >= MoUnicodeCategory.DecimalDigitNumber && 
				category <= MoUnicodeCategory.OtherNumber);
	},
	
	isControl : function(ch) {
		return (MoChar.getUnicodeCategory(ch) == MoUnicodeCategory.Control);
	},
	
	isWhiteSpace : function(ch) {
		var category = MoChar.getUnicodeCategory(ch);
		
		if(category <= MoUnicodeCategory.OtherNumber)
			return false;
		
		if(category <= MoUnicodeCategory.ParagraphSeparator)
			return true;
		
		return (ch >= 0x09 && ch <= 0x0d || ch == 0x85 || ch == 0x205f);
	},
	
	isPunctuation : function(ch) {
		var category = MoChar.getUnicodeCategory(ch);
		
		return (category >= MoUnicodeCategory.ConnectorPunctuation && 
				category <= MoUnicodeCategory.OtherPunctuation);
	},
	
	isSymbol : function(ch) {
		var category = MoChar.getUnicodeCategory(ch);
		
		return (category >= MoUnicodeCategory.MathSymbol && 
				category <= MoUnicodeCategory.OtherSymbol);
	},
	
	isSeparator : function(ch) {
		var category = MoChar.getUnicodeCategory(ch);
		
		return (category >= MoUnicodeCategory.SpaceSeparator && 
				category <= MoUnicodeCategory.ParagraphSeparator);
	},
	
	isLower : function(ch) {
		return (MoChar.getUnicodeCategory(ch) == MoUnicodeCategory.LowercaseLetter);
	},
	
	isUpper : function(ch) {
		return (MoChar.getUnicodeCategory(ch) == MoUnicodeCategory.UppercaseLetter);
	},
	
	isSurrogate : function(ch) {
		return (MoChar.getUnicodeCategory(ch) == MoUnicodeCategory.Surrogate);
	},

	isSurrogatePair : function(lowSurrogate, highSurrogate) {
		return  '\uD800' <= highSurrogate && highSurrogate <= '\uDBFF' &&
				'\uDC00' <= lowSurrogate && lowSurrogate <= '\uDFFF';
	},

	isLowSurrogate : function(ch) {
		return ch >= '\uDC00' && ch <= '\uDFFF';
	},
	
	isHighSurrogate : function(ch) {
		return ch >= '\uD800' && ch <= '\uDBFF';
	}
};
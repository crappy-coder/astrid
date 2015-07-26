MoStringTokenizer = Class.create({
	initialize : function(str, quote, separator) {
		this.chQuote = MoValueOrDefault(quote, "'");
		this.chSeparator = MoValueOrDefault(separator, ",");
		this.chIndex = 0;
		this.str = str;
		this.strLen = (MoIsNull(str) ? 0 : str.length);
		this.tokenIndex = -1;
		this.tokenLength = 0;
		this.hasSeparator = false;

		while(this.chIndex < this.strLen && MoChar.isWhiteSpace(this.str.charAt(this.chIndex))) { ++this.chIndex }
	},
	
	isComplete : function() {
		return (this.chIndex == this.strLen);
	},
	
	getCurrent : function() {
		if(this.tokenIndex < 0)
			return null;

		return this.str.substr(this.tokenIndex, this.tokenLength);
	},

	next : function(isQuotedTokenAllowed) {
		this.moveNext(MoValueOrDefault(isQuotedTokenAllowed, false));

		return this.getCurrent();
	},
	
	moveNext : function(isQuotedTokenAllowed) {
		this.resetToken();
		
		if(!this.canMoveForward())
			return false;
			
		var ch = this.str.charAt(this.chIndex);
		var noMatchingQuote = false;
		
		if(isQuotedTokenAllowed && ch == this.chQuote)
		{
			noMatchingQuote = true;
			++this.chIndex;
		}
		
		var idx = this.chIndex;
		var len = 0;
		
		while(this.canMoveForward())
		{
			ch = this.str.charAt(this.chIndex);
			
			if(noMatchingQuote)
			{
				if(ch == this.chQuote)
				{
					noMatchingQuote = false;
					++this.chIndex;
					break;
				}
			}
			else if(MoChar.isWhiteSpace(ch) || ch == this.chSeparator)
			{
				if(ch == this.chSeparator)
				{
					this.hasSeparator = true;
					break;
				}
				
				break;
			}
			
			++this.chIndex;
			++len;
		}
		
		if(noMatchingQuote)
			throw new Error("Unable to move to next token, missing ending quote.");
		
		this.skipToNext();
		this.tokenIndex = idx;
		this.tokenLength = len;
		
		if(this.tokenLength > 0)
			return true;

		throw new Error("Unable to move to next token, token is empty.");
	},
	
	skipToNext : function() {
	
		if(!this.canMoveForward())
			return;
			
		var ch = this.str.charAt(this.chIndex);
		
		if(ch != this.chSeparator && !MoChar.isWhiteSpace(ch))
			throw new Error("Unable to move to next token, invalid data found.");
			
		var tokCount = 0;
		
		while(this.canMoveForward())
		{
			ch = this.str.charAt(this.chIndex);
			
			if(ch == this.chSeparator)
			{
				this.hasSeparator = true;
				++tokCount;
				++this.chIndex;
				
				if(tokCount > 1)
					break;

				continue;
			}
			else if(MoChar.isWhiteSpace(ch))
			{
				++this.chIndex;
				continue;
			}

			break;
		}
		
		if(tokCount <= 0 || this.canMoveForward())
			return;
		
		throw new Error("Unable to move to next token, token is empty");
	},
	
	canMoveForward : function() {
		return (this.chIndex < this.strLen);
	},

	resetToken : function() {
		this.hasSeparator = false;
		this.tokenIndex = -1;
	}
});
import Char from "./Char";

class StringTokenizer {
	constructor(str, quote, separator) {
		this.chQuote = astrid.valueOrDefault(quote, "'");
		this.chSeparator = astrid.valueOrDefault(separator, ",");
		this.chIndex = 0;
		this.str = str;
		this.strLen = (str == null ? 0 : str.length);
		this.tokenIndex = -1;
		this.tokenLength = 0;
		this.hasSeparator = false;

		while (this.chIndex < this.strLen && Char.isWhiteSpace(this.str.charAt(this.chIndex))) {
			++this.chIndex
		}
	}

	isComplete() {
		return (this.chIndex == this.strLen);
	}

	getCurrent() {
		if (this.tokenIndex < 0) {
			return null;
		}

		return this.str.substr(this.tokenIndex, this.tokenLength);
	}

	next(isQuotedTokenAllowed) {
		this.moveNext(astrid.valueOrDefault(isQuotedTokenAllowed, false));

		return this.getCurrent();
	}

	moveNext(isQuotedTokenAllowed) {
		this.resetToken();

		if (!this.canMoveForward()) {
			return false;
		}

		var ch = this.str.charAt(this.chIndex);
		var noMatchingQuote = false;

		if (isQuotedTokenAllowed && ch == this.chQuote) {
			noMatchingQuote = true;
			++this.chIndex;
		}

		var idx = this.chIndex;
		var len = 0;

		while (this.canMoveForward()) {
			ch = this.str.charAt(this.chIndex);

			if (noMatchingQuote) {
				if (ch == this.chQuote) {
					noMatchingQuote = false;
					++this.chIndex;
					break;
				}
			}
			else if (Char.isWhiteSpace(ch) || ch == this.chSeparator) {
				if (ch == this.chSeparator) {
					this.hasSeparator = true;
					break;
				}

				break;
			}

			++this.chIndex;
			++len;
		}

		if (noMatchingQuote) {
			throw new Error("Unable to move to next token, missing ending quote.");
		}

		this.skipToNext();
		this.tokenIndex = idx;
		this.tokenLength = len;

		if (this.tokenLength > 0) {
			return true;
		}

		throw new Error("Unable to move to next token, token is empty.");
	}

	skipToNext() {

		if (!this.canMoveForward()) {
			return;
		}

		var ch = this.str.charAt(this.chIndex);

		if (ch != this.chSeparator && !Char.isWhiteSpace(ch)) {
			throw new Error("Unable to move to next token, invalid data found.");
		}

		var tokCount = 0;

		while (this.canMoveForward()) {
			ch = this.str.charAt(this.chIndex);

			if (ch == this.chSeparator) {
				this.hasSeparator = true;
				++tokCount;
				++this.chIndex;

				if (tokCount > 1) {
					break;
				}

				continue;
			}
			else if (Char.isWhiteSpace(ch)) {
				++this.chIndex;
				continue;
			}

			break;
		}

		if (tokCount <= 0 || this.canMoveForward()) {
			return;
		}

		throw new Error("Unable to move to next token, token is empty");
	}

	canMoveForward() {
		return (this.chIndex < this.strLen);
	}

	resetToken() {
		this.hasSeparator = false;
		this.tokenIndex = -1;
	}
}

export default StringTokenizer;

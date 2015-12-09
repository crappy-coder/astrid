class StringBuffer {
	constructor() {
		this.str = "";
	}

	getLength() {
		return this.str.length;
	}

	prepend(str) {
		this.str = str + this.str;
	}

	prependFormat(format) {
		var args = Array.prototype.splice.call(arguments, 1);
		this.str = String.format(format, args) + this.str;
	}

	append(str) {
		this.str += str;
	}

	appendLine(str) {
		if (str != null) {
			this.append(str);
		}

		this.append("\n");
	}

	appendFormat(format) {
		var args = Array.prototype.splice.call(arguments, 1);
		this.str += String.format(format, args);
	}

	clear() {
		this.str = "";
	}

	insert(index, str) {
		if (index > this.getLength()) {
			return;
		}

		if (index == 0) {
			this.str = str + this.str;
		}
		else if (index == this.getLength()) {
			this.str += str;
		}
		else {
			var start = this.str.substr(0, index);
			var end = this.str.substr(index, this.getLength() - index);

			this.str = start + str + end;
		}
	}

	remove(index, len) {
		if ((index + len) > this.getLength()) {
			return;
		}

		var endIndex = index + len;

		if (index == 0) {
			this.str = this.str.substr(endIndex, this.getLength() - endIndex);
		}
		else {
			var start = this.str.substr(0, index);
			var end = this.str.substr(endIndex, this.getLength() - endIndex);

			this.str = start + end;
		}
	}

	replace(oldStr, newStr) {
		this.str = this.str.replace(oldStr, newStr);
	}

	charAt(index) {
		return this.str.charAt(index);
	}

	toString() {
		return this.str;
	}
}

export default StringBuffer;

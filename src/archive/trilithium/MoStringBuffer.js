MoStringBuffer = Class.create({
	initialize : function() {
		this.buffer = [];
		this.length = 0;
	},
	
	getLength : function() {
		return this.length;
	},

	append : function(str) {
		this.buffer[this.buffer.length] = str;
		this.length += str.length;
	},

	appendLine : function(str) {
		if(str != null)
			this.append(str);

		this.append("\n");
	},
	
	appendFormat : function(format) {
		this.append(String.formatWithObjects(format, arguments));
	},

	clear : function() {
		this.buffer.length = 0;
		this.length = 0;
	},

	toString : function() {
		return this.buffer.join("");
	}
});
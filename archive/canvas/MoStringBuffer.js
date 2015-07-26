MoStringBuffer = Class.create({
	initialize : function() {
		this.str = "";
	},
	
	getLength : function() {
		return this.str.length;
	},
	
	prepend : function(str) {
		this.str = str + this.str;
	},
	
	prependFormat : function(format) {
		this.str = String.formatWithObjects(format, arguments) + this.str;
	},

	append : function(str) {
		this.str += str;
	},
	
	appendLine : function(str) {
		if(str != null)
			this.append(str);

		this.append("\n");
	},
	
	appendFormat : function(format) {
		this.str += String.formatWithObjects(format, arguments);
	},
	
	clear : function() {
		this.str = "";
	},
	
	insert : function(index, str) {
		if(index > this.getLength())
			return;

		if(index == 0)
			this.str = str + this.str;
		else if(index == this.getLength())
			this.str += str;
		else
		{
			var start = this.str.substr(0, index);
			var end = this.str.substr(index, this.getLength() - index);

			this.str = start + str + end;
		}
	},
	
	remove : function(index, len) {
		if((index + len) > this.getLength())
			return;
		
		var endIndex = index + len;
		
		if(index == 0)
			this.str = this.str.substr(endIndex, this.getLength() - endIndex);
		else
		{
			var start = this.str.substr(0, index);
			var end = this.str.substr(endIndex, this.getLength() - endIndex);
			
			this.str = start + end;
		}
	},
	
	replace : function(oldStr, newStr) {
		this.str = this.str.replace(oldStr, newStr);
	},
	
	charAt : function(index) {
		return this.str.charAt(index);
	},
	
	toString : function() {
		return this.str;
	}
});
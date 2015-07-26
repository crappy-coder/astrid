MoStack = Class.create({
	initialize : function() {
		this.stackImpl = new Array();
		this.size = 0;
	},
	
	getCount : function() {
		return this.size;
	},
	
	isEmpty : function() {
		return (this.getCount() == 0);
	},
	
	peek : function() {
		if(this.size == 0)
			throw new Error("Unable to peek at stack, stack is empty.");
		
		return this.stackImpl[this.size-1];
	},
	
	pop : function() {
		if(this.size == 0)
			throw new Error("Unable to peek at stack, stack is empty.");
		
		var obj = this.stackImpl[--this.size];
		this.stackImpl[this.size] = null;
		this.stackImpl.length = this.size;
		
		return obj;
	},
	
	push : function(obj) {
		this.stackImpl.push(obj);
		this.size++;
	},
	
	contains : function(obj) {
		return this.stackImpl.contains(obj);
	},
	
	clear : function() {
		this.stackImpl.clear();
		this.size = 0;
	},
	
	clone : function() {
		var stack = new MoStack();
		stack.size = this.size;
		stack.stackImpl = this.stackImpl.concat();
		
		return stack;
	},

	copyTo : function(array, atIndex) {
		if(array != null)
		{
			for(var i = 0; i < this.size; i++)
				array[atIndex + i] = this.stackImpl[i];
		}
	},
	
	toArray : function() {
		return this.stackImpl.concat();
	},
	
	toString : function() {
		return "Stack[ size=" + this.size + " ]";
	}
});
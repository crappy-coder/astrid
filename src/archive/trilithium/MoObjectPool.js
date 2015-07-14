MoObjectPool = Class.create({
	initialize : function(createFunc) {
		this.pool = [];
		this.createFunc = createFunc;
	},
	
	getLength : function() {
		return this.pool.length();
	},
	
	get : function() {
		if(this.pool.length == 0)
			return this.createFunc();

		return this.pool.pop();
	},

	init : function(size) {
		for(var i = 0; i < size; ++i)
			this.pool.push(this.createFunc());
	},

	recycle : function(obj) {
		if(!this.pool.contains(obj))
			this.pool.push(obj);
	}
});
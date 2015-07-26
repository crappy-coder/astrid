MoNamedObject = Class.create(MoEventDispatcher, {
	initialize : function($super, name) {
		$super();
		
		this.name = name;
		this.index = 0;
	},

	getName : function() {
		return this.name;
	},

	setName : function(value) {
		this.name = value;
	},

	isEqualTo : function(obj) {
		return (this == obj);
	},

	toString : function() {
		return this.name;
	}
});

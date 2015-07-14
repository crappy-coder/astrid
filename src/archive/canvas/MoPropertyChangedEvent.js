MoPropertyChangedEvent = Class.create(MoEvent, {
	initialize : function($super, type, propName, oldValue, newValue, bubbles, cancelable) {
		$super(type, bubbles, cancelable);
		
		this.propName = propName;
		this.oldValue = oldValue;
		this.newValue = newValue;
	},

	getPropertyName : function() {
		return this.propName;
	},
	
	getOldValue : function() {
		return this.oldValue;
	},
	
	getNewValue : function() {
		return this.newValue;
	}
});

Object.extend(MoPropertyChangedEvent, {
	PROPERTY_CHANGED : "propertyChanged"
});
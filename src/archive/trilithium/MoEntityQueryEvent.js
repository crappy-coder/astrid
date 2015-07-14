MoEntityQueryEvent = Class.create(MoEvent, {
	initialize : function($super, type, entityFixture, bubbles, cancelable) {
		$super(type, bubbles, cancelable);
		
		this.entityFixture = entityFixture;
		this.queryRect = MoRectangle.Empty();
	},
	
	getQueryRect : function() {
		return this.queryRect;
	},
	
	getEntity : function() {
		return this.entityFixture.getEntity();
	},
	
	getEntityFixture : function() {
		return this.entityFixture;
	}
});

Object.extend(MoEntityQueryEvent, {
	REPORT : "report"
});
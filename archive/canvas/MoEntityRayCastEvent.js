MoEntityRayCastEvent = Class.create(MoEvent, {
	initialize : function($super, type, bubbles, cancelable) {
		$super(type, bubbles, cancelable);
		
		this.startPoint = MoVector2D.Zero();
		this.endPoint = MoVector2D.Zero();
		this.entityFixture = null;
		this.point = null;
		this.normal = null;
		this.distance = 0;
		this.result = 1;
	},
	
	getStartPoint : function() {
		return this.startPoint;
	},
	
	getEndPoint : function() {
		return this.endPoint;
	},
	
	getEntity : function() {
		return this.entityFixture.getEntity();
	},
	
	getEntityFixture : function() {
		return this.entityFixture;
	},
	
	getPoint : function() {
		return this.point;
	},
	
	getNormal : function() {
		return this.normal;
	},
	
	getDistance : function() {
		return this.distance;
	},
	
	setResult : function(value) {
		this.result = value;
	}
});

Object.extend(MoEntityRayCastEvent, {
	REPORT : "reportRayCast"
});
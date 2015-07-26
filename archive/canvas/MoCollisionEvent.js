MoCollisionEvent = Class.create(MoEvent, {
	initialize : function($super, type, controller, contactSource, contactTarget, contactNormal, contactPoints, linearVelocityA, linearVelocityB, touching, continuous, sensor, enabled, bubbles, cancelable) {
		$super(type, bubbles, cancelable);

		this.controller = controller;
		this.contactSource = contactSource;
		this.contactTarget = contactTarget;
		this.contactNormal = contactNormal;
		this.contactPoints = contactPoints;
		this.linearVelocityA = linearVelocityA;
		this.linearVelocityB = linearVelocityB;
		this.isTouching = touching;
		this.isContinuous = continuous;
		this.isSensor = sensor;
		this.isEnabled = enabled;
	},
	
	getController : function() {
		return this.controller;
	},
	
	getContactNormal : function() {
		return this.contactNormal;
	},

	getContactPoints : function(asUnits) {
		asUnits = MoValueOrDefault(asUnits, false);

		if(asUnits)
			return this.contactPoints;

		var points = [];
		var p = null;
		var len = this.contactPoints.length;

		for(var i = 0; i < len; ++i)
		{
			p = this.contactPoints[i];
			points.push(this.controller.convertPoint(p, true, false));
		}

		return points;
	},

	getContactSource : function() {
		return this.contactSource;
	},
	
	getContactTarget : function() {
		return this.contactTarget;
	},
	
	getLinearVelocityA : function() {
		return this.linearVelocityA;
	},
	
	getLinearVelocityB : function() {
		return this.linearVelocityB;
	},
	
	getApproachVelocity : function() {
	
		// NOTE: for some reason, we need to reverse the substract, instead of
		//       b - a, otherwise it would return a negative velocity, but we
		//       want a positive velocity when approaching and negative when
		//       leaving...
		var delta = this.linearVelocityA.subtract(this.linearVelocityB);

		return delta.dotProduct(this.contactNormal);
	},

	getIsTouching : function() {
		return this.isTouching;
	},
	
	getIsContinuous : function() {
		return this.isContinuous;
	},
	
	getIsSensor : function() {
		return this.isSensor;
	},
	
	getIsEnabled : function() {
		return this.isEnabled;
	}
});

Object.extend(MoCollisionEvent, {
	START : "collisionStart",
	FINISH : "collisionFinish"
});
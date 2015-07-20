import Event from "./Event";
import { ValueOrDefault } from "./Engine";

class CollisionEvent extends Event {
	constructor(type, controller, contactSource, contactTarget, contactNormal, contactPoints, linearVelocityA, linearVelocityB, touching, continuous, sensor, enabled, bubbles, cancelable) {
		super(type, bubbles, cancelable);

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
	}

	getController() {
		return this.controller;
	}

	getContactNormal() {
		return this.contactNormal;
	}

	getContactPoints(asUnits) {
		asUnits = ValueOrDefault(asUnits, false);

		if (asUnits) {
			return this.contactPoints;
		}

		var points = [];
		var p = null;
		var len = this.contactPoints.length;

		for (var i = 0; i < len; ++i) {
			p = this.contactPoints[i];
			points.push(this.controller.convertPoint(p, true, false));
		}

		return points;
	}

	getContactSource() {
		return this.contactSource;
	}

	getContactTarget() {
		return this.contactTarget;
	}

	getLinearVelocityA() {
		return this.linearVelocityA;
	}

	getLinearVelocityB() {
		return this.linearVelocityB;
	}

	getApproachVelocity() {

		// NOTE: for some reason, we need to reverse the subtract, instead of
		//       b - a, otherwise it would return a negative velocity, but we
		//       want a positive velocity when approaching and negative when
		//       leaving...
		var delta = this.linearVelocityA.subtract(this.linearVelocityB);

		return delta.dotProduct(this.contactNormal);
	}

	getIsTouching() {
		return this.isTouching;
	}

	getIsContinuous() {
		return this.isContinuous;
	}

	getIsSensor() {
		return this.isSensor;
	}

	getIsEnabled() {
		return this.isEnabled;
	}
}

CollisionEvent.START = "collisionStart";
CollisionEvent.FINISH = "collisionFinish";

export default CollisionEvent;

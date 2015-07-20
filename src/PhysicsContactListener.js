import Vector2D from "./Vector2D";
import ContactPointState from "./ContactPointState";
import CollisionEvent from "./CollisionEvent";
import Box2D from "box2dweb";

var PXVector2D = Box2D.Common.Math.b2Vec2;
var PXSettings = Box2D.Common.b2Settings;
var PXWorldManifold = Box2D.Collision.b2WorldManifold;

class PhysicsContactListener {
	constructor(controller) {
		this.controller = controller;
		this.beginContacts = [];
		this.endContacts = [];
		this.debugContactPoints = [];
		this.debugContactPointCount = 0;

		this.tmpWorldManifold = new PXWorldManifold();
	}

	initializeDebugContactPoints() {
		this.debugContactPoints = new Array(PhysicsContactListener.MaxDebugContactPoints);

		for (var i = 0; i < PhysicsContactListener.MaxDebugContactPoints; ++i) {
			this.debugContactPoints[i] = {
				fixtureA: null, fixtureB: null,
				normal: new PXVector2D(), position: new PXVector2D(),
				state: ContactPointState.Null
			};
		}
	}

	resetDebugContactPoints() {
		this.debugContactPointCount = 0;
	}

	clear() {
		this.beginContacts = [];
		this.endContacts = [];
	}

	process() {
		var c = null;

		// dispatch begin events
		var len = this.beginContacts.length;
		var i;

		for (i = 0; i < len; ++i) {
			c = this.beginContacts[i];

			this.dispatchCollisionEvent(CollisionEvent.START, c.entityA, c, false);
			this.dispatchCollisionEvent(CollisionEvent.START, c.entityB, c, false);
		}

		// dispatch end events
		len = this.endContacts.length;

		for (i = 0; i < len; ++i) {
			c = this.endContacts[i];

			this.dispatchCollisionEvent(CollisionEvent.FINISH, c.entityA, c, false);
			this.dispatchCollisionEvent(CollisionEvent.FINISH, c.entityB, c, false);
		}

		// reset for next time step
		this.clear();
	}

	dispatchCollisionEvent(type, target, contact, always) {
		if (target == null) {
			return;
		}

		if (always || (!always && target.hasEventHandler(type))) {
			target.dispatchEvent(new CollisionEvent(
				type,
				this.controller,
				contact.source,
				contact.target,
				contact.normal,
				contact.points,
				contact.linearVelocityA,
				contact.linearVelocityB,
				contact.touching,
				contact.continuous,
				contact.sensor,
				contact.enabled,
				false,
				false));
		}
	}

	addContactForProcessing(contactArray, contact) {
		var fixtureA = contact.GetFixtureA();
		var fixtureB = contact.GetFixtureB();
		var bodyA = fixtureA.GetBody();
		var bodyB = fixtureB.GetBody();
		var entityLinkA = fixtureA.GetUserData();
		var entityLinkB = fixtureB.GetUserData();
		var entityA = bodyA.GetUserData();
		var entityB = bodyB.GetUserData();
		var p = null;
		var velA = new Vector2D(0, 0);
		var velB = new Vector2D(0, 0);
		var points = [];

		// just use the world manifold point
		contact.GetWorldManifold(this.tmpWorldManifold);

		// compute the linear velocities
		var pointCount = this.tmpWorldManifold.m_points.length;

		var velocities = this.getVelocities(bodyA, bodyB, this.tmpWorldManifold);

		if (velocities) {
			velA.x = velocities[0].x;
			velA.y = velocities[0].y;
			velB.x = velocities[1].x;
			velB.y = velocities[1].y;
		}

		// convert the points to a Vector2D
		for (var i = 0; i < pointCount; ++i) {
			p = this.tmpWorldManifold.m_points[i];
			points.push(new Vector2D(p.x, p.y));
		}

		// store our contact for processing
		contactArray.push({
			entityA: entityA,
			entityB: entityB,
			source: entityLinkA,
			target: entityLinkB,
			linearVelocityA: velA,
			linearVelocityB: velB,
			normal: new Vector2D(this.tmpWorldManifold.m_normal.x, this.tmpWorldManifold.m_normal.y),
			points: points,
			touching: contact.IsTouching(),
			continuous: contact.IsContinuous(),
			sensor: contact.IsSensor(),
			enabled: contact.IsEnabled()
		});
	}

	getVelocities(bodyA, bodyB, worldManifold) {
		var pointCount = worldManifold.m_points.length;

		if (pointCount > 0) {
			var p = worldManifold.m_points[0];
			var v1 = bodyA.GetLinearVelocityFromWorldPoint(p);
			var v2 = bodyB.GetLinearVelocityFromWorldPoint(p);

			return [v1, v2];
		}

		return null;
	}

	getPointStates(state1, state2, manifold1, manifold2) {
		var i, j, id;
		for (i = 0; i < PXSettings.b2_maxManifoldPoints; ++i) {
			state1[i] = state2[i] = ContactPointState.Null;
		}

		for (i = 0; i < manifold1.m_pointCount; ++i) {
			id = manifold1.m_points[i].m_id;

			state1[i] = ContactPointState.Remove;

			for (j = 0; j < manifold2.m_pointCount; ++j) {
				if (manifold2.m_points[j].m_id._key == id._key) {
					state1[i] = ContactPointState.Persist;
					break;
				}
			}
		}

		for (i = 0; i < manifold2.m_pointCount; ++i) {
			id = manifold2.m_points[i].m_id;

			state2[i] = ContactPointState.Add;

			for (j = 0; j < manifold1.m_pointCount; ++j) {
				if (manifold1.m_points[j].m_id._key == id._key) {
					state2[i] = ContactPointState.Persist;
					break;
				}
			}
		}
	}

	addDebugContactPoint(fixtureA, fixtureB, position, normal, state) {
		var cp = this.debugContactPoints[this.debugContactPointCount];
		cp.fixtureA = fixtureA;
		cp.fixtureB = fixtureB;
		cp.position = new PXVector2D(position.x, position.y);
		cp.normal = new PXVector2D(normal.x, normal.y);
		cp.state = state;

		++this.debugContactPointCount;
	}

	BeginContact(contact) {
		this.addContactForProcessing(this.beginContacts, contact);
	}

	EndContact(contact) {
		this.addContactForProcessing(this.endContacts, contact);
	}

	PreSolve(contact, oldManifold) {
		var entityA = contact.GetFixtureA().GetBody().GetUserData();
		var entityB = contact.GetFixtureB().GetBody().GetUserData();
		var manifold = contact.GetManifold();
		var result = true;

		// add contacts for visual debugging
		if (this.controller.getContactPointDebuggingEnabled() && manifold.m_pointCount > 0) {
			contact.GetWorldManifold(this.tmpWorldManifold);

			// get the point states and add the contact points, this was taken from the
			// official C++ version of Box2D, which seems to have not been included in
			// the port... not sure why?
			var state1 = new Array(PXSettings.b2_maxManifoldPoints);
			var state2 = new Array(PXSettings.b2_maxManifoldPoints);

			this.getPointStates(state1, state2, oldManifold, manifold);

			for (var i = 0; i < manifold.m_pointCount &&
			this.debugContactPointCount < PhysicsContactListener.MaxDebugContactPoints; ++i) {
				this.addDebugContactPoint(contact.GetFixtureA(), contact.GetFixtureB(), this.tmpWorldManifold.m_points[i], this.tmpWorldManifold.m_normal, state2[i]);
			}
		}


		// handle the usual callbacks
		if (entityA != null && entityA.preSolveCallback != null) {
			result = entityA.preSolveCallback(contact, oldManifold);
		}

		// cancel the next callback if user returned
		// false from the first
		if (!result) {
			return;
		}

		if (entityB != null && entityB.preSolveCallback != null) {
			entityB.preSolveCallback(contact, oldManifold);
		}
	}

	PostSolve(contact, impulse) {
		var entityA = contact.GetFixtureA().GetBody().GetUserData();
		var entityB = contact.GetFixtureB().GetBody().GetUserData();
		var result = true;

		if (entityA != null && entityA.postSolveCallback != null) {
			result = entityA.postSolveCallback(contact, impulse);
		}

		// cancel the next callback if user returned
		// false from the first
		if (!result) {
			return;
		}

		if (entityB != null && entityB.postSolveCallback != null) {
			entityB.postSolveCallback(contact, impulse);
		}
	}
}

PhysicsContactListener.MaxDebugContactPoints = 2048;

export default PhysicsContactListener;

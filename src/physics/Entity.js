import EntityBase from "./EntityBase";
import Vector2D from "./math/Vector2D";
import Direction from "./Direction";
import EntityType from "./EntityType";
import EngineMath from "./math/EngineMath";
import { ValueOrDefault } from "./Engine";
import Rectangle from "./Rectangle";
import EntityFixture from "./EntityFixture";
import EntityJoinType from "./EntityJoinType";
import Box2D from "box2dweb";

var PXVector2D = Box2D.Common.Math.b2Vec2;
var PXDistanceJointDef = Box2D.Dynamics.Joints.b2DistanceJointDef;
var PXCircleShape = Box2D.Collision.Shapes.b2CircleShape;
var PXPolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
var PXMassData = Box2D.Collision.Shapes.b2MassData;
var PXBodyDef = Box2D.Dynamics.b2BodyDef;
var PXFixtureDef = Box2D.Dynamics.b2FixtureDef;
var PXFrictionJointDef = Box2D.Dynamics.Joints.b2FrictionJointDef;
var PXGearJointDef = Box2D.Dynamics.Joints.b2GearJointDef;
var PXJoint = Box2D.Dynamics.Joints.b2Joint;
var PXLineJointDef = Box2D.Dynamics.Joints.b2LineJointDef;
var PXPrismaticJointDef = Box2D.Dynamics.Joints.b2PrismaticJointDef;
var PXPulleyJointDef = Box2D.Dynamics.Joints.b2PulleyJointDef;
var PXRevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef;
var PXWeldJointDef = Box2D.Dynamics.Joints.b2WeldJointDef;

class Entity extends EntityBase {
	constructor(type, name, descriptor, controller) {
		super(name, controller);

		this.type = type;
		this.gravityScale = 0;
		this.moveSpeeds = [4, 4, 4, 4];
		this.currentMoveSpeed = Vector2D.Zero();
		this.currentMovement = Direction.None;
		this.isMoving = false;
		this.preSolveCallback = null;
		this.postSolveCallback = null;
		this.body = this.createBody(descriptor);
		this.body.SetUserData(this);
	}

	setPreSolveCallback(value) {
		this.preSolveCallback = value;
	}

	setPostSolveCallback(value) {
		this.postSolveCallback = value;
	}

	getType() {
		return this.type;
	}

	getBody() {
		return this.body;
	}

	getIsGround() {
		return (this.type == EntityType.Ground);
	}

	getIsBullet() {
		return this.body.IsBullet();
	}

	setIsBullet(value) {
		this.body.SetBullet(value);
	}

	getIsAwake() {
		return this.body.IsAwake();
	}

	setIsAwake(value) {
		this.body.SetAwake(value);
	}

	getIsActive() {
		return this.body.IsActive();
	}

	setIsActive(value) {
		this.body.SetActive(value);
	}

	getCanSleep() {
		return this.body.IsSleepingAllowed();
	}

	setCanSleep(value) {
		this.body.SetSleepingAllowed(value);
	}

	getGravityScale() {
		return this.gravityScale;
	}

	setGravityScale(value) {
		this.gravityScale = value;
	}

	getEnableRotation() {
		return !this.body.IsFixedRotation();
	}

	setEnableRotation(value) {
		this.body.SetFixedRotation(!value);
	}

	getLocalCenterImpl(asUnits) {
		var center = this.body.GetLocalCenter();

		return this.convertPoint(center, true, asUnits);
	}

	getGlobalCenterImpl(asUnits) {
		var center = this.body.GetWorldCenter();

		return this.convertPoint(center, true, asUnits);
	}

	getPositionImpl(asUnits) {
		var pos = this.body.GetPosition();

		return this.convertPoint(pos, true, asUnits);
	}

	setPositionImpl(value, isUnits) {
		var pos = this.body.GetPosition();

		if (isUnits) {
			pos.x = value.x;
			pos.y = value.y;
		}
		else {
			var arr = this.toUnits([value.x, value.y]);

			pos.x = arr[0];
			pos.y = arr[1];
		}

		this.body.SetPosition(pos);
	}

	getAngleImpl(asRadians) {
		var angle = this.body.GetAngle();

		if (asRadians) {
			return angle;
		}

		return EngineMath.radiansToDegrees(angle);
	}

	setAngleImpl(value, isRadians) {
		if (!isRadians) {
			value = EngineMath.degreesToRadians(value);
		}

		this.body.SetAngle(value);
	}

	getLinearVelocity() {
		var v = this.body.GetLinearVelocity();

		return new Vector2D(v.x, v.y);
	}

	setLinearVelocity(value) {
		this.body.SetLinearVelocity(new PXVector2D(value.x, value.y));
	}

	getAngularVelocity() {
		return this.body.GetAngularVelocity();
	}

	setAngularVelocity(value) {
		this.body.SetAngularVelocity(value);
	}

	getMass() {
		return this.body.GetMass();
	}

	getInertia() {
		return this.body.GetInertia();
	}

	getLinearDamping() {
		return this.body.GetLinearDamping();
	}

	setLinearDamping(value) {
		this.body.SetLinearDamping(value);
	}

	getAngularDamping() {
		return this.body.GetAngularDamping();
	}

	setAngularDamping(value) {
		this.body.SetAngularDamping(value);
	}

	getWorld() {
		return this.controller.getWorld();
	}

	getNext() {
		var nextBody = this.body.GetNext();

		// return the entity
		if (nextBody != null) {
			return nextBody.GetUserData();
		}

		return null;
	}

	getBoundsImpl(asUnits, asAABB) {
		if (asAABB) {
			var bounds = Rectangle.Zero();

			for (var fixture = this.body.GetFixtureList(); fixture; fixture = fixture.GetNext()) {
				bounds.unionWithRect(fixture.GetUserData().getBounds(asUnits, asAABB));
			}

			return bounds;
		}
	}

	getMassData() {
		var data = new PXMassData();

		this.body.GetMassData(data);

		return data;
	}

	setMassData(value) {
		this.body.SetMassData(value);
	}

	resetMassData() {
		this.body.ResetMassData();
	}

	getMoveSpeed(direction) {
		if (direction == Direction.EastWest || direction == Direction.All) {
			return this.moveSpeeds[this.getMoveSpeedIndex(Direction.East)];
		} else if (direction == Direction.NorthSouth) {
			return this.moveSpeeds[this.getMoveSpeedIndex(Direction.North)];
		} else {
			return this.moveSpeeds[this.getMoveSpeedIndex(direction)];
		}
	}

	setMoveSpeed(direction, speed) {
		if (direction == Direction.EastWest) {
			this.moveSpeeds[this.getMoveSpeedIndex(Direction.East)] = speed;
			this.moveSpeeds[this.getMoveSpeedIndex(Direction.West)] = speed;
		}
		else if (direction == Direction.NorthSouth) {
			this.moveSpeeds[this.getMoveSpeedIndex(Direction.North)] = speed;
			this.moveSpeeds[this.getMoveSpeedIndex(Direction.South)] = speed;
		}
		else if (direction == Direction.All) {
			this.moveSpeeds[this.getMoveSpeedIndex(Direction.East)] = speed;
			this.moveSpeeds[this.getMoveSpeedIndex(Direction.West)] = speed;
			this.moveSpeeds[this.getMoveSpeedIndex(Direction.North)] = speed;
			this.moveSpeeds[this.getMoveSpeedIndex(Direction.South)] = speed;
		}
		else {
			this.moveSpeeds[this.getMoveSpeedIndex(direction)] = speed;
		}
	}

	destroy() {
		var isDestroyed = this.isDestroyed;

		super.destroy();

		if (!isDestroyed) {
			// just remove any entity fixtures, the internal fixture will be destroyed when
			// the body is destroyed
			for (var fixture = this.body.GetFixtureList(); fixture; fixture = fixture.GetNext()) {
				this.controller.removeEntity(fixture.GetUserData(), true);
			}
		}
	}

	applyForce(fx, fy) {
		this.applyForceAtImpl(fx, fy, this.body.GetWorldCenter());
	}

	applyForceAt(fx, fy, x, y, isUnits) {
		var units = (ValueOrDefault(isUnits, false) ? [x, y] : this.toUnits([x, y]));

		this.applyForceAtImpl(fx, fy, new PXVector2D(units[0], units[1]));
	}

	applyForceAtImpl(fx, fy, point) {
		this.body.ApplyForce(new PXVector2D(fx, fy), point);
	}

	applyImpulse(ix, iy) {
		this.applyImpulseAtImpl(ix, iy, this.body.GetWorldCenter());
	}

	applyImpulseAt(ix, iy, x, y, isUnits) {
		var units = (ValueOrDefault(isUnits, false) ? [x, y] : this.toUnits([x, y]));

		this.applyImpulseAtImpl(ix, iy, new PXVector2D(units[0], units[1]));
	}

	applyImpulseAtImpl(ix, iy, point) {
		this.body.ApplyImpulse(new PXVector2D(ix, iy), point);
	}

	applyTorque(torque) {
		this.body.ApplyTorque(torque);
	}

	stop() {
		this.currentMovement = Direction.None;
		this.currentMoveSpeed.x = 0;
		this.currentMoveSpeed.y = 0;
	}

	/*
	 * - move(direction)
	 * - move(xSpeed, ySpeed)
	 */
	move() {
		if (arguments.length == 1) {
			this.currentMovement = arguments[0];
			this.currentMoveSpeed.x = 0;
			this.currentMoveSpeed.y = 0;
		}
		else if (arguments.length == 2) {
			this.currentMovement = Direction.Variable;
			this.currentMoveSpeed.x = arguments[0];
			this.currentMoveSpeed.y = arguments[1];
		}

		this.isMoving = true;
	}

	moveNow(rx, ry) {
		var body = this.body;
		var pos = body.GetPosition();
		var mass = body.GetMass();
		var vel = body.GetLinearVelocity();

		this.applyImpulseAt(
			(rx == 0 ? 0 : mass * (rx - vel.x)),
			(ry == 0 ? 0 : mass * (ry - vel.y)),
			pos.x, pos.y, true);
	}

	wakeup() {
		this.setIsAwake(true);
	}

	sleep() {
		this.setIsAwake(false);
	}

	reset() {
		this.resetDrawable(this.body.GetPosition(), new PXVector2D(0, 0), this.body.GetAngle());
	}

	update(ratio) {
		var body = this.body;
		var vel = body.GetLinearVelocity();

		// apply gravity scaling
		if (this.gravityScale != 0) {
			var gravity = this.controller.getWorld().GetGravity();
			var m = body.GetMass();

			this.applyForce(
				(gravity.x * m) * this.gravityScale,
				(gravity.y * m) * this.gravityScale);
		}

		// apply movements
		if (this.currentMovement != Direction.None ||
			(this.isMoving && this.type == EntityType.Kinematic && (vel.x != 0 || vel.y != 0))) {
			var mass = body.GetMass();
			var pos = body.GetPosition();
			var sx = 0;
			var sy = 0;
			var vx = 0;
			var vy = 0;

			if (this.currentMovement == Direction.Variable) {
				var hDir = (this.currentMoveSpeed.x > 0 ? Direction.East : Direction.West);
				var vDir = (this.currentMoveSpeed.y > 0 ? Direction.South : Direction.North);

				sx = this.getMoveSpeed(hDir) * this.currentMoveSpeed.x;
				sy = this.getMoveSpeed(vDir) * this.currentMoveSpeed.y;
			}
			else {
				// move north
				if ((this.currentMovement & Direction.North) != Direction.None) {
					sy += -this.getMoveSpeed(Direction.North);
				}

				// move south
				if ((this.currentMovement & Direction.South) != Direction.None) {
					sy += this.getMoveSpeed(Direction.South);
				}

				// move east
				if ((this.currentMovement & Direction.East) != Direction.None) {
					sx += this.getMoveSpeed(Direction.East);
				}

				// move west
				if ((this.currentMovement & Direction.West) != Direction.None) {
					sx += -this.getMoveSpeed(Direction.West);
				}
			}

			this.wakeup();

			if (this.type == EntityType.Kinematic) {
				sx = (sx != 0 ? (sx) : 0);
				sy = (sy != 0 ? (sy) : 0);

				this.isMoving = (this.isMoving && sx != 0 && sy != 0);
				this.setLinearVelocity(new Vector2D(sx, sy));
			}
			else {
				sx = (sx != 0 ? mass * (sx - vel.x) : 0);
				sy = (sy != 0 ? mass * (sy - vel.y) : 0);

				this.applyImpulseAt(sx, sy, pos.x, pos.y, true);
			}
		}

		// update drawable
		this.updateDrawable(ratio, this.body.GetPosition(), new PXVector2D(0, 0), this.body.GetAngle());
	}

	createPoly(name, vertices, density, friction, restitution, isSensor) {
		var def = this.createFixtureDef(density, friction, restitution, isSensor);
		var len = vertices.length;
		var v = null;

		for (var i = 0; i < len; ++i) {
			v = this.toUnits([vertices[i].x, vertices[i].y]);
			vertices[i] = new PXVector2D(v[0], v[1]);
		}

		def.shape = new PXPolygonShape();
		def.shape.SetAsVector(vertices, vertices.length);

		return new EntityFixture(name, this.body.CreateFixture(def), this.controller);
	}

	createBorder(name, width, height, size, density, friction, restitution, isSensor) {
		return createBorderAt(name, 0, 0, width, height, size, density, friction, restitution, isSensor);
	}

	createBorderAt(name, x, y, width, height, size, density, friction, restitution, isSensor) {
		var hw = width * 0.5;
		var hh = height * 0.5;
		var hs = size * 0.5;
		var top = this.createBoxAt(name + "-t", x + hw, y + hs, width, size, density, friction, restitution, isSensor);
		var bottom = this.createBoxAt(name + "-b", x + hw, y + height -
			hs, width, size, density, friction, restitution, isSensor);
		var left = this.createBoxAt(name + "-l", x + hs, y + hh, size, height, density, friction, restitution, isSensor);
		var right = this.createBoxAt(name + "-r", x + width - hs, y +
			hh, size, height, density, friction, restitution, isSensor);

		return [top, left, bottom, right];
	}

	createBox(name, width, height, density, friction, restitution, isSensor) {
		var def = this.createFixtureDef(density, friction, restitution, isSensor);
		var units = this.toUnits([width, height]);

		def.shape = new PXPolygonShape();
		def.shape.SetAsBox(units[0] * 0.5, units[1] * 0.5);

		return new EntityFixture(name, this.body.CreateFixture(def), this.controller);
	}

	createBoxAt(name, x, y, width, height, density, friction, restitution, isSensor) {
		var hw = width * 0.5;
		var hh = height * 0.5;

		var vertices = [
			new PXVector2D(x + -hw, y + -hh),
			new PXVector2D(x + hw, y + -hh),
			new PXVector2D(x + hw, y + hh),
			new PXVector2D(x + -hw, y + hh)
		];

		return this.createPoly(name, vertices, density, friction, restitution, isSensor);
	}

	createEdge(name, x1, y1, x2, y2, density, friction, restitution, isSensor) {
		var def = this.createFixtureDef(density, friction, restitution, isSensor);
		var units = this.toUnits([x1, y1, x2, y2]);

		def.shape = new PXPolygonShape();
		def.shape.SetAsEdge(new PXVector2D(units[0], units[1]), new PXVector2D(units[2], units[3]));

		return new EntityFixture(name, this.body.CreateFixture(def), this.controller);
	}

	createCircle(name, size, density, friction, restitution, isSensor) {
		return this.createCircleAt(name, 0, 0, size, density, friction, restitution, isSensor);
	}

	createCircleAt(name, x, y, size, density, friction, restitution, isSensor) {
		var def = this.createFixtureDef(density, friction, restitution, isSensor);
		var units = this.toUnits([x, y, size]);

		def.shape = new PXCircleShape(units[2] * 0.5);
		def.shape.SetLocalPosition(new PXVector2D(units[0], units[1]));

		return new EntityFixture(name, this.body.CreateFixture(def), this.controller);
	}

	createEllipse(name, width, height, quality, density, friction, restitution, isSensor) {
		return this.createEllipseAt(name, 0, 0, width, height, quality, density, friction, restitution, isSensor);
	}

	createEllipseAt(name, x, y, width, height, quality, density, friction, restitution, isSensor) {
		var vertices = [];
		var rx = width * 0.5;
		var ry = height * 0.5;
		var cx = x + rx;
		var cy = y + ry;

		// compute an approximate number of segments based on a quality and the size
		var segs = Math.round(Entity.ELLIPSE_SEGMENTS_PER_UNIT * quality);

		// create each quadrant
		this.createCurve(vertices, segs, cx + rx, cy, cx, cy - ry, cx + rx, cy - Entity.TANGENT_LENGTH * ry, cx +
			Entity.TANGENT_LENGTH * rx, cy - ry);
		this.createCurve(vertices, segs, cx, cy - ry, cx - rx, cy, cx - Entity.TANGENT_LENGTH * rx, cy - ry, cx - rx, cy -
			Entity.TANGENT_LENGTH * ry);
		this.createCurve(vertices, segs, cx - rx, cy, cx, cy + ry, cx - rx, cy + Entity.TANGENT_LENGTH * ry, cx -
			Entity.TANGENT_LENGTH * rx, cy + ry);
		this.createCurve(vertices, segs, cx, cy + ry, cx + rx, cy, cx + Entity.TANGENT_LENGTH * rx, cy + ry, cx + rx, cy +
			Entity.TANGENT_LENGTH * ry);

		// create the elliptical polygon
		return this.createPoly(name, vertices, density, friction, restitution, isSensor);
	}

	createCurve(vertices, segmentCount, x1, y1, x2, y2, cpx1, cpy1, cpx2, cpy2) {
		var vx = 0;
		var vy = 0;
		var inc = 1.0 / segmentCount;
		var t = 0;

		// generate the segments to form the curve
		for (var i = 0; i < segmentCount; i++) {
			t = i * inc;

			// compute the curve vertex
			vx = Math.pow((1 - t), 3) * x1 + 3 * t * Math.pow((1 - t), 2) * cpx1 + 3 * Math.pow(t, 2) * (1 - t) * cpx2 +
				Math.pow(t, 3) * x2;
			vy = Math.pow((1 - t), 3) * y1 + 3 * t * Math.pow((1 - t), 2) * cpy1 + 3 * Math.pow(t, 2) * (1 - t) * cpy2 +
				Math.pow(t, 3) * y2;

			// need to reverse the order, box2d is CCW
			vertices.unshift(new PXVector2D(vx, vy));
		}
	}

	createFixtureDef(density, friction, restitution, isSensor) {
		var fixtureDef = new PXFixtureDef();

		fixtureDef.density = ValueOrDefault(density, fixtureDef.density);
		fixtureDef.friction = ValueOrDefault(friction, fixtureDef.friction);
		fixtureDef.isSensor = ValueOrDefault(isSensor, fixtureDef.isSensor);
		fixtureDef.restitution = ValueOrDefault(restitution, fixtureDef.restitution);

		return fixtureDef;
	}

	createBody(descriptor) {

		// the ground is created with the body directly
		if (this.getIsGround()) {
			return descriptor;
		}

		var world = this.getWorld();
		var def = new PXBodyDef();

		def.type = this.type;

		this.tryCopyValue(descriptor, def, "active");
		this.tryCopyValue(descriptor, def, "allowSleep");
		this.tryCopyValue(descriptor, def, "angularDamping");
		this.tryCopyValue(descriptor, def, "angularVelocity");
		this.tryCopyValue(descriptor, def, "awake");
		this.tryCopyValue(descriptor, def, "bullet");
		this.tryCopyValue(descriptor, def, "fixedRotation");
		this.tryCopyValue(descriptor, def, "inertiaScale");
		this.tryCopyValue(descriptor, def, "linearDamping");

		if (descriptor.angle != null) {
			def.angle = EngineMath.degreesToRadians(descriptor.angle);
		}

		if (descriptor.linearVelocity != null) {
			def.linearVelocity.Set(descriptor.linearVelocity.x, descriptor.linearVelocity.y);
		}

		if (descriptor.position != null) {
			var units = this.toUnits([descriptor.position.x, descriptor.position.y]);

			def.position.Set(units[0], units[1]);
		}

		return world.CreateBody(def);
	}

	/**
	 Overloads:
	 - join(type)
	 - join(type, options)
	 - join(type, otherEntity)
	 - join(type, otherEntity, options)
	 **/

	join(type) {
		var def = null;
		var args = Array.prototype.slice.call(arguments, 1);

		switch (type) {
		case EntityJoinType.Distance:
			def = this.createDistanceJoint.apply(this, args);
			break;
		case EntityJoinType.Friction:
			def = this.createFrictionJoint.apply(this, args);
			break;
		case EntityJoinType.Gear:
			def = this.createGearJoint.apply(this, args);
			break;
		case EntityJoinType.Line:
			def = this.createLineJoint.apply(this, args);
			break;
		case EntityJoinType.Prismatic:
			def = this.createPrismaticJoint.apply(this, args);
			break;
		case EntityJoinType.Pulley:
			def = this.createPulleyJoint.apply(this, args);
			break;
		case EntityJoinType.Revolute:
			def = this.createRevoluteJoint.apply(this, args);
			break;
		case EntityJoinType.Weld:
			def = this.createWeldJoint.apply(this, args);
			break;
		}

		if (def == null) {
			throw new Error("Unable to create join from the specified type: (" + type + ")");
		}

		return this.controller.getWorld().CreateJoint(def);
	}

	createDistanceJoint() {
		var other = null;
		var options = null;

		if (arguments.length > 0) {
			if (arguments[0] instanceof Entity) {
				other = arguments[0];
			}

			if (arguments.length == 2) {
				options = arguments[1];
			}
		}

		if (other == null) {
			throw new Error("Distance Joint requires another body to join to.");
		}

		if (options == null) {
			options = {};
		}

		var b1 = this.body;
		var b2 = other.body;
		var def = new PXDistanceJointDef();

		options.anchorA = ValueOrDefault(options.anchorA, b1.GetWorldCenter());
		options.anchorB = ValueOrDefault(options.anchorB, b2.GetWorldCenter());

		def.bodyA = b1;
		def.bodyB = b2;
		def.collideConnected = ValueOrDefault(options.collideConnected, false);
		def.localAnchorA = ValueOrDefault(options.localAnchorA, b1.GetLocalPoint(options.anchorA));
		def.localAnchorB = ValueOrDefault(options.localAnchorB, b2.GetLocalPoint(options.anchorB));
		def.dampingRatio = ValueOrDefault(options.dampingRatio, 0.0);
		def.frequencyHz = ValueOrDefault(options.frequencyHz, 0.0);

		if (options.length == null) {
			var globalA = b1.GetWorldPoint(def.localAnchorA);
			var globalB = b2.GetWorldPoint(def.localAnchorB);
			var dx = globalB.x - globalA.x;
			var dy = globalB.y - globalA.y;

			def.length = Math.sqrt(dx * dx + dy * dy);
		}
		else {
			def.length = options.length;
		}

		return def;
	}

	createFrictionJoint() {
		var other = null;
		var options = null;

		if (arguments.length > 0) {
			if (arguments[0] instanceof Entity) {
				other = arguments[0];
			} else {
				options = arguments[0];
			}

			if (arguments.length == 2) {
				options = arguments[1];
			}
		}

		if (options == null) {
			options = {};
		}

		if (other == null) {
			other = {body: this.controller.getWorld().GetGroundBody()};
			options.collideConnected = ValueOrDefault(options.collideConnected, true);
		}

		var b1 = this.body;
		var b2 = other.body;
		var def = new PXFrictionJointDef();

		options.anchorA = ValueOrDefault(options.anchorA, b1.GetWorldCenter());
		options.anchorB = ValueOrDefault(options.anchorB, b2.GetWorldCenter());

		def.bodyA = b1;
		def.bodyB = b2;
		def.collideConnected = ValueOrDefault(options.collideConnected, false);
		def.localAnchorA = ValueOrDefault(options.localAnchorA, b1.GetLocalPoint(options.anchorA));
		def.localAnchorB = ValueOrDefault(options.localAnchorB, b2.GetLocalPoint(options.anchorB));
		def.maxForce = ValueOrDefault(options.maxForce, 0.0);
		def.maxTorque = ValueOrDefault(options.maxTorque, 0.0);

		return def;
	}

	createGearJoint() {
		var joint1 = null;
		var joint2 = null;
		var other = null;
		var options = null;

		if (arguments.length > 2) {
			if (arguments[0] instanceof Entity) {
				other = arguments[0];
			}

			joint1 = arguments[1];
			joint2 = arguments[2];

			if (arguments.length == 4) {
				options = arguments[3];
			}
		}

		if (other == null) {
			throw new Error("Gear Joint requires another body to join to.");
		}

		if (joint1 == null || joint2 == null) {
			throw new Error("Unable to create Gear Joint, both joints must not be null.");
		}

		if (joint1.GetType() != PXJoint.e_revoluteJoint && joint1.GetType() != PXJoint.e_prismaticJoint) {
			throw new Error("Unable to create Gear Joint, first joint must be either a revolute or prismatic joint.");
		}

		if (joint2.GetType() != PXJoint.e_revoluteJoint && joint2.GetType() != PXJoint.e_prismaticJoint) {
			throw new Error("Unable to create Gear Joint, second joint must be either a revolute or prismatic joint.");
		}

		if (options == null) {
			options = {};
		}

		var def = new PXGearJointDef();
		var b1 = this.body;
		var b2 = other.body;

		def.bodyA = b1;
		def.bodyB = b2;
		def.collideConnected = ValueOrDefault(options.collideConnected, false);
		def.joint1 = joint1;
		def.joint2 = joint2;
		def.ratio = ValueOrDefault(options.ratio, def.ratio);

		return def;
	}

	createLineJoint() {
		var other = null;
		var options = null;

		if (arguments.length > 0) {
			if (arguments[0] instanceof Entity) {
				other = arguments[0];
			} else {
				options = arguments[0];
			}

			if (arguments.length == 2) {
				options = arguments[1];
			}
		}

		if (options == null) {
			options = {};
		}

		if (other == null) {
			other = {body: this.controller.getWorld().GetGroundBody()};
			options.collideConnected = ValueOrDefault(options.collideConnected, true);
		}

		var b1 = this.body;
		var b2 = other.body;
		var def = new PXLineJointDef();

		options.anchorA = ValueOrDefault(options.anchorA, b1.GetWorldCenter());
		options.anchorB = ValueOrDefault(options.anchorB, b2.GetWorldCenter());

		def.bodyA = b1;
		def.bodyB = b2;
		def.collideConnected = ValueOrDefault(options.collideConnected, false);
		def.localAnchorA = ValueOrDefault(options.localAnchorA, b1.GetLocalPoint(options.anchorA));
		def.localAnchorB = ValueOrDefault(options.localAnchorB, b2.GetLocalPoint(options.anchorB));
		def.localAxisA = ValueOrDefault(options.localAxisA, (options.axis == null
			? new PXVector2D(1, 0)
			: b1.GetLocalVector(options.axis)));
		def.motorSpeed = ValueOrDefault(options.motorSpeed, 0.0);
		def.maxMotorForce = ValueOrDefault(options.maxMotorForce, 0.0);
		def.lowerTranslation = ValueOrDefault(options.lowerTranslation, 0.0);
		def.upperTranslation = ValueOrDefault(options.upperTranslation, 0.0);
		def.enableMotor = (def.motorSpeed != 0 || def.maxMotorForce != 0);
		def.enableLimit = (def.lowerTranslation != 0 || def.upperTranslation != 0);

		return def;
	}

	createPrismaticJoint() {
		var other = null;
		var options = null;

		if (arguments.length > 0) {
			if (arguments[0] instanceof Entity) {
				other = arguments[0];
			} else {
				options = arguments[0];
			}

			if (arguments.length == 2) {
				options = arguments[1];
			}
		}

		if (options == null) {
			options = {};
		}

		if (other == null) {
			other = {body: this.controller.getWorld().GetGroundBody()};
			options.collideConnected = ValueOrDefault(options.collideConnected, true);
		}

		var b1 = this.body;
		var b2 = other.body;
		var def = new PXPrismaticJointDef();

		options.anchorA = ValueOrDefault(options.anchorA, b1.GetWorldCenter());
		options.anchorB = ValueOrDefault(options.anchorB, b2.GetWorldCenter());

		def.bodyA = b1;
		def.bodyB = b2;
		def.collideConnected = ValueOrDefault(options.collideConnected, false);
		def.localAnchorA = ValueOrDefault(options.localAnchorA, b1.GetLocalPoint(options.anchorA));
		def.localAnchorB = ValueOrDefault(options.localAnchorB, b2.GetLocalPoint(options.anchorB));
		def.localAxisA = ValueOrDefault(options.localAxis, (options.axis == null
			? new PXVector2D(1, 0)
			: b1.GetLocalVector(options.axis)));
		def.motorSpeed = ValueOrDefault(options.motorSpeed, 0.0);
		def.maxMotorForce = ValueOrDefault(options.maxMotorForce, 0.0);
		def.lowerTranslation = ValueOrDefault(options.lowerTranslation, 0.0);
		def.upperTranslation = ValueOrDefault(options.upperTranslation, 0.0);
		def.referenceAngle = ValueOrDefault(options.referenceAngle, b2.GetAngle() - b1.GetAngle());
		def.enableMotor = (def.motorSpeed != 0 || def.maxMotorForce != 0);
		def.enableLimit = (def.lowerTranslation != 0 || def.upperTranslation != 0);

		return def;
	}

	createPulleyJoint() {
		var other = null;
		var options = null;

		if (arguments.length > 0) {
			if (arguments[0] instanceof Entity) {
				other = arguments[0];
			}

			if (arguments.length == 2) {
				options = arguments[1];
			}
		}

		if (other == null) {
			throw new Error("Pulley Joint requires another body to join to.");
		}

		if (options == null) {
			options = {};
		}

		var b1 = this.body;
		var b2 = other.body;
		var def = new PXPulleyJointDef();

		def.Initialize(
			b1, b2,
			ValueOrDefault(options.groundAnchorA, new PXVector2D(-1.0, 1.0)),
			ValueOrDefault(options.groundAnchorB, new PXVector2D(1.0, 1.0)),
			ValueOrDefault(options.anchorA, b1.GetWorldCenter()),
			ValueOrDefault(options.anchorB, b2.GetWorldCenter()),
			ValueOrDefault(options.ratio, 1));

		def.collideConnected = ValueOrDefault(options.collideConnected, false);
		def.localAnchorA = ValueOrDefault(options.localAnchorA, def.localAnchorA);
		def.localAnchorB = ValueOrDefault(options.localAnchorB, def.localAnchorB);
		def.lengthA = ValueOrDefault(options.lengthA, def.lengthA);
		def.lengthB = ValueOrDefault(options.lengthB, def.lengthB);
		def.maxLengthA = ValueOrDefault(options.maxLengthA, def.maxLengthA);
		def.maxLengthB = ValueOrDefault(options.maxLengthB, def.maxLengthB);
		def.ratio = ValueOrDefault(options.ratio, def.ratio);

		return def;
	}

	createRevoluteJoint() {
		var other = null;
		var options = null;

		if (arguments.length > 0) {
			if (arguments[0] instanceof Entity) {
				other = arguments[0];
			} else {
				options = arguments[0];
			}

			if (arguments.length == 2) {
				options = arguments[1];
			}
		}

		if (options == null) {
			options = {};
		}

		if (other == null) {
			other = {
				body: this.controller.getWorld().GetGroundBody()
			};
			options.collideConnected = ValueOrDefault(options.collideConnected, true);
		}

		var b1 = this.body;
		var b2 = other.body;
		var def = new PXRevoluteJointDef();

		options.anchor = ValueOrDefault(options.anchor, b1.GetWorldCenter());

		def.bodyA = b1;
		def.bodyB = b2;
		def.collideConnected = ValueOrDefault(options.collideConnected, false);
		def.localAnchorA = ValueOrDefault(options.localAnchorA, b1.GetLocalPoint(options.anchor));
		def.localAnchorB = ValueOrDefault(options.localAnchorB, b2.GetLocalPoint(options.anchor));
		def.motorSpeed = ValueOrDefault(options.motorSpeed, 0.0);
		def.maxMotorTorque = ValueOrDefault(options.maxMotorTorque, 0.0);
		def.lowerAngle = ValueOrDefault(options.lowerAngle, 0.0);
		def.upperAngle = ValueOrDefault(options.upperAngle, 0.0);
		def.referenceAngle = ValueOrDefault(options.referenceAngle, b2.GetAngle() - b1.GetAngle());
		def.enableMotor = (def.motorSpeed != 0 || def.maxMotorTorque != 0);
		def.enableLimit = (def.lowerAngle != 0 || def.upperAngle != 0);

		return def;
	}

	createWeldJoint() {
		var other = null;
		var options = null;

		if (arguments.length > 0) {
			if (arguments[0] instanceof Entity) {
				other = arguments[0];
			}

			if (arguments.length == 2) {
				options = arguments[1];
			}
		}

		if (other == null) {
			throw new Error("Weld Joint requires another body to join to.");
		}

		if (options == null) {
			options = {};
		}

		var b1 = this.body;
		var b2 = other.body;
		var def = new PXWeldJointDef();

		options.anchor = ValueOrDefault(options.anchor, b1.GetWorldCenter());

		def.bodyA = b1;
		def.bodyB = b2;
		def.collideConnected = ValueOrDefault(options.collideConnected, false);
		def.localAnchorA = ValueOrDefault(options.localAnchorA, b1.GetLocalPoint(options.anchor));
		def.localAnchorB = ValueOrDefault(options.localAnchorB, b2.GetLocalPoint(options.anchor));
		def.referenceAngle = ValueOrDefault(options.referenceAngle, b2.GetAngle() - b1.GetAngle());

		return def;
	}

	toGlobalPoint(localPoint, isUnits, asUnits) {
		isUnits = ValueOrDefault(isUnits, false);
		asUnits = ValueOrDefault(asUnits, false);

		return this.convertPoint(
			this.body.GetWorldPoint(this.convertPoint(localPoint, isUnits, true, false)), true, asUnits);
	}

	toGlobalVector(localVector) {
		return this.convertPoint(this.body.GetWorldVector(localVector), true, true);
	}

	toLocalPoint(globalPoint, isUnits, asUnits) {
		isUnits = ValueOrDefault(isUnits, false);
		asUnits = ValueOrDefault(asUnits, false);

		return this.convertPoint(
			this.body.GetLocalPoint(this.convertPoint(globalPoint, isUnits, true, false)), true, asUnits);
	}

	toLocalVector(globalVector) {
		return this.convertPoint(this.body.GetLocalVector(globalVector), true, true);
	}

	getLinearVelocityFromGlobalPoint(globalPoint, isUnits) {
		isUnits = ValueOrDefault(isUnits, false);

		return this.convertPoint(
			this.body.GetLinearVelocityFromWorldPoint(this.convertPoint(globalPoint, isUnits, true, false)), true, true);
	}

	getLinearVelocityFromLocalPoint(localPoint, isUnits) {
		isUnits = ValueOrDefault(isUnits, false);

		return this.convertPoint(
			this.body.GetLinearVelocityFromLocalPoint(this.convertPoint(localPoint, isUnits, true, false)), true, true);
	}

	getMoveSpeedIndex(direction) {
		switch (direction) {
		case Direction.East:
			return 0;
		case Direction.West:
			return 1;
		case Direction.North:
			return 2;
		case Direction.South:
			return 3;
		}

		return -1;
	}

	tryCopyValue(from, to, name) {
		if (from[name] != null) {
			to[name] = from[name];
		}
	}

	static createStatic(name, objectType, objectParams, descriptor, controller) {
		if (objectParams == null) {
			return new objectType(EntityType.Static, name, descriptor, controller);
		}

		return new objectType(objectParams, EntityType.Static, name, descriptor, controller);
	}

	static createKinematic(name, objectType, objectParams, descriptor, controller) {
		if (objectParams == null) {
			return new objectType(EntityType.Kinematic, name, descriptor, controller);
		}

		return new objectType(objectParams, EntityType.Kinematic, name, descriptor, controller);
	}

	createDynamic(name, objectType, objectParams, descriptor, controller) {
		if (objectParams == null) {
			return new objectType(EntityType.Dynamic, name, descriptor, controller);
		}

		return new objectType(objectParams, EntityType.Dynamic, name, descriptor, controller);
	}
}

Entity.TANGENT_LENGTH = 0.55192;
Entity.ELLIPSE_SEGMENTS_PER_UNIT = 12;

export default Entity;

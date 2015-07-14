MoEntity = Class.create(MoEntityBase, {
	initialize : function($super, type, name, descriptor, controller) {
		$super(name, controller);

		this.type = type;
		this.gravityScale = 0;
		this.moveSpeeds = [4, 4, 4, 4];
		this.currentMoveSpeed = MoVector2D.Zero();
		this.currentMovement = MoDirection.None;
		this.isMoving = false;
		this.preSolveCallback = null;
		this.postSolveCallback = null;
		this.body = this.createBody(descriptor);
		this.body.SetUserData(this);
	},

	setPreSolveCallback : function(value) {
		this.preSolveCallback = value;
	},
	
	setPostSolveCallback : function(value) {
		this.postSolveCallback = value;
	},

	getType : function() {
		return this.type;
	},
	
	getBody : function() {
		return this.body;
	},
	
	getIsGround : function() {
		return (this.type == MoEntityType.Ground);
	},
	
	getIsBullet : function() {
		return this.body.IsBullet();
	},
	
	setIsBullet : function(value) {
		this.body.SetBullet(value);
	},
	
	getIsAwake : function() {
		return this.body.IsAwake();
	},
	
	setIsAwake : function(value) {
		this.body.SetAwake(value);
	},
	
	getIsActive : function() {
		return this.body.IsActive();
	},
	
	setIsActive : function(value) {
		this.body.SetActive(value);
	},
	
	getCanSleep : function() {
		return this.body.IsSleepingAllowed();
	},
	
	setCanSleep : function(value) {
		this.body.SetSleepingAllowed(value);
	},

	getGravityScale : function() {
		return this.gravityScale;
	},
	
	setGravityScale : function(value) {
		this.gravityScale = value;
	},
	
	getEnableRotation : function() {
		return !this.body.IsFixedRotation();
	},
	
	setEnableRotation : function(value) {
		this.body.SetFixedRotation(!value);
	},
	
	getLocalCenterImpl : function(asUnits) {
		var center = this.body.GetLocalCenter();

		return this.convertPoint(center, true, asUnits);
	},
	
	getGlobalCenterImpl : function(asUnits) {
		var center = this.body.GetWorldCenter();
		
		return this.convertPoint(center, true, asUnits);
	},
	
	getPositionImpl : function(asUnits) {
		var pos = this.body.GetPosition();
		
		return this.convertPoint(pos, true, asUnits);
	},
	
	setPositionImpl : function(value, isUnits) {
		var pos = this.body.GetPosition();

		if(isUnits)
		{
			pos.x = value.x;
			pos.y = value.y;
		}
		else
		{
			var arr = this.toUnits([value.x, value.y]);
			
			pos.x = arr[0];
			pos.y = arr[1];
		}

		this.body.SetPosition(pos);
	},
	
	getAngleImpl : function(asRadians) {
		var angle = this.body.GetAngle();
		
		if(asRadians)
			return angle;

		return MoMath.radiansToDegrees(angle);
	},
	
	setAngleImpl : function(value, isRadians) {
		if(!isRadians)
			value = MoMath.degreesToRadians(value);

		this.body.SetAngle(value);
	},
	
	getLinearVelocity : function() {
		 var v = this.body.GetLinearVelocity();
		 
		 return new MoVector2D(v.x, v.y);
	},
	
	setLinearVelocity : function(value) {
		this.body.SetLinearVelocity(new PXVector2D(value.x, value.y));
	},
	
	getAngularVelocity : function() {
		return this.body.GetAngularVelocity();
	},
	
	setAngularVelocity : function(value) {
		this.body.SetAngularVelocity(value);
	},
	
	getMass : function() {
		return this.body.GetMass();
	},
	
	getInertia : function() {
		return this.body.GetInertia();
	},
	
	getLinearDamping : function() {
		return this.body.GetLinearDamping();
	},
	
	setLinearDamping : function(value) {
		this.body.SetLinearDamping(value);
	},
	
	getAngularDamping : function() {
		return this.body.GetAngularDamping();
	},
	
	setAngularDamping : function(value) {
		this.body.SetAngularDamping(value);
	},
	
	getWorld : function() {
		return this.controller.getWorld();
	},
	
	getNext : function() {
		var nextBody = this.body.GetNext();
		
		// return the entity
		if(!MoIsNull(nextBody))
			return nextBody.GetUserData();
			
		return null;
	},
	
	getBoundsImpl : function(asUnits, asAABB) {		
		if(asAABB)
		{
			var bounds = MoRectangle.Zero();
			
			for(var fixture = this.body.GetFixtureList(); fixture; fixture = fixture.GetNext())
				bounds.unionWithRect(fixture.GetUserData().getBounds(asUnits, asAABB));

			return bounds;
		}
	},
	
	getMassData : function() {
		var data = new PXMassData();
		
		this.body.GetMassData(data);
		
		return data;
	},
	
	setMassData : function(value) {
		this.body.SetMassData(value);
	},
	
	resetMassData : function() {
		this.body.ResetMassData();
	},
	
	getMoveSpeed : function(direction) {
		if(direction == MoDirection.EastWest || direction == MoDirection.All)
			return this.moveSpeeds[this.getMoveSpeedIndex(MoDirection.East)];
		else if(direction == MoDirection.NorthSouth)
			return this.moveSpeeds[this.getMoveSpeedIndex(MoDirection.North)];
		else
			return this.moveSpeeds[this.getMoveSpeedIndex(direction)];
	},
	
	setMoveSpeed : function(direction, speed) {
		if(direction == MoDirection.EastWest)
		{
			this.moveSpeeds[this.getMoveSpeedIndex(MoDirection.East)] = speed;
			this.moveSpeeds[this.getMoveSpeedIndex(MoDirection.West)] = speed;
		}
		else if(direction == MoDirection.NorthSouth)
		{
			this.moveSpeeds[this.getMoveSpeedIndex(MoDirection.North)] = speed;
			this.moveSpeeds[this.getMoveSpeedIndex(MoDirection.South)] = speed;
		}
		else if(direction == MoDirection.All)
		{
			this.moveSpeeds[this.getMoveSpeedIndex(MoDirection.East)] = speed;
			this.moveSpeeds[this.getMoveSpeedIndex(MoDirection.West)] = speed;
			this.moveSpeeds[this.getMoveSpeedIndex(MoDirection.North)] = speed;
			this.moveSpeeds[this.getMoveSpeedIndex(MoDirection.South)] = speed;		
		}
		else
		{
			this.moveSpeeds[this.getMoveSpeedIndex(direction)] = speed;
		}
	},

	destroy : function($super) {		
		var isDestroyed = this.isDestroyed;
		
		$super();

		if(!isDestroyed)
		{
			// just remove any entity fixtures, the internal fixture will be destroyed when
			// the body is destroyed
			for(var fixture = this.body.GetFixtureList(); fixture; fixture = fixture.GetNext())
				this.controller.removeEntity(fixture.GetUserData(), true);
		}
	},
	
	applyForce : function(fx, fy) {
		this.applyForceAtImpl(fx, fy, this.body.GetWorldCenter());
	},
	
	applyForceAt : function(fx, fy, x, y, isUnits) {
		var units = (MoValueOrDefault(isUnits, false) ? [x, y] : this.toUnits([x, y]));
	
		this.applyForceAtImpl(fx, fy, new PXVector2D(units[0], units[1]));
	},
	
	applyForceAtImpl : function(fx, fy, point) {
		this.body.ApplyForce(new PXVector2D(fx, fy), point);
	},
	
	applyImpulse : function(ix, iy) {
		this.applyImpulseAtImpl(ix, iy, this.body.GetWorldCenter());
	},
	
	applyImpulseAt : function(ix, iy, x, y, isUnits) {
		var units = (MoValueOrDefault(isUnits, false) ? [x, y] : this.toUnits([x, y]));

		this.applyImpulseAtImpl(ix, iy, new PXVector2D(units[0], units[1]));
	},

	applyImpulseAtImpl : function(ix, iy, point) {
		this.body.ApplyImpulse(new PXVector2D(ix, iy), point);
	},
	
	applyTorque : function(torque) {
		this.body.ApplyTorque(torque);
	},
	
	stop : function() {
		this.currentMovement = MoDirection.None;
		this.currentMoveSpeed.x = 0;
		this.currentMoveSpeed.y = 0;
	},
	
	/*
	 * - move(direction)
	 * - move(xSpeed, ySpeed)
	 */
	move : function() {
		if(arguments.length == 1)
		{
			this.currentMovement = arguments[0];
			this.currentMoveSpeed.x = 0;
			this.currentMoveSpeed.y = 0;
		}
		else if(arguments.length == 2)
		{
			this.currentMovement = MoDirection.Variable;
			this.currentMoveSpeed.x = arguments[0];
			this.currentMoveSpeed.y = arguments[1];
		}
		
		this.isMoving = true;
	},
	
	moveNow : function(rx, ry) {
		var body = this.body;
		var pos = body.GetPosition();
		var mass = body.GetMass();
		var vel = body.GetLinearVelocity();
		
		this.applyImpulseAt(
			(rx == 0 ? 0 : mass * (rx - vel.x)), 
			(ry == 0 ? 0 : mass * (ry - vel.y)),
			pos.x, pos.y, true);
	},
	
	wakeup : function() {
		this.setIsAwake(true);
	},
	
	sleep : function() {
		this.setIsAwake(false);
	},

	reset : function() {
		this.resetDrawable(this.body.GetPosition(), new PXVector2D(0,0), this.body.GetAngle());
	},

	update : function(ratio) {
		var body = this.body;
		var vel = body.GetLinearVelocity();
		
		// apply gravity scaling
		if(this.gravityScale != 0)
		{
			var gravity = this.controller.getWorld().GetGravity();
			var m = body.GetMass();

			this.applyForce(
				(gravity.x * m) * this.gravityScale, 
				(gravity.y * m) * this.gravityScale);
		}
		
		// apply movements
		if(this.currentMovement != MoDirection.None || (this.isMoving && this.type == MoEntityType.Kinematic && (vel.x != 0 || vel.y != 0)) )
		{
			var mass = body.GetMass();
			var pos = body.GetPosition();
			var sx = 0;
			var sy = 0;
			var vx = 0;
			var vy = 0;
			
			if(this.currentMovement == MoDirection.Variable)
			{
				var hDir = (this.currentMoveSpeed.x > 0 ? MoDirection.East : MoDirection.West);
				var vDir = (this.currentMoveSpeed.y > 0 ? MoDirection.South : MoDirection.North);
				
				sx = this.getMoveSpeed(hDir) * this.currentMoveSpeed.x;
				sy = this.getMoveSpeed(vDir) * this.currentMoveSpeed.y;
			}
			else
			{
				// move north
				if((this.currentMovement & MoDirection.North) != MoDirection.None)
					sy += -this.getMoveSpeed(MoDirection.North);
					
				// move south
				if((this.currentMovement & MoDirection.South) != MoDirection.None)
					sy += this.getMoveSpeed(MoDirection.South);

				// move east
				if((this.currentMovement & MoDirection.East) != MoDirection.None)
					sx += this.getMoveSpeed(MoDirection.East);

				// move west
				if((this.currentMovement & MoDirection.West) != MoDirection.None)
					sx += -this.getMoveSpeed(MoDirection.West);
			}
			
			this.wakeup();
			
			if(this.type == MoEntityType.Kinematic)
			{
				sx = (sx != 0 ? (sx) : 0);
				sy = (sy != 0 ? (sy) : 0);
				
				this.isMoving = (this.isMoving && sx != 0 && sy != 0);
				this.setLinearVelocity(new MoVector2D(sx, sy));
			}
			else
			{
				sx = (sx != 0 ? mass * (sx - vel.x) : 0);
				sy = (sy != 0 ? mass * (sy - vel.y) : 0);
			
				this.applyImpulseAt(sx, sy, pos.x, pos.y, true);
			}
		}
		
		// update drawable
		this.updateDrawable(ratio, this.body.GetPosition(), new PXVector2D(0,0), this.body.GetAngle());
	},

	createPoly : function(name, vertices, density, friction, restitution, isSensor) {
		var def = this.createFixtureDef(density, friction, restitution, isSensor);
		var len = vertices.length;
		var v = null;

		for(var i = 0; i < len; ++i)
		{
			v = this.toUnits([vertices[i].x, vertices[i].y]);
			vertices[i] = new PXVector2D(v[0], v[1]);
		}

		def.shape = new PXPolygonShape();
		def.shape.SetAsVector(vertices, vertices.length);

		return new MoEntityFixture(name, this.body.CreateFixture(def), this.controller);
	},

	createBorder : function(name, width, height, size, density, friction, restitution, isSensor) {
		return createBorderAt(name, 0, 0, width, height, size, density, friction, restitution, isSensor);
	},

	createBorderAt : function(name, x, y, width, height, size, density, friction, restitution, isSensor) {
		var hw = width * 0.5;
		var hh = height * 0.5;
		var hs = size * 0.5;
		var top = 	 this.createBoxAt(name + "-t", x + hw, y + hs, width, size, density, friction, restitution, isSensor);
		var bottom = this.createBoxAt(name + "-b", x + hw, y + height - hs, width, size, density, friction, restitution, isSensor);
		var left = 	 this.createBoxAt(name + "-l", x + hs, y + hh, size, height, density, friction, restitution, isSensor);
		var right =  this.createBoxAt(name + "-r", x + width - hs, y + hh, size, height, density, friction, restitution, isSensor);

		return [top, left, bottom, right];
	},

	createBox : function(name, width, height, density, friction, restitution, isSensor) {
		var def = this.createFixtureDef(density, friction, restitution, isSensor);
		var units = this.toUnits([width, height]);
		
		def.shape = new PXPolygonShape();
		def.shape.SetAsBox(units[0] * 0.5, units[1] * 0.5);

		return new MoEntityFixture(name, this.body.CreateFixture(def), this.controller);
	},
	
	createBoxAt : function(name, x, y, width, height, density, friction, restitution, isSensor) {
		var hw = width * 0.5;
		var hh = height * 0.5;
	
		var vertices = [
			new PXVector2D(x + -hw, y + -hh),
			new PXVector2D(x + hw, y + -hh),
			new PXVector2D(x + hw, y + hh),
			new PXVector2D(x + -hw, y + hh)
		];
		
		return this.createPoly(name, vertices, density, friction, restitution, isSensor);
	},
	
	createEdge : function(name, x1, y1, x2, y2, density, friction, restitution, isSensor) {
		var def = this.createFixtureDef(density, friction, restitution, isSensor);
		var units = this.toUnits([x1, y1, x2, y2]);
		
		def.shape = new PXPolygonShape();
		def.shape.SetAsEdge(new PXVector2D(units[0], units[1]), new PXVector2D(units[2], units[3]));

		return new MoEntityFixture(name, this.body.CreateFixture(def), this.controller);
	},

	createCircle : function(name, size, density, friction, restitution, isSensor) {
		return this.createCircleAt(name, 0, 0, size, density, friction, restitution, isSensor);
	},
	
	createCircleAt : function(name, x, y, size, density, friction, restitution, isSensor) {
		var def = this.createFixtureDef(density, friction, restitution, isSensor);
		var units = this.toUnits([x, y, size]);

		def.shape = new PXCircleShape(units[2] * 0.5);
		def.shape.SetLocalPosition(new PXVector2D(units[0], units[1]));

		return new MoEntityFixture(name, this.body.CreateFixture(def), this.controller);
	},
	
	createEllipse : function(name, width, height, quality, density, friction, restitution, isSensor) {
		return this.createEllipseAt(name, 0, 0, width, height, quality, density, friction, restitution, isSensor);
	},

	createEllipseAt : function(name, x, y, width, height, quality, density, friction, restitution, isSensor) {
		var vertices = [];
		var rx = width * 0.5;
		var ry = height * 0.5;
		var cx = x + rx;
		var cy = y + ry;

		// compute an approximate number of segments based on a quality and the size
		var segs = Math.round(MoEntity.ELLIPSE_SEGMENTS_PER_UNIT * quality);

		// create each quadrant
		this.createCurve(vertices, segs, cx + rx, cy, cx, cy - ry, cx + rx, cy - MoEntity.TANGENT_LENGTH * ry, cx + MoEntity.TANGENT_LENGTH * rx, cy - ry);
		this.createCurve(vertices, segs, cx, cy - ry, cx - rx, cy, cx - MoEntity.TANGENT_LENGTH * rx, cy - ry, cx - rx, cy - MoEntity.TANGENT_LENGTH * ry);
		this.createCurve(vertices, segs, cx - rx, cy, cx, cy + ry, cx - rx, cy + MoEntity.TANGENT_LENGTH * ry, cx - MoEntity.TANGENT_LENGTH * rx, cy + ry);
		this.createCurve(vertices, segs, cx, cy + ry, cx + rx, cy, cx + MoEntity.TANGENT_LENGTH * rx, cy + ry, cx + rx, cy + MoEntity.TANGENT_LENGTH * ry);

		// create the elliptical polygon
		return this.createPoly(name, vertices, density, friction, restitution, isSensor);
	},
	
	createCurve : function(vertices, segmentCount, x1, y1, x2, y2, cpx1, cpy1, cpx2, cpy2) {
		var vx = 0;
		var vy = 0;
		var inc = 1.0 / segmentCount;
		var t = 0;

		// generate the segments to form the curve
		for(var i = 0; i < segmentCount; i++)
		{
			t = i * inc;

			// compute the curve vertex
			vx = Math.pow((1 - t), 3) * x1 + 3 * t * Math.pow((1 - t), 2) * cpx1 + 3 * Math.pow(t, 2) * (1 - t) * cpx2 + Math.pow(t, 3) * x2;
			vy = Math.pow((1 - t), 3) * y1 + 3 * t * Math.pow((1 - t), 2) * cpy1 + 3 * Math.pow(t, 2) * (1 - t) * cpy2 + Math.pow(t, 3) * y2;
			
			// need to reverse the order, box2d is CCW
			vertices.unshift(new PXVector2D(vx, vy));
		}
	},

	createFixtureDef : function(density, friction, restitution, isSensor) {
		var fixtureDef = new PXFixtureDef();
		
		fixtureDef.density = MoValueOrDefault(density, fixtureDef.density);
		fixtureDef.friction = MoValueOrDefault(friction, fixtureDef.friction);
		fixtureDef.isSensor = MoValueOrDefault(isSensor, fixtureDef.isSensor);
		fixtureDef.restitution = MoValueOrDefault(restitution, fixtureDef.restitution);

		return fixtureDef;
	},

	createBody : function(descriptor) {

		// the ground is created with the body directly
		if(this.getIsGround())
			return descriptor;

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

		if(!MoIsNull(descriptor.angle))
			def.angle = MoMath.degreesToRadians(descriptor.angle);
		
		if(!MoIsNull(descriptor.linearVelocity))
			def.linearVelocity.Set(descriptor.linearVelocity.x, descriptor.linearVelocity.y);

		if(!MoIsNull(descriptor.position))
		{
			var units = this.toUnits([descriptor.position.x, descriptor.position.y]);
			
			def.position.Set(units[0], units[1]);
		}

		return world.CreateBody(def);
	},
	
	/**
		Overloads:
			- join(type)
			- join(type, options)
			- join(type, otherEntity)
			- join(type, otherEntity, options) 
	**/

	join : function(type) {
		var def = null;
		var args = Array.prototype.slice.call(arguments, 1);

		switch(type)
		{
			case MoEntityJoinType.Distance:
				def = this.createDistanceJoint.apply(this, args);
				break;
			case MoEntityJoinType.Friction:
				def = this.createFrictionJoint.apply(this, args);
				break;
			case MoEntityJoinType.Gear:
				def = this.createGearJoint.apply(this, args);
				break;
			case MoEntityJoinType.Line:
				def = this.createLineJoint.apply(this, args);
				break;
			case MoEntityJoinType.Prismatic:
				def = this.createPrismaticJoint.apply(this, args);
				break;
			case MoEntityJoinType.Pulley:
				def = this.createPulleyJoint.apply(this, args);
				break;
			case MoEntityJoinType.Revolute:
				def = this.createRevoluteJoint.apply(this, args);
				break;
			case MoEntityJoinType.Weld:
				def = this.createWeldJoint.apply(this, args);
				break;
		}

		if(def == null)
			throw new Error("Unable to create join from the specified type: (" + type + ")");

		return this.controller.getWorld().CreateJoint(def);
	},
	
	createDistanceJoint : function() {
		var other = null;
		var options = null;
		
		if(arguments.length > 0)
		{
			if(arguments[0] instanceof MoEntity)
				other = arguments[0];

			if(arguments.length == 2)
				options = arguments[1];
		}

		if(other == null)
			throw new Error("Distance Joint requires another body to join to.");

		if(options == null)
			options = {};

		var b1 = this.body;
		var b2 = other.body;
		var def = new PXDistanceJointDef();

		options.anchorA = MoValueOrDefault(options.anchorA, b1.GetWorldCenter());
		options.anchorB = MoValueOrDefault(options.anchorB, b2.GetWorldCenter());

		def.bodyA = b1;
		def.bodyB = b2;
		def.collideConnected = MoValueOrDefault(options.collideConnected, false);
		def.localAnchorA = MoValueOrDefault(options.localAnchorA, b1.GetLocalPoint(options.anchorA));
		def.localAnchorB = MoValueOrDefault(options.localAnchorB, b2.GetLocalPoint(options.anchorB));
		def.dampingRatio = MoValueOrDefault(options.dampingRatio, 0.0);
		def.frequencyHz = MoValueOrDefault(options.frequencyHz, 0.0);

		if(MoIsNull(options.length))
		{
			var globalA = b1.GetWorldPoint(def.localAnchorA);
			var globalB = b2.GetWorldPoint(def.localAnchorB);
			var dx = globalB.x - globalA.x;
			var dy = globalB.y - globalA.y;

			def.length = Math.sqrt(dx * dx + dy * dy);
		}
		else
		{
			def.length = options.length;
		}

		return def;
	},
	
	createFrictionJoint : function() {
		var other = null;
		var options = null;
		
		if(arguments.length > 0)
		{
			if(arguments[0] instanceof MoEntity)
				other = arguments[0];
			else
				options = arguments[0];
			
			if(arguments.length == 2)
				options = arguments[1];
		}
		
		if(options == null)
			options = {};
		
		if(other == null)
		{
			other = {body:this.controller.getWorld().GetGroundBody()};
			options.collideConnected = MoValueOrDefault(options.collideConnected, true);
		}
			
		var b1 = this.body;
		var b2 = other.body;
		var def = new PXFrictionJointDef();

		options.anchorA = MoValueOrDefault(options.anchorA, b1.GetWorldCenter());
		options.anchorB = MoValueOrDefault(options.anchorB, b2.GetWorldCenter());

		def.bodyA = b1;
		def.bodyB = b2;
		def.collideConnected = MoValueOrDefault(options.collideConnected, false);
		def.localAnchorA = MoValueOrDefault(options.localAnchorA, b1.GetLocalPoint(options.anchorA));
		def.localAnchorB = MoValueOrDefault(options.localAnchorB, b2.GetLocalPoint(options.anchorB));
		def.maxForce = MoValueOrDefault(options.maxForce, 0.0);
		def.maxTorque = MoValueOrDefault(options.maxTorque, 0.0);

		return def;
	},
	
	createGearJoint : function() {
		var joint1 = null;
		var joint2 = null;
		var other = null;
		var options = null;
		
		if(arguments.length > 2)
		{
			if(arguments[0] instanceof MoEntity)
				other = arguments[0];
			
			joint1 = arguments[1];
			joint2 = arguments[2];

			if(arguments.length == 4)
				options = arguments[3];
		}
		
		if(other == null)
			throw new Error("Gear Joint requires another body to join to.");

		if(joint1 == null || joint2 == null)
			throw new Error("Unable to create Gear Joint, both joints must not be null.");
			
		if(joint1.GetType() != PXJoint.e_revoluteJoint && joint1.GetType() != PXJoint.e_prismaticJoint)
			throw new Error("Unable to create Gear Joint, first joint must be either a revolute or prismatic joint.");
			
		if(joint2.GetType() != PXJoint.e_revoluteJoint && joint2.GetType() != PXJoint.e_prismaticJoint)
			throw new Error("Unable to create Gear Joint, second joint must be either a revolute or prismatic joint.");
	
		if(options == null)
			options = {};
	
		var def = new PXGearJointDef();
		var b1 = this.body;
		var b2 = other.body;

		def.bodyA = b1;
		def.bodyB = b2;
		def.collideConnected = MoValueOrDefault(options.collideConnected, false);
		def.joint1 = joint1;
		def.joint2 = joint2;
		def.ratio = MoValueOrDefault(options.ratio, def.ratio);

		return def;
	},
	
	createLineJoint : function() {
		var other = null;
		var options = null;
		
		if(arguments.length > 0)
		{
			if(arguments[0] instanceof MoEntity)
				other = arguments[0];
			else
				options = arguments[0];
			
			if(arguments.length == 2)
				options = arguments[1];
		}
		
		if(options == null)
			options = {};
		
		if(other == null)
		{
			other = {body:this.controller.getWorld().GetGroundBody()};
			options.collideConnected = MoValueOrDefault(options.collideConnected, true);
		}
			
		var b1 = this.body;
		var b2 = other.body;
		var def = new PXLineJointDef();
		
		options.anchorA = MoValueOrDefault(options.anchorA, b1.GetWorldCenter());
		options.anchorB = MoValueOrDefault(options.anchorB, b2.GetWorldCenter());
		
		def.bodyA = b1;
		def.bodyB = b2;
		def.collideConnected = MoValueOrDefault(options.collideConnected, false);
		def.localAnchorA = MoValueOrDefault(options.localAnchorA, b1.GetLocalPoint(options.anchorA));
		def.localAnchorB = MoValueOrDefault(options.localAnchorB, b2.GetLocalPoint(options.anchorB));
		def.localAxisA = MoValueOrDefault(options.localAxisA, (options.axis == null ? new PXVector2D(1, 0) : b1.GetLocalVector(options.axis)));
		def.motorSpeed = MoValueOrDefault(options.motorSpeed, 0.0);
		def.maxMotorForce = MoValueOrDefault(options.maxMotorForce, 0.0);
		def.lowerTranslation = MoValueOrDefault(options.lowerTranslation, 0.0);
		def.upperTranslation = MoValueOrDefault(options.upperTranslation, 0.0);
		def.enableMotor = (def.motorSpeed != 0 || def.maxMotorForce != 0);
		def.enableLimit = (def.lowerTranslation != 0 || def.upperTranslation != 0);

		return def;
	},
	
	createPrismaticJoint : function() {
		var other = null;
		var options = null;
		
		if(arguments.length > 0)
		{
			if(arguments[0] instanceof MoEntity)
				other = arguments[0];
			else
				options = arguments[0];
			
			if(arguments.length == 2)
				options = arguments[1];
		}
		
		if(options == null)
			options = {};
		
		if(other == null)
		{
			other = {body:this.controller.getWorld().GetGroundBody()};
			options.collideConnected = MoValueOrDefault(options.collideConnected, true);
		}
			
		var b1 = this.body;
		var b2 = other.body;
		var def = new PXPrismaticJointDef();
		
		options.anchorA = MoValueOrDefault(options.anchorA, b1.GetWorldCenter());
		options.anchorB = MoValueOrDefault(options.anchorB, b2.GetWorldCenter());

		def.bodyA = b1;
		def.bodyB = b2;
		def.collideConnected = MoValueOrDefault(options.collideConnected, false);
		def.localAnchorA = MoValueOrDefault(options.localAnchorA, b1.GetLocalPoint(options.anchorA));
		def.localAnchorB = MoValueOrDefault(options.localAnchorB, b2.GetLocalPoint(options.anchorB));
		def.localAxisA = MoValueOrDefault(options.localAxis, (options.axis == null ? new PXVector2D(1, 0) : b1.GetLocalVector(options.axis)));
		def.motorSpeed = MoValueOrDefault(options.motorSpeed, 0.0);
		def.maxMotorForce = MoValueOrDefault(options.maxMotorForce, 0.0);
		def.lowerTranslation = MoValueOrDefault(options.lowerTranslation, 0.0);
		def.upperTranslation = MoValueOrDefault(options.upperTranslation, 0.0);
		def.referenceAngle = MoValueOrDefault(options.referenceAngle, b2.GetAngle() - b1.GetAngle());
		def.enableMotor = (def.motorSpeed != 0 || def.maxMotorForce != 0);
		def.enableLimit = (def.lowerTranslation != 0 || def.upperTranslation != 0);

		return def;
	},
	
	createPulleyJoint : function() {
		var other = null;
		var options = null;
		
		if(arguments.length > 0)
		{
			if(arguments[0] instanceof MoEntity)
				other = arguments[0];

			if(arguments.length == 2)
				options = arguments[1];
		}
		
		if(other == null)
			throw new Error("Pulley Joint requires another body to join to.");
			
		if(options == null)
			options = {};
			
		var b1 = this.body;
		var b2 = other.body;
		var def = new PXPulleyJointDef();

		def.Initialize(
			b1, b2, 
			MoValueOrDefault(options.groundAnchorA, new PXVector2D(-1.0, 1.0)),
			MoValueOrDefault(options.groundAnchorB, new PXVector2D( 1.0, 1.0)),
			MoValueOrDefault(options.anchorA, b1.GetWorldCenter()),
			MoValueOrDefault(options.anchorB, b2.GetWorldCenter()),
			MoValueOrDefault(options.ratio, 1));
		
		def.collideConnected = MoValueOrDefault(options.collideConnected, false);
		def.localAnchorA = MoValueOrDefault(options.localAnchorA, def.localAnchorA);
		def.localAnchorB = MoValueOrDefault(options.localAnchorB, def.localAnchorB);
		def.lengthA = MoValueOrDefault(options.lengthA, def.lengthA);
		def.lengthB = MoValueOrDefault(options.lengthB, def.lengthB);
		def.maxLengthA = MoValueOrDefault(options.maxLengthA, def.maxLengthA);
		def.maxLengthB = MoValueOrDefault(options.maxLengthB, def.maxLengthB);
		def.ratio = MoValueOrDefault(options.ratio, def.ratio);
		
		return def;
	},
	
	createRevoluteJoint : function() {
		var other = null;
		var options = null;
		
		if(arguments.length > 0)
		{
			if(arguments[0] instanceof MoEntity)
				other = arguments[0];
			else
				options = arguments[0];
			
			if(arguments.length == 2)
				options = arguments[1];
		}
		
		if(options == null)
			options = {};
		
		if(other == null)
		{
			other = {body:this.controller.getWorld().GetGroundBody()};
			options.collideConnected = MoValueOrDefault(options.collideConnected, true);
		}
			
		var b1 = this.body;
		var b2 = other.body;
		var def = new PXRevoluteJointDef();
		
		options.anchor = MoValueOrDefault(options.anchor, b1.GetWorldCenter());

		def.bodyA = b1;
		def.bodyB = b2;
		def.collideConnected = MoValueOrDefault(options.collideConnected, false);
		def.localAnchorA = MoValueOrDefault(options.localAnchorA, b1.GetLocalPoint(options.anchor));
		def.localAnchorB = MoValueOrDefault(options.localAnchorB, b2.GetLocalPoint(options.anchor));
		def.motorSpeed = MoValueOrDefault(options.motorSpeed, 0.0);
		def.maxMotorTorque = MoValueOrDefault(options.maxMotorTorque, 0.0);
		def.lowerAngle = MoValueOrDefault(options.lowerAngle, 0.0);
		def.upperAngle = MoValueOrDefault(options.upperAngle, 0.0);
		def.referenceAngle = MoValueOrDefault(options.referenceAngle, b2.GetAngle() - b1.GetAngle());
		def.enableMotor = (def.motorSpeed != 0 || def.maxMotorTorque != 0);
		def.enableLimit = (def.lowerAngle != 0 || def.upperAngle != 0);

		return def;
	},
	
	createWeldJoint : function() {
		var other = null;
		var options = null;
		
		if(arguments.length > 0)
		{
			if(arguments[0] instanceof MoEntity)
				other = arguments[0];

			if(arguments.length == 2)
				options = arguments[1];
		}
		
		if(other == null)
			throw new Error("Weld Joint requires another body to join to.");
			
		if(options == null)
			options = {};
			
		var b1 = this.body;
		var b2 = other.body;
		var def = new PXWeldJointDef();
		
		options.anchor = MoValueOrDefault(options.anchor, b1.GetWorldCenter());
		
		def.bodyA = b1;
		def.bodyB = b2;
		def.collideConnected = MoValueOrDefault(options.collideConnected, false);
		def.localAnchorA = MoValueOrDefault(options.localAnchorA, b1.GetLocalPoint(options.anchor));
		def.localAnchorB = MoValueOrDefault(options.localAnchorB, b2.GetLocalPoint(options.anchor));
		def.referenceAngle = MoValueOrDefault(options.referenceAngle, b2.GetAngle() - b1.GetAngle());

		return def;
	},

	toGlobalPoint : function(localPoint, isUnits, asUnits) {
		isUnits = MoValueOrDefault(isUnits, false);
		asUnits = MoValueOrDefault(asUnits, false);

		return this.convertPoint(
			this.body.GetWorldPoint(this.convertPoint(localPoint, isUnits, true, false)), true, asUnits);
	},
	
	toGlobalVector : function(localVector) {			
		return this.convertPoint(this.body.GetWorldVector(localVector), true, true);
	},
	
	toLocalPoint : function(globalPoint, isUnits, asUnits) {
		isUnits = MoValueOrDefault(isUnits, false);
		asUnits = MoValueOrDefault(asUnits, false);

		return this.convertPoint(
			this.body.GetLocalPoint(this.convertPoint(globalPoint, isUnits, true, false)), true, asUnits);
	},

	toLocalVector : function(globalVector) {
		return this.convertPoint(this.body.GetLocalVector(globalVector), true, true);
	},

	getLinearVelocityFromGlobalPoint : function(globalPoint, isUnits) {
		isUnits = MoValueOrDefault(isUnits, false);

		return this.convertPoint(
			this.body.GetLinearVelocityFromWorldPoint(this.convertPoint(globalPoint, isUnits, true, false)), true, true);
	},
	
	getLinearVelocityFromLocalPoint : function(localPoint, isUnits) {
		isUnits = MoValueOrDefault(isUnits, false);

		return this.convertPoint(
			this.body.GetLinearVelocityFromLocalPoint(this.convertPoint(localPoint, isUnits, true, false)), true, true);
	},
	
	getMoveSpeedIndex : function(direction) {
		switch(direction)
		{
			case MoDirection.East:
				return 0;
			case MoDirection.West:
				return 1;
			case MoDirection.North:
				return 2;
			case MoDirection.South:
				return 3;
		}

		return -1;
	},

	tryCopyValue : function(from, to, name) {
		if(!MoIsNull(from[name]))
			to[name] = from[name];
	}
});

Object.extend(MoEntity, {
	TANGENT_LENGTH : 0.55192,
	ELLIPSE_SEGMENTS_PER_UNIT : 12,
	
	createStatic : function(name, objectType, objectParams, descriptor, controller) {
		if(MoIsNull(objectParams))
			return new objectType(MoEntityType.Static, name, descriptor, controller);
		
		return new objectType(objectParams, MoEntityType.Static, name, descriptor, controller);
	},
	
	createKinematic : function(name, objectType, objectParams, descriptor, controller) {
		if(MoIsNull(objectParams))
			return new objectType(MoEntityType.Kinematic, name, descriptor, controller);
		
		return new objectType(objectParams, MoEntityType.Kinematic, name, descriptor, controller);
	},
	
	createDynamic : function(name, objectType, objectParams, descriptor, controller) {
		if(MoIsNull(objectParams))
			return new objectType(MoEntityType.Dynamic, name, descriptor, controller);
		
		return new objectType(objectParams, MoEntityType.Dynamic, name, descriptor, controller);
	}
});
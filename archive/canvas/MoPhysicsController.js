MoPhysicsController = Class.create(
// @PRIVATE
{
	initialize : function(surface) {
		this.surface = surface;
		this.contactListener = new MoPhysicsContactListener(this);
		this.isInteractionEnabled = false;
		this.isDebugDrawingEnabled = false;
		this.mousePosition = new PXVector2D(0, 0);
		this.mouseJoint = null;
		this.mouseDown = false;
		this.selectedBody = null;
		this.debugDraw = null;
		this.debugDrawContactPoints = false;
		this.debugCanvas = null;
		this.defaultUnit = 1.0;
		this.scalePixel = 1.0;
		this.scaleUnit = 1.0;
		this.entities = [];
		this.entitiesDestroyed = [];
		
		this.setup();
	},
	
	getContactPointDebuggingEnabled : function() {
		return (this.isDebugDrawingEnabled && this.debugDrawContactPoints);
	},
	
	getDefaultUnit : function() {
		return this.defaultUnit;
	},

	setDefaultUnit : function(value) {
		this.defaultUnit = value;
	},
	
	getScaleUnit : function() {
		return this.scaleUnit;
	},
	
	getScalePixel : function() {
		return this.scalePixel;
	},
	
	getGravity : function() {
		return this.getWorld().GetGravity();
	},
	
	setGravity : function(value) {
		this.getWorld().SetGravity(value);
	},
	
	getIsInteractionEnabled : function() {
		return this.isInteractionEnabled;
	},
	
	setIsInteractionEnabled : function(value) {
		this.isInteractionEnabled = value;
	},
	
	getIsDebugDrawingEnabled : function() {
		return this.isDebugDrawingEnabled;
	},
	
	setIsDebugDrawingEnabled : function(value) {
		this.isDebugDrawingEnabled = value;
	},
	
	getWorld : function() {
		return this.surface.getPhysicsWorld();
	},

	getDebugCanvas : function() {
		return this.debugCanvas;
	},
	
	addEntity : function(entity) {
		if(!this.entities.contains(entity))
			this.entities.push(entity);
	},
	
	removeEntity : function(entity, autoDestroy) {
		autoDestroy = MoValueOrDefault(autoDestroy, false);

		if(MoIsNull(entity))
			return;

		var idx = this.entities.indexOf(entity);

		if(idx != -1)
			this.entities.removeAt(idx);

		if(autoDestroy)
		{
			if(!this.entitiesDestroyed.contains(entity))
				this.entitiesDestroyed.push(entity);
		}
	},
	
	destroyEntities : function() {
		var len = this.entities.length;

		for(var i = len-1; i >= 0; i--)
		{
			// force unlinking
			this.entities[i].unlink(true);

			// perform any other teardown
			this.entities[i].destroy();
		}

		this.entities = [];
	},
	
	resetEntities : function() {
		var len = this.entities.length;
		
		for(var i = 0; i < len; ++i)
			this.entities[i].reset();
	},
	
	updateEntities : function(ratio) {
		// process contact events, this occurs after the physics timestep
		// this way, we dont have to worry about things reactions affecting
		// the current timestep and event callbacks can modify the world as
		// needed
		this.contactListener.process();
		
		var len = this.entities.length;
		
		for(var i = 0; i < len; ++i)
			this.entities[i].update(ratio);
	},

	destroyEntityObjects : function() {
		var len = this.entitiesDestroyed.length;
		var entity = null;
		
		for(var i = 0; i < len; ++i)
		{
			entity = this.entitiesDestroyed[i];

			if(entity instanceof MoEntityFixture)
			{
				entity.fixture.SetUserData(null);
				entity.fixture.GetBody().DestroyFixture(entity.fixture);
				entity.fixture = null;
			}
			else
			{
				entity.body.SetUserData(null);
				this.getWorld().DestroyBody(entity.body);		
				entity.body = null;
			}
		}

		this.entitiesDestroyed = [];
	},
	
	setup : function() {
		this.getWorld().SetContactListener(this.contactListener);

		this.surface.addEventHandler(MoMouseEvent.MOUSE_DOWN, this.handleMouseDown.asDelegate(this));
		this.surface.addEventHandler(MoMouseEvent.MOUSE_UP, this.handleMouseUp.asDelegate(this));
		this.surface.addEventHandler(MoMouseEvent.MOUSE_UP_OUTSIDE, this.handleMouseUp.asDelegate(this));
		this.surface.addEventHandler(MoMouseEvent.MOUSE_MOVE, this.handleMouseMove.asDelegate(this));
	},
	
	reset : function() {
		this.contactListener.resetDebugContactPoints();
	},
	
	toggleDebugDrawing : function(key, value) {
		if(MoIsNull(this.debugDraw))
			return;

		var flags = -1;

		switch(key)
		{
			case "shape":
				flags = PXDebugDraw.e_shapeBit;
				break;
			case "joint":
				flags = PXDebugDraw.e_jointBit;
				break;
			case "aabb":
				flags = PXDebugDraw.e_aabbBit;
				break;
			case "pair":
				flags = PXDebugDraw.e_pairBit;
				break;
			case "mass":
				flags = PXDebugDraw.e_centerOfMassBit;
				break;
			case "contacts":
				this.debugDrawContactPoints = value;
				return;
		}
		
		this.debugDraw[value ? "AppendFlags" : "ClearFlags"](flags);
	},
	
	updateSettings : function() {
		var nativeCanvas = this.surface.getNativeCanvas();
		
		if(MoIsNull(nativeCanvas))
			return;

		var world = this.getWorld();
		var surfaceWidth = this.surface.getWidth();
		var surfaceHeight = this.surface.getHeight();
		
		this.scalePixel = this.defaultUnit;
		this.scaleUnit = 1 / this.defaultUnit;
			
		if(this.isDebugDrawingEnabled)
		{
			// create the initial contact array
			this.contactListener.initializeDebugContactPoints();

			// create a canvas exactly the same size, so we can overlay it on top
			this.debugCanvas = document.createElement("canvas");
			this.debugCanvas.width = nativeCanvas.width;
			this.debugCanvas.height = nativeCanvas.height;
			
			// update the debug draw
			if(MoIsNull(this.debugDraw))
			{
				this.debugDraw = new PXDebugDraw();
				this.debugDraw.SetSprite(this.debugCanvas.getContext("2d"));
				this.debugDraw.SetFillAlpha(0.5);
				this.debugDraw.SetLineThickness(1);
				this.debugDraw.SetFlags(PXDebugDraw.e_shapeBit | PXDebugDraw.e_jointBit);

				world.SetDebugDraw(this.debugDraw);
			}

			this.debugDraw.SetDrawScale(this.scaleUnit);
			this.debugDraw.SetSprite(this.debugCanvas.getContext("2d"));
		}
	},
	
	update : function(ratio) {
		// draw any extra debugging info (i.e. contact points)
		this.drawDebugExtras();
		
		// update our entities
		this.updateEntities(ratio);
		
		// finally, destroy any entities that were flagged
		// in the previous timestep
		this.destroyEntityObjects();
	},
	
	step : function(t) {
		var world = this.surface.getPhysicsWorld();
		
		if(!this.isInteractionEnabled)
			return;

		if(this.mouseDown && MoIsNull(this.mouseJoint))
		{
			var body = this.getBodyAtMouse();
			
			if(!MoIsNull(body))
			{
				var md = new PXMouseJointDef();
				md.bodyA = world.GetGroundBody();
				md.bodyB = body;
				md.target.Set(this.mousePosition.x, this.mousePosition.y);
				md.collideConnected = true;
				md.maxForce = 300.0 * body.GetMass();
				
				this.mouseJoint = world.CreateJoint(md);
				body.SetAwake(true);
			}
		}
		
		if(!MoIsNull(this.mouseJoint))
		{
			if(this.mouseDown)
				this.mouseJoint.SetTarget(this.mousePosition);
			else
			{
				world.DestroyJoint(this.mouseJoint);
				this.mouseJoint = null;
			}
		}
	},

	drawDebugExtras : function() {
		if(!this.isDebugDrawingEnabled || !this.debugDrawContactPoints)
			return;

		var len = this.contactListener.debugContactPointCount;
		var cp = null;
		
		for(var i = 0; i < len; ++i)
		{
			cp = this.contactListener.debugContactPoints[i];
			
			if(cp.state == MoContactPointState.Add)
			{
				this.debugDraw.DrawSolidCircle(cp.position, 0.04, new PXVector2D(0,0), new PXColor(0.3, 0.95, 0.3));
			}
			else if(cp.state == MoContactPointState.Persist)
			{
				this.debugDraw.DrawSolidCircle(cp.position, 0.04, new PXVector2D(0,0), new PXColor(0.3, 0.3, 0.95));
			}

			var p1 = cp.position;
			var p2 = new PXVector2D(p1.x + 0.1 * cp.normal.x, p1.y + 0.1 * cp.normal.y);
			
			this.debugDraw.DrawSegment(p1, p2, new PXColor(0.9, 0.9, 0.9));
		}
	},
	
	renderDebugData : function(gfx) {
		if(MoIsNull(this.debugCanvas) || !this.isDebugDrawingEnabled)
			return;
			
		gfx.drawImage(this.debugCanvas, 0, 0);
	},

	convertPoint : function(pt, isUnits, asUnits, asMoVector) {	
		var vectorType = (MoValueOrDefault(asMoVector, true) ? MoVector2D : PXVector2D);

		if(isUnits && !asUnits)
		{
			var arr = this.toPixels([pt.x, pt.y]);
			return this.getVectorTypeAs(vectorType, new MoVector2D(arr[0], arr[1]));
		}

		if(asUnits && !isUnits)
		{
			var arr = this.toUnits([pt.x, pt.y]);
			return this.getVectorTypeAs(vectorType, new MoVector2D(arr[0], arr[1]));
		}

		return this.getVectorTypeAs(vectorType, pt);
	},

	getVectorTypeAs : function(type, value) {
		if(value instanceof type)
			return value;

		return new type(value.x, value.y);
	},
	
	toPixels : function(units) {
		var unitScale = this.getScaleUnit();
	
		if(!(units instanceof Array))
			return units * unitScale;

		var len = units.length;
		var pixels = new Array(len);
		
		for(var i = 0; i < len; ++i)
			pixels[i] = units[i] * unitScale;

		return pixels;
	},
	
	toUnits : function(pixels) {
		var pixelScale = this.getScalePixel();
	
		if(!(pixels instanceof Array))
			return pixels * pixelScale;

		var len = pixels.length;
		var units = new Array(len);
		
		for(var i = 0; i < len; ++i)
			units[i] = pixels[i] * pixelScale;

		return units;
	},
	
	getBodyAtMouse : function() {
		var aabb = new PXAABB();
		var world = this.surface.getPhysicsWorld();
		
		aabb.lowerBound.Set(this.mousePosition.x - 0.001, this.mousePosition.y - 0.001);
		aabb.upperBound.Set(this.mousePosition.x + 0.001, this.mousePosition.y + 0.001);

		this.selectedBody = null;
		world.QueryAABB(this.getBody.bind(this), aabb);

		return this.selectedBody;
	},
	
	getBody : function(fixture) {
		if(fixture.GetBody().GetType() != PXBody.b2_staticBody) 
		{
			if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), this.mousePosition))
			{
				this.selectedBody = fixture.GetBody();
				return false;
			}
		}
		
		return true;
	},
	
	handleMouseDown : function(event) {
		this.mouseDown = true;
		this.handleMouseMove(event);
	},
	
	handleMouseUp : function(event) {
		this.mouseDown = false;
	},

	handleMouseMove : function(event) {
		var units = this.toUnits([event.x, event.y]);
		
		this.mousePosition.x = units[0];
		this.mousePosition.y = units[1];
	}
});
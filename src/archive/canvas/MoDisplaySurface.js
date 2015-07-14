MoDisplaySurface = Class.create(MoContentControl, {
	initialize : function($super, name, canvas) {
		$super(name);

		this.nativeCanvas = canvas;
		this.isRunning = true;
		this.scene = this;
		this.resizeHandlerRegistered = false;
		this.resizeWidth = true;
		this.resizeHeight = true;
		this.resizeLive = true;
		this.isPhysicsEnabled = false;
		this.physicsController = null;
		this.frameRate = 24;
		this.percentBoundsChanged = false;
		this.updatingBounds = false;
		this.inputManager = new MoInputManager(this);
		this.absoluteSourcePosition = MoVector2D.Zero();
		this.physicsWorld = null;
		this.groundEntity = null;
		this.renderTimes = [];
		this.aiEntities = [];
		this.armatures = [];
		this.originalWidth = canvas.width;
		this.originalHeight = canvas.height;
		this.fps = new MoFPSGraph();
		this.fpsDirtyRegion = new MoDirtyRegion();
		this.times = [];
		this.lastAvg = 0;
		
		this.fixedTimeAccum = 0;
		this.fixedTimeAccumRatio = 0;
		
		var width = canvas.width;
		var height = canvas.height;

		this.invalidatePositionOnScreen();
		this.setIsRoot(true);
		this.changeParentAndScene(null, this);
		this.setDepth(1);
		this.setActualSize(width, height);
		this.setPercentWidth(100);
		this.setPercentHeight(100);
		this.initializeSelf();
	},
	
	getFocusedDrawable : function() {
		return this.inputManager.getFocusTarget();
	},

	getIsPhysicsEnabled : function() {
		return this.isPhysicsEnabled;
	},

	setIsPhysicsEnabled : function(value) {
		if(this.isPhysicsEnabled != value)
		{
			this.isPhysicsEnabled = value;

			if(this.isPhysicsEnabled)
				this.setupPhysicsWorld();
			else
				this.teardownPhysicsWorld();
		}
	},
	
	getPhysicsWorld : function() {
		return this.physicsWorld;
	},

	getGroundEntity : function() {
		this.needPhysics("get ground entity");
		
		if(this.groundEntity == null)
			this.groundEntity = new MoEntity(MoEntityType.Ground, "ground", this.physicsWorld.GetGroundBody(), this.physicsController);

		return this.groundEntity;
	},
	
	togglePhysicsDebugDraw : function(key, value) {
		this.needPhysics("update debug drawing");
		this.physicsController.toggleDebugDrawing(key, value);
	},

	setX : function(value) {
		/** no-op **/
		/** cannot change x-position on the scene **/
	},

	setY : function(value) {
		/** no-op **/
		/** cannot change y-position on the scene **/
	},
	
	createArmature : function(name, x, y) {		
		return this.addArmature(new MoIK(name, x, y));
	},

	addArmature : function(armature) {
		this.armatures.push(armature);
		
		return armature;
	},

	removeArmature : function(armature) {
		this.armatures.remove(armature);
		
		return armature;
	},

	createAIEntity : function(name, objectType) {
		var entity = MoAIEntity.create(name, MoValueOrDefault(objectType, MoAIEntity));

		this.addAIEntity(entity);

		return entity;
	},
	
	addAIEntity : function(entity) {
		this.aiEntities.push(entity);
	},
	
	destroyJointEntity : function(joint) {
		this.needPhysics("destroy joint");
		this.physicsWorld.DestroyJoint(joint);
	},
	
	createDynamicEntity : function(name, descriptor, objectType, objectParams) {
		this.needPhysics("create dynamic entity");
		
		return MoEntity.createDynamic(name, MoValueOrDefault(objectType, MoEntity), objectParams, descriptor, this.physicsController);
	},
	
	createStaticEntity : function(name, descriptor, objectType, objectParams) {
		this.needPhysics("create static entity");

		return MoEntity.createStatic(name, MoValueOrDefault(objectType, MoEntity), objectParams, descriptor, this.physicsController);
	},
	
	createKinematicEntity : function(name, descriptor, objectType, objectParams) {
		this.needPhysics("create kinematic entity");

		return MoEntity.createKinematic(name, MoValueOrDefault(objectType, MoEntity), objectParams, descriptor, this.physicsController);
	},
	
	queryEntities : function(rect) {
		this.needPhysics("query entities");
		
		var aabb = new PXAABB();
		var evt = new MoEntityQueryEvent(MoEntityQueryEvent.REPORT, null, true, true);
		evt.queryRect.x = rect.x;
		evt.queryRect.y = rect.y;
		evt.queryRect.width = rect.width;
		evt.queryRect.height = rect.height;

		aabb.lowerBound = this.physicsController.convertPoint(new PXVector2D(rect.x, rect.y), false, true, false);
		aabb.upperBound = this.physicsController.convertPoint(new PXVector2D(rect.right(), rect.bottom()), false, true, false);

		this.physicsWorld.QueryAABB((function(fixture) {
			evt.entityFixture = fixture.GetUserData();
			this.dispatchEvent(evt);

			return !evt.getIsDefaultPrevented();

		}).bind(this), aabb);
	},

	rayCastEntities : function(startPoint, endPoint, type) {
		this.needPhysics("raycast entities");

		type = MoValueOrDefault(type, MoEntityRayCastType.Any);
		
		var p1 = this.physicsController.convertPoint(startPoint, false, true, false);
		var p2 = this.physicsController.convertPoint(endPoint, false, true, false);
		var evt = new MoEntityRayCastEvent(MoEntityRayCastEvent.REPORT, true, true);
		var closestMatch = null;
		
		evt.startPoint.x = startPoint.x;
		evt.startPoint.y = startPoint.y;
		evt.endPoint.x = endPoint.x;
		evt.endPoint.y = endPoint.y;

		this.physicsWorld.RayCast((function(fixture, point, normal, fraction) {

			if(type == MoEntityRayCastType.Any || (type == MoEntityRayCastType.One && (closestMatch == null || fraction < closestMatch)))
			{
				closestMatch = fraction;			
				evt.entityFixture = fixture.GetUserData();
				evt.point = this.physicsController.convertPoint(point, true, false, true);
				evt.normal = new MoVector2D(normal.x, normal.y);
				evt.distance = fraction;
			}

			if(type == MoEntityRayCastType.Any)
			{
				evt.result = (fraction === undefined ? 0 : 1);
				
				// dispatch event to handlers
				this.dispatchEvent(evt);

				// if user cancelled event, then stop reporting fixtures
				if(evt.getIsDefaultPrevented())
					return 0;
			}
			else
			{
				evt.result = (fraction === undefined ? 0 : fraction);
			}

			return evt.result;

		}).bind(this), p1, p2);

		// just send the single event with the closest match found
		if(type == MoEntityRayCastType.One && closestMatch != null)
			this.dispatchEvent(evt);
	},

	needPhysics : function(msg) {
		if(!this.getIsPhysicsEnabled())
			throw new Error("Unable to " + MoValueOrDefault(msg, "perform action") + ", this surface does not have physics enabled.");
	},

	updateAI : function(t) {
		var len = this.aiEntities.length;
		var entity = null;
		
		for(var i = 0; i < len; ++i)
		{
			entity = this.aiEntities[i];
			entity.update(t);
		}
	},

	updatePhysics : function(t) {
		if(!this.isPhysicsEnabled)
			return;
		
		var ts = 1 / 60;
		var steps = 0;

		this.physicsController.reset();
		this.fixedTimeAccum += (t / 1000);
		
		steps = Math.floor(this.fixedTimeAccum / ts);
		
		if(steps > 0)
			this.fixedTimeAccum -= steps * ts;
		
		this.fixedTimeAccumRatio = this.fixedTimeAccum / ts;
		
		steps = Math.min(steps, 5);
		
		for(var i = 0; i < steps; ++i)
		{
			this.physicsController.step(ts);
			this.physicsController.resetEntities();

			this.physicsWorld.Step(ts, 8, 1);
		}

		this.physicsWorld.ClearForces();
		this.physicsWorld.DrawDebugData();
		this.physicsController.update(this.fixedTimeAccumRatio);
	},
	
	updateOther : function(t) {
		var len = this.armatures.length;

		for(var i = 0; i < len; ++i)
			this.armatures[i].update();
	},

	setPercentWidth : function($super, value) {	
		if(this.getPercentWidth() != value)
		{
			$super(value);

			if(!this.updatingBounds)
			{
				this.percentBoundsChanged = true;
				this.invalidateProperties();
			}
		}
	},

	setPercentHeight : function($super, value) {
		if(this.getPercentHeight() != value)
		{
			$super(value);

			if(!this.updatingBounds)
			{
				this.percentBoundsChanged = true;
				this.invalidateProperties();
			}
		}
	},
	
	setUnscaledWidth : function($super, value) {
		this.invalidateProperties();

		$super(value);
	},
	
	setUnscaledHeight : function($super, value) {
		this.invalidateProperties();
		
		$super(value);
	},

	getNativeCanvas : function() {
		return this.nativeCanvas;
	},
	
	setNativeCanvas : function(value) {
		// unregister any existing native event handlers
		this.inputManager.unregisterEvents();
		
		// now update the canvas and invalidate our properties
		this.nativeCanvas = value;
		this.originalWidth = this.nativeCanvas.width;
		this.originalHeight = this.nativeCanvas.height;
		this.invalidateProperties();
		this.invalidatePositionOnScreen();
		
		// update the physics debug draw
		if(this.isPhysicsEnabled)
			this.physicsController.updateSettings();

		// need to register the input manager to get native events
		this.inputManager.registerEvents();
	},
	
	getNativeGraphicsContext : function() {
		return this.nativeCanvas.getContext("2d");
	},

	getIsRunning : function() {
		return this.isRunning;
	},

	setIsRunning : function(value) {
		this.isRunning = value;
	},

	setupPhysicsWorld : function() {
		this.physicsWorld = new PXWorld(new PXVector2D(0, 0), true);
		this.physicsWorld.SetContinuousPhysics(true);
		this.physicsWorld.SetWarmStarting(true);
		this.physicsController = new MoPhysicsController(this);
	},

	teardownPhysicsWorld : function() {
		this.physicsController.destroyEntities();

		if(this.groundEntity != null)
		{
			this.groundEntity.body = null;
			this.groundEntity.controller = null;
		}
		
		this.groundEntity = null;
		this.physicsWorld = null;
		this.physicsController = null;
		this.invalidate();
	},
	
	enablePhysics : function(enable, defaultUnit, gravity, enableDebugDraw, enableDebugInteraction) {
		this.setIsPhysicsEnabled(enable);

		if(enable)
		{
			this.physicsController.setIsDebugDrawingEnabled(enableDebugDraw);	
			this.physicsController.setIsInteractionEnabled(enableDebugInteraction);	
			this.physicsController.setGravity(new PXVector2D(gravity.x, gravity.y));
			this.physicsController.setDefaultUnit(defaultUnit);
			this.physicsController.updateSettings();
		}
	},
	
	move : function(x, y) {
		/** no-op **/
	},
	
	commitProperties : function($super) {
		$super();
		
		this.resizeWidth = isNaN(this.getExactWidth());
		this.resizeHeight = isNaN(this.getExactHeight());
		
		if(this.resizeWidth || this.resizeHeight)
		{
			this.handleResizeEvent(new MoEvent(MoEvent.RESIZED));
			
			if(!this.resizeHandlerRegistered)
			{
				MoApplication.getInstance().addEventHandler(MoEvent.RESIZED, this.handleResizeEvent.asDelegate(this));
				this.resizeHandlerRegistered = true;
			}
		}
		else
		{
			if(this.resizeHandlerRegistered)
			{
				MoApplication.getInstance().removeEventHandler(MoEvent.RESIZED, this.handleResizeEvent.asDelegate(this));
				this.resizeHandlerRegistered = false;
			}
		}
		
		if(this.percentBoundsChanged)
		{
			this.updateBounds();
			this.percentBoundsChanged = false;
		}
	},
	
	handleResizeEvent : function(event) {
		
		if(!this.percentBoundsChanged)
		{
			this.updateBounds();
			
			if(this.resizeLive)
				MoLayoutManager.getInstance().validateNow();
		}
		
		this.invalidatePositionOnScreen();
	},
	
	updateBounds : function() {
		
		var w = 0;
		var h = 0;
		
		this.updatingBounds = true;
		
		if(this.resizeWidth)
		{
			if(isNaN(this.getPercentWidth()))
			{
				w = this.nativeCanvas.width;
			}
			else
			{
				this.setPercentWidth(Math.max(Math.min(this.getPercentWidth(), 100), 0));
				
				w = this.getPercentWidth() * (this.nativeCanvas.width / 100);
			}
		}
		else
		{
			w = this.getWidth();
		}
		
		if(this.resizeHeight)
		{
			if(isNaN(this.getPercentHeight()))
			{
				h = this.nativeCanvas.height;
			}
			else
			{
				this.setPercentHeight(Math.max(Math.min(this.getPercentHeight(), 100), 0));
				
				h = this.getPercentHeight() * (this.nativeCanvas.height / 100);
			}
		}
		else
		{
			h = this.getHeight();
		}

		this.updatingBounds = false;
		
		if(w != this.getWidth() || h != this.getHeight())
		{
			this.invalidateProperties();
			this.requestMeasure();
		}
		
		this.setActualSize(w, h);
		this.requestLayout();
		
		if(!MoIsNull(this.physicsController))
			this.physicsController.updateSettings();

		//MoDirtyRegionTracker.current().add(0, 0, w, h);
	},
	
	getAbsoluteSourcePosition : function() {
		return this.absoluteSourcePosition;
	},
	
	invalidatePositionOnScreen : function() {
		var source = this.getNativeCanvas();
		var pos = MoVector2D.Zero();
		
		if(!window.isNativeHost)
		{
			while(source != null)
			{
				pos.x += source.offsetLeft;
				pos.y += source.offsetTop;
				
				source = source.offsetParent;
			}
		}
		
		this.absoluteSourcePosition = pos;
	},
	
	performRender : function() {
		this.performRenderImpl();
	},

	performRenderImpl : function() {
		var app = MoApplication.getInstance();
		var fpsX = 10;
		var fpsY = this.getHeight() - this.fps.height - 10;
		var dirtyRectTracker = MoDirtyRegionTracker.current();
		
		// TODO : need to fix this so it's a bit smarter, computing the dirty
		//        regions directly before rendering sucks but it's a quick fix
		//        for now...
		//this.updateDirtyRegions();
		
		if(app.getEnableStatsGraph())
			this.fpsDirtyRegion.grow(fpsX, fpsY, fpsX + this.fps.width, fpsY + this.fps.height);
			
		var gfx = this.nativeCanvas.getContext("2d");	
		var dirtyRegions = dirtyRectTracker.getRects();
		//var len = dirtyRegions.length;
		var dirtyRect = null;
		var showDirtyRegions = MoApplication.getInstance().getEnableDebugVisuals();
		
		//console.log("DIRTY REGION COUNT: " + dirtyRegions.length);
		
		//dirtyRectTracker.clear();
		//console.log("-----------------------");
		
		gfx.save();
		
		if(showDirtyRegions || (this.getIsPhysicsEnabled() && this.physicsController.getIsDebugDrawingEnabled()))
		{
			gfx.clearRect(0, 0, this.nativeCanvas.width, this.nativeCanvas.height);
		}
		else
		{		
			for(var i = 0, len = dirtyRegions.length; i < len; ++i)
			{
				dirtyRect = dirtyRegions[i];
				dirtyRect.clamp(0, 0, this.getWidth(), this.getHeight());

				gfx.clearRect(dirtyRect.x, dirtyRect.y, dirtyRect.width, dirtyRect.height);
			}
		}
		
		dirtyRectTracker.clear();
		
		//MoPerfMark("RENDER");
		
		// now recursively render all of our content
		this.renderRecursive(gfx);

		//MoPerfUnmark();
		
		if(this.isPhysicsEnabled)
			this.physicsController.renderDebugData(gfx);
		
		gfx.restore();

		// render the fps stats, only if enabled
		if(app.getEnableStatsGraph())
			this.fps.render(gfx, fpsX, fpsY);

		// draw the dirty regions into the debug visualizer
		if(showDirtyRegions)
			this.drawDirtyRegions(gfx, dirtyRegions);
	},

	drawDirtyRegions : function(gfx, regions) {
		if(regions == null || regions.length == 0)
			return;
			
		var r = null;
		
		gfx.save();
		gfx.beginPath();
			
		for(var i = 0; i < regions.length; ++i)
		{
			r = regions[i];

			gfx.rect(r.x, r.y, r.width, r.height);
		}

		gfx.fillStyle = "rgba(255, 0, 255, 0.25)";
		gfx.strokeStyle = "rgba(255, 0, 255, 0.85)";
		gfx.fill();
		gfx.stroke();
		gfx.restore();		
	},
	
	checkTimes : function(newTime) {
		var avg = 0;
		var len = this.times.length;
		
		if(len > 0)
		{
			for(var i = 0; i < len; ++i)
				avg += this.times[i];
				
			avg = avg / len;
		}
		
		if(this.times.length >= 10)
			this.times.shift();
		
		this.times.push(newTime);
	
		if(this.lastAvg != avg)
			this.lastAvg = avg;
	}
});

Object.extend(MoDisplaySurface, {

	fromCanvas : function(canvas) {
		if(canvas == null)
			return;

		return new MoDisplaySurface(canvas.id, canvas);
	}
});
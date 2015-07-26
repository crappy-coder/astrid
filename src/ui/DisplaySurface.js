import ContentControl from "./ContentControl";
import InputManager from "../input/InputManager";
import Vector2D from "../Vector2D";
import DirtyRegion from "./DirtyRegion";
import DirtyRegionTracker from "./DirtyRegionTracker";
import FPSGraph from "../FPSGraph";
import Entity from "../physics/Entity";
import EntityType from "../physics/EntityType";
import IK from "../animation/IK";
import AIEntity from "../ai/AIEntity.js";
import { ValueOrDefault } from "../Engine";
import EntityQueryEvent from "../physics/EntityQueryEvent";
import EntityRayCastType from "../physics/EntityRayCastType";
import EntityRayCastEvent from "../physics/EntityRayCastEvent";
import PhysicsController from "../physics/PhysicsController";
import Event from "../Event";
import Application from "../Application";
import LayoutManager from "./LayoutManager";
import Box2D from "box2dweb";

var PXVector2D = Box2D.Common.Math.b2Vec2;
var PXAABB = Box2D.Collision.b2AABB;
var PXWorld = Box2D.Dynamics.b2World;

class DisplaySurface extends ContentControl {
	constructor(name, canvas) {
		super(name);

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
		this.inputManager = new InputManager(this);
		this.absoluteSourcePosition = Vector2D.Zero();
		this.physicsWorld = null;
		this.groundEntity = null;
		this.renderTimes = [];
		this.aiEntities = [];
		this.armatures = [];
		this.originalWidth = canvas.width;
		this.originalHeight = canvas.height;
		this.fps = new FPSGraph();
		this.fpsDirtyRegion = new DirtyRegion();
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
	}

	getFocusedDrawable() {
		return this.inputManager.getFocusTarget();
	}

	getIsPhysicsEnabled() {
		return this.isPhysicsEnabled;
	}

	setIsPhysicsEnabled(value) {
		if (this.isPhysicsEnabled != value) {
			this.isPhysicsEnabled = value;

			if (this.isPhysicsEnabled) {
				this.setupPhysicsWorld();
			} else {
				this.teardownPhysicsWorld();
			}
		}
	}

	getPhysicsWorld() {
		return this.physicsWorld;
	}

	getGroundEntity() {
		this.needPhysics("get ground entity");

		if (this.groundEntity == null) {
			this.groundEntity = new Entity(EntityType.Ground, "ground", this.physicsWorld.GetGroundBody(), this.physicsController);
		}

		return this.groundEntity;
	}

	togglePhysicsDebugDraw(key, value) {
		this.needPhysics("update debug drawing");
		this.physicsController.toggleDebugDrawing(key, value);
	}

	setX(value) {
		/** no-op **/
		/** cannot change x-position on the scene **/
	}

	setY(value) {
		/** no-op **/
		/** cannot change y-position on the scene **/
	}

	createArmature(name, x, y) {
		return this.addArmature(new IK(name, x, y));
	}

	addArmature(armature) {
		this.armatures.push(armature);

		return armature;
	}

	removeArmature(armature) {
		this.armatures.remove(armature);

		return armature;
	}

	createAIEntity(name, objectType) {
		var entity = AIEntity.create(name, ValueOrDefault(objectType, AIEntity));

		this.addAIEntity(entity);

		return entity;
	}

	addAIEntity(entity) {
		this.aiEntities.push(entity);
	}

	destroyJointEntity(joint) {
		this.needPhysics("destroy joint");
		this.physicsWorld.DestroyJoint(joint);
	}

	createDynamicEntity(name, descriptor, objectType, objectParams) {
		this.needPhysics("create dynamic entity");

		return Entity.createDynamic(name, ValueOrDefault(objectType, Entity), objectParams, descriptor, this.physicsController);
	}

	createStaticEntity(name, descriptor, objectType, objectParams) {
		this.needPhysics("create static entity");

		return Entity.createStatic(name, ValueOrDefault(objectType, Entity), objectParams, descriptor, this.physicsController);
	}

	createKinematicEntity(name, descriptor, objectType, objectParams) {
		this.needPhysics("create kinematic entity");

		return Entity.createKinematic(name, ValueOrDefault(objectType, Entity), objectParams, descriptor, this.physicsController);
	}

	queryEntities(rect) {
		this.needPhysics("query entities");

		var aabb = new PXAABB();
		var evt = new EntityQueryEvent(EntityQueryEvent.REPORT, null, true, true);
		evt.queryRect.x = rect.x;
		evt.queryRect.y = rect.y;
		evt.queryRect.width = rect.width;
		evt.queryRect.height = rect.height;

		aabb.lowerBound = this.physicsController.convertPoint(new PXVector2D(rect.x, rect.y), false, true, false);
		aabb.upperBound = this.physicsController.convertPoint(new PXVector2D(rect.right(), rect.bottom()), false, true, false);

		this.physicsWorld.QueryAABB((function (fixture) {
			evt.entityFixture = fixture.GetUserData();
			this.dispatchEvent(evt);

			return !evt.getIsDefaultPrevented();

		}).bind(this), aabb);
	}

	rayCastEntities(startPoint, endPoint, type) {
		this.needPhysics("raycast entities");

		type = ValueOrDefault(type, EntityRayCastType.Any);

		var p1 = this.physicsController.convertPoint(startPoint, false, true, false);
		var p2 = this.physicsController.convertPoint(endPoint, false, true, false);
		var evt = new EntityRayCastEvent(EntityRayCastEvent.REPORT, true, true);
		var closestMatch = null;

		evt.startPoint.x = startPoint.x;
		evt.startPoint.y = startPoint.y;
		evt.endPoint.x = endPoint.x;
		evt.endPoint.y = endPoint.y;

		this.physicsWorld.RayCast((function (fixture, point, normal, fraction) {

			if (type == EntityRayCastType.Any ||
				(type == EntityRayCastType.One && (closestMatch == null || fraction < closestMatch))) {
				closestMatch = fraction;
				evt.entityFixture = fixture.GetUserData();
				evt.point = this.physicsController.convertPoint(point, true, false, true);
				evt.normal = new Vector2D(normal.x, normal.y);
				evt.distance = fraction;
			}

			if (type == EntityRayCastType.Any) {
				evt.result = (fraction === undefined ? 0 : 1);

				// dispatch event to handlers
				this.dispatchEvent(evt);

				// if user cancelled event, then stop reporting fixtures
				if (evt.getIsDefaultPrevented()) {
					return 0;
				}
			}
			else {
				evt.result = (fraction === undefined ? 0 : fraction);
			}

			return evt.result;

		}).bind(this), p1, p2);

		// just send the single event with the closest match found
		if (type == EntityRayCastType.One && closestMatch != null) {
			this.dispatchEvent(evt);
		}
	}

	needPhysics(msg) {
		if (!this.getIsPhysicsEnabled()) {
			throw new Error("Unable to " + ValueOrDefault(msg, "perform action") +
				", this surface does not have physics enabled.");
		}
	}

	updateAI(t) {
		var len = this.aiEntities.length;
		var entity = null;

		for (var i = 0; i < len; ++i) {
			entity = this.aiEntities[i];
			entity.update(t);
		}
	}

	updatePhysics(t) {
		if (!this.isPhysicsEnabled) {
			return;
		}

		var ts = 1 / 60;
		var steps = 0;

		this.physicsController.reset();
		this.fixedTimeAccum += (t / 1000);

		steps = Math.floor(this.fixedTimeAccum / ts);

		if (steps > 0) {
			this.fixedTimeAccum -= steps * ts;
		}

		this.fixedTimeAccumRatio = this.fixedTimeAccum / ts;

		steps = Math.min(steps, 5);

		for (var i = 0; i < steps; ++i) {
			this.physicsController.step(ts);
			this.physicsController.resetEntities();

			this.physicsWorld.Step(ts, 8, 1);
		}

		this.physicsWorld.ClearForces();
		this.physicsWorld.DrawDebugData();
		this.physicsController.update(this.fixedTimeAccumRatio);
	}

	updateOther(t) {
		var len = this.armatures.length;

		for (var i = 0; i < len; ++i) {
			this.armatures[i].update();
		}
	}

	setPercentWidth(value) {
		if (this.getPercentWidth() != value) {
			super.setPercentWidth(value);

			if (!this.updatingBounds) {
				this.percentBoundsChanged = true;
				this.invalidateProperties();
			}
		}
	}

	setPercentHeight(value) {
		if (this.getPercentHeight() != value) {
			super.setPercentHeight(value);

			if (!this.updatingBounds) {
				this.percentBoundsChanged = true;
				this.invalidateProperties();
			}
		}
	}

	setUnscaledWidth(value) {
		this.invalidateProperties();

		super.setUnscaledWidth(value);
	}

	setUnscaledHeight(value) {
		this.invalidateProperties();

		super.setUnscaledHeight(value);
	}

	getNativeCanvas() {
		return this.nativeCanvas;
	}

	setNativeCanvas(value) {
		// unregister any existing native event handlers
		this.inputManager.unregisterEvents();

		// now update the canvas and invalidate our properties
		this.nativeCanvas = value;
		this.originalWidth = this.nativeCanvas.width;
		this.originalHeight = this.nativeCanvas.height;
		this.invalidateProperties();
		this.invalidatePositionOnScreen();

		// update the physics debug draw
		if (this.isPhysicsEnabled) {
			this.physicsController.updateSettings();
		}

		// need to register the input manager to get native events
		this.inputManager.registerEvents();
	}

	getNativeGraphicsContext() {
		return this.nativeCanvas.getContext("2d");
	}

	getIsRunning() {
		return this.isRunning;
	}

	setIsRunning(value) {
		this.isRunning = value;
	}

	setupPhysicsWorld() {
		this.physicsWorld = new PXWorld(new PXVector2D(0, 0), true);
		this.physicsWorld.SetContinuousPhysics(true);
		this.physicsWorld.SetWarmStarting(true);
		this.physicsController = new PhysicsController(this);
	}

	teardownPhysicsWorld() {
		this.physicsController.destroyEntities();

		if (this.groundEntity != null) {
			this.groundEntity.body = null;
			this.groundEntity.controller = null;
		}

		this.groundEntity = null;
		this.physicsWorld = null;
		this.physicsController = null;
		this.invalidate();
	}

	enablePhysics(enable, defaultUnit, gravity, enableDebugDraw, enableDebugInteraction) {
		this.setIsPhysicsEnabled(enable);

		if (enable) {
			this.physicsController.setIsDebugDrawingEnabled(enableDebugDraw);
			this.physicsController.setIsInteractionEnabled(enableDebugInteraction);
			this.physicsController.setGravity(new PXVector2D(gravity.x, gravity.y));
			this.physicsController.setDefaultUnit(defaultUnit);
			this.physicsController.updateSettings();
		}
	}

	move(x, y) {
		/** no-op **/
	}

	commitProperties() {
		super.commitProperties();

		this.resizeWidth = isNaN(this.getExactWidth());
		this.resizeHeight = isNaN(this.getExactHeight());

		if (this.resizeWidth || this.resizeHeight) {
			this.handleResizeEvent(new Event(Event.RESIZED));

			if (!this.resizeHandlerRegistered) {
				Application.getInstance().addEventHandler(Event.RESIZED, this.handleResizeEvent.asDelegate(this));
				this.resizeHandlerRegistered = true;
			}
		}
		else {
			if (this.resizeHandlerRegistered) {
				Application.getInstance().removeEventHandler(Event.RESIZED, this.handleResizeEvent.asDelegate(this));
				this.resizeHandlerRegistered = false;
			}
		}

		if (this.percentBoundsChanged) {
			this.updateBounds();
			this.percentBoundsChanged = false;
		}
	}

	handleResizeEvent(event) {

		if (!this.percentBoundsChanged) {
			this.updateBounds();

			if (this.resizeLive) {
				LayoutManager.getInstance().validateNow();
			}
		}

		this.invalidatePositionOnScreen();
	}

	updateBounds() {

		var w = 0;
		var h = 0;

		this.updatingBounds = true;

		if (this.resizeWidth) {
			if (isNaN(this.getPercentWidth())) {
				w = this.nativeCanvas.width;
			}
			else {
				this.setPercentWidth(Math.max(Math.min(this.getPercentWidth(), 100), 0));

				w = this.getPercentWidth() * (this.nativeCanvas.width / 100);
			}
		}
		else {
			w = this.getWidth();
		}

		if (this.resizeHeight) {
			if (isNaN(this.getPercentHeight())) {
				h = this.nativeCanvas.height;
			}
			else {
				this.setPercentHeight(Math.max(Math.min(this.getPercentHeight(), 100), 0));

				h = this.getPercentHeight() * (this.nativeCanvas.height / 100);
			}
		}
		else {
			h = this.getHeight();
		}

		this.updatingBounds = false;

		if (w != this.getWidth() || h != this.getHeight()) {
			this.invalidateProperties();
			this.requestMeasure();
		}

		this.setActualSize(w, h);
		this.requestLayout();

		if (this.physicsController != null) {
			this.physicsController.updateSettings();
		}
	}

	getAbsoluteSourcePosition() {
		return this.absoluteSourcePosition;
	}

	invalidatePositionOnScreen() {
		var source = this.getNativeCanvas();
		var pos = Vector2D.Zero();

		if (!window.isNativeHost) {
			while (source != null) {
				pos.x += source.offsetLeft;
				pos.y += source.offsetTop;

				source = source.offsetParent;
			}
		}

		this.absoluteSourcePosition = pos;
	}

	performRender() {
		this.performRenderImpl();
	}

	performRenderImpl() {
		var app = Application.getInstance();
		var fpsX = 10;
		var fpsY = this.getHeight() - this.fps.height - 10;
		var dirtyRectTracker = DirtyRegionTracker.current();

		// TODO : need to fix this so it's a bit smarter, computing the dirty
		//        regions directly before rendering sucks but it's a quick fix
		//        for now...
		//this.updateDirtyRegions();

		if (app.getEnableStatsGraph()) {
			this.fpsDirtyRegion.grow(fpsX, fpsY, fpsX + this.fps.width, fpsY + this.fps.height);
		}

		var gfx = this.nativeCanvas.getContext("2d");
		var dirtyRegions = dirtyRectTracker.getRects();
		//var len = dirtyRegions.length;
		var dirtyRect = null;
		var showDirtyRegions = Application.getInstance().getEnableDebugVisuals();

		//console.log("DIRTY REGION COUNT: " + dirtyRegions.length);

		//dirtyRectTracker.clear();
		//console.log("-----------------------");

		gfx.save();

		if (showDirtyRegions || (this.getIsPhysicsEnabled() && this.physicsController.getIsDebugDrawingEnabled())) {
			gfx.clearRect(0, 0, this.nativeCanvas.width, this.nativeCanvas.height);
		}
		else {
			for (var i = 0, len = dirtyRegions.length; i < len; ++i) {
				dirtyRect = dirtyRegions[i];
				dirtyRect.clamp(0, 0, this.getWidth(), this.getHeight());

				gfx.clearRect(dirtyRect.x, dirtyRect.y, dirtyRect.width, dirtyRect.height);
			}
		}

		dirtyRectTracker.clear();

		//PerfMark("RENDER");

		// now recursively render all of our content
		this.renderRecursive(gfx);

		//PerfUnmark();

		if (this.isPhysicsEnabled) {
			this.physicsController.renderDebugData(gfx);
		}

		gfx.restore();

		// render the fps stats, only if enabled
		if (app.getEnableStatsGraph()) {
			this.fps.render(gfx, fpsX, fpsY);
		}

		// draw the dirty regions into the debug visualizer
		if (showDirtyRegions) {
			this.drawDirtyRegions(gfx, dirtyRegions);
		}
	}

	drawDirtyRegions(gfx, regions) {
		if (regions == null || regions.length == 0) {
			return;
		}

		var r = null;

		gfx.save();
		gfx.beginPath();

		for (var i = 0; i < regions.length; ++i) {
			r = regions[i];

			gfx.rect(r.x, r.y, r.width, r.height);
		}

		gfx.fillStyle = "rgba(255, 0, 255, 0.25)";
		gfx.strokeStyle = "rgba(255, 0, 255, 0.85)";
		gfx.fill();
		gfx.stroke();
		gfx.restore();
	}

	checkTimes(newTime) {
		var avg = 0;
		var len = this.times.length;

		if (len > 0) {
			for (var i = 0; i < len; ++i) {
				avg += this.times[i];
			}

			avg = avg / len;
		}

		if (this.times.length >= 10) {
			this.times.shift();
		}

		this.times.push(newTime);

		if (this.lastAvg != avg) {
			this.lastAvg = avg;
		}
	}

	static fromCanvas(canvas) {
		if (canvas == null) {
			return;
		}

		return new DisplaySurface(canvas.id, canvas);
	}
}

export default DisplaySurface;

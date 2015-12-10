import PhysicsContactListener from "./PhysicsContactListener";
import EntityFixture from "./EntityFixture";
import MouseEvent from "../input/MouseEvent";
import ContactPointState from "./ContactPointState";
import Vector2D from "../Vector2D";
import Box2D from "box2dweb";

var PXVector2D = Box2D.Common.Math.b2Vec2;
var PXColor = Box2D.Common.b2Color;
var PXAABB = Box2D.Collision.b2AABB;
var PXBody = Box2D.Dynamics.b2Body;
var PXDebugDraw = Box2D.Dynamics.b2DebugDraw;
var PXMouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef;

class PhysicsController {
	constructor(surface) {
		this.surface = surface;
		this.contactListener = new PhysicsContactListener(this);
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
	}

	getContactPointDebuggingEnabled() {
		return (this.isDebugDrawingEnabled && this.debugDrawContactPoints);
	}

	getDefaultUnit() {
		return this.defaultUnit;
	}

	setDefaultUnit(value) {
		this.defaultUnit = value;
	}

	getScaleUnit() {
		return this.scaleUnit;
	}

	getScalePixel() {
		return this.scalePixel;
	}

	getGravity() {
		return this.getWorld().GetGravity();
	}

	setGravity(value) {
		this.getWorld().SetGravity(value);
	}

	getIsInteractionEnabled() {
		return this.isInteractionEnabled;
	}

	setIsInteractionEnabled(value) {
		this.isInteractionEnabled = value;
	}

	getIsDebugDrawingEnabled() {
		return this.isDebugDrawingEnabled;
	}

	setIsDebugDrawingEnabled(value) {
		this.isDebugDrawingEnabled = value;
	}

	getWorld() {
		return this.surface.getPhysicsWorld();
	}

	getDebugCanvas() {
		return this.debugCanvas;
	}

	addEntity(entity) {
		if (!this.entities.contains(entity)) {
			this.entities.push(entity);
		}
	}

	removeEntity(entity, autoDestroy) {
		autoDestroy = astrid.valueOrDefault(autoDestroy, false);

		if (entity == null) {
			return;
		}

		var idx = this.entities.indexOf(entity);

		if (idx != -1) {
			this.entities.removeAt(idx);
		}

		if (autoDestroy) {
			if (!this.entitiesDestroyed.contains(entity)) {
				this.entitiesDestroyed.push(entity);
			}
		}
	}

	destroyEntities() {
		var len = this.entities.length;

		for (var i = len - 1; i >= 0; i--) {
			// force unlinking
			this.entities[i].unlink(true);

			// perform any other teardown
			this.entities[i].destroy();
		}

		this.entities = [];
	}

	resetEntities() {
		var len = this.entities.length;

		for (var i = 0; i < len; ++i) {
			this.entities[i].reset();
		}
	}

	updateEntities(ratio) {
		// process contact events, this occurs after the physics timestep
		// this way, we dont have to worry about things reactions affecting
		// the current timestep and event callbacks can modify the world as
		// needed
		this.contactListener.process();

		var len = this.entities.length;

		for (var i = 0; i < len; ++i) {
			this.entities[i].update(ratio);
		}
	}

	destroyEntityObjects() {
		var len = this.entitiesDestroyed.length;
		var entity = null;

		for (var i = 0; i < len; ++i) {
			entity = this.entitiesDestroyed[i];

			if (entity instanceof EntityFixture) {
				entity.fixture.SetUserData(null);
				entity.fixture.GetBody().DestroyFixture(entity.fixture);
				entity.fixture = null;
			}
			else {
				entity.body.SetUserData(null);
				this.getWorld().DestroyBody(entity.body);
				entity.body = null;
			}
		}

		this.entitiesDestroyed = [];
	}

	setup() {
		this.getWorld().SetContactListener(this.contactListener);

		this.surface.addEventHandler(MouseEvent.MOUSE_DOWN, this.handleMouseDown.asDelegate(this));
		this.surface.addEventHandler(MouseEvent.MOUSE_UP, this.handleMouseUp.asDelegate(this));
		this.surface.addEventHandler(MouseEvent.MOUSE_UP_OUTSIDE, this.handleMouseUp.asDelegate(this));
		this.surface.addEventHandler(MouseEvent.MOUSE_MOVE, this.handleMouseMove.asDelegate(this));
	}

	reset() {
		this.contactListener.resetDebugContactPoints();
	}

	toggleDebugDrawing(key, value) {
		if (this.debugDraw == null) {
			return;
		}

		var flags = -1;

		switch (key) {
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
	}

	updateSettings() {
		var nativeCanvas = this.surface.getNativeCanvas();

		if (nativeCanvas == null) {
			return;
		}

		var world = this.getWorld();

		this.scalePixel = this.defaultUnit;
		this.scaleUnit = 1 / this.defaultUnit;

		if (this.isDebugDrawingEnabled) {
			// create the initial contact array
			this.contactListener.initializeDebugContactPoints();

			// create a canvas exactly the same size, so we can overlay it on top
			this.debugCanvas = document.createElement("canvas");
			this.debugCanvas.width = nativeCanvas.width;
			this.debugCanvas.height = nativeCanvas.height;

			// update the debug draw
			if (this.debugDraw == null) {
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
	}

	update(ratio) {
		// draw any extra debugging info (i.e. contact points)
		this.drawDebugExtras();

		// update our entities
		this.updateEntities(ratio);

		// finally, destroy any entities that were flagged
		// in the previous timestep
		this.destroyEntityObjects();
	}

	step(t) {
		var world = this.surface.getPhysicsWorld();

		if (!this.isInteractionEnabled) {
			return;
		}

		if (this.mouseDown && this.mouseJoint == null) {
			var body = this.getBodyAtMouse();

			if (body != null) {
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

		if (this.mouseJoint != null) {
			if (this.mouseDown) {
				this.mouseJoint.SetTarget(this.mousePosition);
			} else {
				world.DestroyJoint(this.mouseJoint);
				this.mouseJoint = null;
			}
		}
	}

	drawDebugExtras() {
		if (!this.isDebugDrawingEnabled || !this.debugDrawContactPoints) {
			return;
		}

		var len = this.contactListener.debugContactPointCount;
		var cp = null;

		for (var i = 0; i < len; ++i) {
			cp = this.contactListener.debugContactPoints[i];

			if (cp.state == ContactPointState.Add) {
				this.debugDraw.DrawSolidCircle(cp.position, 0.04, new PXVector2D(0, 0), new PXColor(0.3, 0.95, 0.3));
			}
			else if (cp.state == ContactPointState.Persist) {
				this.debugDraw.DrawSolidCircle(cp.position, 0.04, new PXVector2D(0, 0), new PXColor(0.3, 0.3, 0.95));
			}

			var p1 = cp.position;
			var p2 = new PXVector2D(p1.x + 0.1 * cp.normal.x, p1.y + 0.1 * cp.normal.y);

			this.debugDraw.DrawSegment(p1, p2, new PXColor(0.9, 0.9, 0.9));
		}
	}

	renderDebugData(gfx) {
		if (this.debugCanvas == null || !this.isDebugDrawingEnabled) {
			return;
		}

		gfx.drawImage(this.debugCanvas, 0, 0);
	}

	convertPoint(pt, isUnits, asUnits, asVector) {
		var vectorType = (astrid.valueOrDefault(asVector, true) ? Vector2D : PXVector2D);
		var arr;

		if (isUnits && !asUnits) {
			arr = this.toPixels([pt.x, pt.y]);
			return this.getVectorTypeAs(vectorType, new Vector2D(arr[0], arr[1]));
		}

		if (asUnits && !isUnits) {
			arr = this.toUnits([pt.x, pt.y]);
			return this.getVectorTypeAs(vectorType, new Vector2D(arr[0], arr[1]));
		}

		return this.getVectorTypeAs(vectorType, pt);
	}

	getVectorTypeAs(type, value) {
		if (value instanceof type) {
			return value;
		}

		return new type(value.x, value.y);
	}

	toPixels(units) {
		var unitScale = this.getScaleUnit();

		if (!(units instanceof Array)) {
			return units * unitScale;
		}

		var len = units.length;
		var pixels = new Array(len);

		for (var i = 0; i < len; ++i) {
			pixels[i] = units[i] * unitScale;
		}

		return pixels;
	}

	toUnits(pixels) {
		var pixelScale = this.getScalePixel();

		if (!(pixels instanceof Array)) {
			return pixels * pixelScale;
		}

		var len = pixels.length;
		var units = new Array(len);

		for (var i = 0; i < len; ++i) {
			units[i] = pixels[i] * pixelScale;
		}

		return units;
	}

	getBodyAtMouse() {
		var aabb = new PXAABB();
		var world = this.surface.getPhysicsWorld();

		aabb.lowerBound.Set(this.mousePosition.x - 0.001, this.mousePosition.y - 0.001);
		aabb.upperBound.Set(this.mousePosition.x + 0.001, this.mousePosition.y + 0.001);

		this.selectedBody = null;
		world.QueryAABB(this.getBody.bind(this), aabb);

		return this.selectedBody;
	}

	getBody(fixture) {
		if (fixture.GetBody().GetType() != PXBody.b2_staticBody) {
			if (fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), this.mousePosition)) {
				this.selectedBody = fixture.GetBody();
				return false;
			}
		}

		return true;
	}

	handleMouseDown(event) {
		this.mouseDown = true;
		this.handleMouseMove(event);
	}

	handleMouseUp(event) {
		this.mouseDown = false;
	}

	handleMouseMove(event) {
		var units = this.toUnits([event.x, event.y]);

		this.mousePosition.x = units[0];
		this.mousePosition.y = units[1];
	}
}

export default PhysicsController;

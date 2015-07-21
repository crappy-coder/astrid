import EntityBase from "./EntityBase";
import CollisionCategory from "./CollisionCategory";
import Matrix2D from "./math/Matrix2D";
import Rectangle from "./Rectangle";
import Box2D from "box2dweb";

var PXVector2D = Box2D.Common.Math.b2Vec2;
var PXShape = Box2D.Collision.Shapes.b2Shape;
var PXMassData = Box2D.Collision.Shapes.b2MassData;

class EntityFixture extends EntityBase {
	constructor(name, fixture, controller) {
		super(name, controller);

		this.fixture = fixture;
		this.fixture.SetUserData(this);

		if (this.getEntity().getIsGround()) {
			this.addCategory(CollisionCategory.Ground);
		}
	}

	getEntity() {
		return this.fixture.GetBody().GetUserData();
	}

	getFixture() {
		return this.fixture;
	}

	getShapeType() {
		return this.fixture.GetType();
	}

	getShape() {
		return this.fixture.GetShape();
	}

	getIsSensor() {
		return this.fixture.IsSensor();
	}

	setIsSensor(value) {
		this.fixture.SetSensor(value);
	}

	getMassData() {
		var data = new PXMassData();

		return this.fixture.GetMassData(data);
	}

	getDensity() {
		return this.fixture.GetDensity();
	}

	setDensity(value) {
		this.fixture.SetDensity(value);
	}

	getFriction() {
		return this.fixture.GetFriction();
	}

	setFriction(value) {
		this.fixture.SetFriction(value);
	}

	getRestitution() {
		return this.fixture.GetRestitution();
	}

	setRestitution(value) {
		this.fixture.SetRestitution(value);
	}

	getLocalCenterImpl(asUnits) {
		var aabb = this.fixture.GetAABB();
		var center = aabb.GetCenter();
		var entity = this.getEntity();

		return entity.toLocalPoint(center, true, asUnits);
	}

	getGlobalCenterImpl(asUnits) {
		var aabb = this.fixture.GetAABB();
		var center = aabb.GetCenter();

		return this.convertPoint(center, true, asUnits);
	}

	getPositionImpl(asUnits) {
		var pos = null;
		var type = this.getShapeType();

		switch (type) {
		case PXShape.e_circleShape:
			pos = this.getShape().GetLocalPosition();
			break;
		case PXShape.e_polygonShape:
			pos = this.getShape().m_centroid;
			break;
		}

		if (pos) {
			return this.getEntity().toGlobalPoint(pos, true, asUnits);
		}

		return this.getGlobalCenter(asUnits);
	}

	setPositionImpl(value, isUnits) {
		var pos = (isUnits ? value : this.convertPoint(value, false, true));
		var shape = this.getShape();
		var type = this.getShapeType();

		if (type == PXShape.e_circleShape) {
			shape.SetLocalPosition(pos);
		} else if (type == PXShape.e_polygonShape) {
			// update the poly's vertices, really the user
			// shouldn't being do this but I guess it could
			// be helpful in certain cases
			var verts = shape.GetVertices();
			var count = verts.length;
			var mx = new Matrix2D();

			mx.translate(pos.x, pos.y);
			mx.transformPoints(verts);

			for (var i = 0; i < count; ++i) {
				verts[i] = new PXVector2D(verts[i].x, verts[i].y);
			}

			shape.SetAsVector(verts, count);
		}
	}

	getAngleImpl(asRadians) {
		throw new Error("Not Supported");
	}

	setAngleImpl(value, isRadians) {
		throw new Error("Not Supported");
	}

	getMass() {
		var massData = new PXMassData();
		var shape = this.getShape();

		shape.ComputeMass(massData, this.getDensity());

		return massData.mass;
	}

	getBoundsImpl(asUnits, asAABB) {
		if (asAABB) {
			var aabb = this.fixture.GetAABB();

			return Rectangle.fromPoints(
				this.convertPoint(aabb.lowerBound, true, asUnits),
				this.convertPoint(aabb.upperBound, true, asUnits));
		}
	}

	getNext() {
		var nextFixture = this.fixture.GetNext();

		// return entity link
		if (nextFixture != null) {
			return nextFixture.GetUserData();
		}

		return null;
	}

	getGroup() {
		var group = this.fixture.GetFilterData().groupIndex;

		if (group < 0) {
			return -group;
		}

		return 0;
	}

	setGroup(group) {
		if (group < 0) {
			throw new Error("group must be a positive integer or zero");
		}

		var filterData = this.fixture.GetFilterData();

		filterData.groupIndex = -group;

		this.fixture.SetFilterData(filterData);
	}

	getCollisionGroup() {
		var group = this.fixture.GetFilterData().groupIndex;

		if (group > 0) {
			return group;
		}

		return 0;
	}

	setCollisionGroup(group) {
		if (group < 0) {
			throw new Error("group must be a positive integer or zero");
		}

		var filterData = this.fixture.GetFilterData();

		filterData.groupIndex = group;

		this.fixture.SetFilterData(filterData);
	}

	getCategories() {
		return this.fixture.GetFilterData().categoryBits;
	}

	addCategory(value) {
		var filterData = this.fixture.GetFilterData();

		if (filterData.categoryBits == 0x0001) {
			filterData.categoryBits = 0;
		}

		filterData.categoryBits |= value;

		this.fixture.SetFilterData(filterData);
	}

	removeCategory(value) {
		var filterData = this.fixture.GetFilterData();

		filterData.categoryBits &= ~value;

		this.fixture.SetFilterData(filterData);
	}

	clearCategories() {
		var filterData = this.fixture.GetFilterData();

		filterData.categoryBits = 0x0001;

		this.fixture.SetFilterData(filterData);
	}

	getCollisionCategories() {
		return this.fixture.GetFilterData().maskBits;
	}

	addCollisionCategory(value) {
		var filterData = this.fixture.GetFilterData();

		if (filterData.maskBits == 0xFFFF) {
			filterData.maskBits = 0x0001;
		}

		filterData.maskBits |= value;

		this.fixture.SetFilterData(filterData);
	}

	removeCollisionCategory(value) {
		var filterData = this.fixture.GetFilterData();

		filterData.maskBits &= ~value;

		this.fixture.SetFilterData(filterData);
	}

	clearCollisionCategories() {
		var filterData = this.fixture.GetFilterData();

		filterData.maskBits = 0xFFFF;

		this.fixture.SetFilterData(filterData);
	}

	reset() {
		var params = this.getParams();

		this.resetDrawable(params[0], params[1], params[2]);
	}

	update(ratio) {
		var params = this.getParams();

		this.updateDrawable(ratio, params[0], params[1], params[2]);
	}

	getParams() {
		var body = this.fixture.GetBody();
		var shape = this.fixture.GetShape();
		var type = shape.GetType();
		var position = body.GetPosition();
		var center = new PXVector2D();

		switch (type) {
		case PXShape.e_circleShape:
			center = shape.GetLocalPosition();
			break;
		case PXShape.e_polygonShape:
			center = shape.m_centroid;
			break;
		case PXShape.e_edgeShape:
			// TODO : the box2dweb-2.1.a.3.js includes this but is not 100% implemented yet
			throw new Error("The b2EdgeShape is not yet supported. Use b2PolygonShape.SetAsEdge instead.");
		}

		return [position, center, body.GetAngle()];
	}
}

export default EntityFixture;

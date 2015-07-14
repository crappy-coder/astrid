MoEntityFixture = Class.create(MoEntityBase, {
	initialize : function($super, name, fixture, controller) {
		$super(name, controller);

		this.fixture = fixture;
		this.fixture.SetUserData(this);
		
		if(this.getEntity().getIsGround())
			this.addCategory(MoCollisionCategory.Ground);
	},

	getEntity : function() {
		return this.fixture.GetBody().GetUserData();
	},
	
	getFixture : function() {
		return this.fixture;
	},
	
	getShapeType : function() {
		return this.fixture.GetType();
	},
	
	getShape : function() {
		return this.fixture.GetShape();
	},
	
	getIsSensor : function() {
		return this.fixture.IsSensor();
	},
	
	setIsSensor : function(value) {
		this.fixture.SetSensor(value);
	},
	
	getMassData : function() {
		var data = new PXMassData();
		
		return this.fixture.GetMassData(data);
	},
	
	getDensity : function() {
		return this.fixture.GetDensity();
	},
	
	setDensity : function(value) {
		this.fixture.SetDensity(value);
	},
	
	getFriction : function() {
		return this.fixture.GetFriction();
	},
	
	setFriction : function(value) {
		this.fixture.SetFriction(value);
	},
	
	getRestitution : function() {
		return this.fixture.GetRestitution();
	},
	
	setRestitution : function(value) {
		this.fixture.SetRestitution(value);
	},
	
	getLocalCenterImpl : function(asUnits) {
		var aabb = this.fixture.GetAABB();
		var center = aabb.GetCenter();
		var entity = this.getEntity();
		
		return entity.toLocalPoint(center, true, asUnits);
	},
	
	getGlobalCenterImpl : function(asUnits) {
		var aabb = this.fixture.GetAABB();
		var center = aabb.GetCenter();
		
		return this.convertPoint(center, true, asUnits);
	},
	
	getPositionImpl : function(asUnits) {
		var pos = null;
		var type = this.getShapeType();
		
		switch(type)
		{
			case PXShape.e_circleShape:
				pos = this.getShape().GetLocalPosition();
				break;
			case PXShape.e_polygonShape:
				pos = this.getShape().m_centroid;
				break;
		}
		
		if(pos)
			return this.getEntity().toGlobalPoint(pos, true, asUnits);

		return this.getGlobalCenter(asUnits);
	},
	
	setPositionImpl : function(value, isUnits) {
		var pos = (isUnits ? value : this.convertPoint(value, false, true));
		var shape = this.getShape();
		var type = this.getShapeType();
		
		if(type == PXShape.e_circleShape)
			shape.SetLocalPosition(pos);
		else if(type == PXShape.e_polygonShape)
		{
			// update the poly's vertices, really the user
			// shouldn't being do this but I guess it could
			// be helpful in certain cases
			var verts = shape.GetVertices();
			var count = verts.length;
			var mx = new MoMatrix2D();
			
			mx.translate(pos.x, pos.y);
			mx.transformPoints(verts);
			
			for(var i = 0; i < count; ++i)
				verts[i] = new PXVector2D(verts[i].x, verts[i].y);

			shape.SetAsVector(verts, count);
		}
	},
	
	getAngleImpl : function(asRadians) {
		throw new Error("Not Supported");
	},
	
	setAngleImpl : function(value, isRadians) {
		throw new Error("Not Supported");
	},
	
	getMass : function() {
		var massData = new PXMassData();
		var shape = this.getShape();
		
		shape.ComputeMass(massData, this.getDensity());
		
		return massData.mass;
	},
	
	getBoundsImpl : function(asUnits, asAABB) {		
		if(asAABB)
		{
			var aabb = this.fixture.GetAABB();

			return MoRectangle.fromPoints(
				this.convertPoint(aabb.lowerBound, true, asUnits), 
				this.convertPoint(aabb.upperBound, true, asUnits));
		}
	},
	
	getNext : function() {
		var nextFixture = this.fixture.GetNext();
		
		// return entity link
		if(!MoIsNull(nextFixture))
			return nextFixture.GetUserData();

		return null;
	},
	
	getGroup : function() {
		var group = this.fixture.GetFilterData().groupIndex;

		if(group < 0)
			return -group;

		return 0;
	},

	setGroup : function(group) {
		if(group < 0)
			throw new Error("group must be a positive integer or zero");

		var filterData = this.fixture.GetFilterData();

		filterData.groupIndex = -group;
		
		this.fixture.SetFilterData(filterData);
	},
	
	getCollisionGroup : function() {
		var group = this.fixture.GetFilterData().groupIndex;
		
		if(group > 0)
			return group;

		return 0;
	},

	setCollisionGroup : function(group) {
		if(group < 0)
			throw new Error("group must be a positive integer or zero");

		var filterData = this.fixture.GetFilterData();

		filterData.groupIndex = group;
		
		this.fixture.SetFilterData(filterData);
	},
	
	getCategories : function() {
		return this.fixture.GetFilterData().categoryBits;
	},

	addCategory : function(value) {
		var filterData = this.fixture.GetFilterData();

		if(filterData.categoryBits == 0x0001)
			filterData.categoryBits = 0;

		filterData.categoryBits |= value;

		this.fixture.SetFilterData(filterData);
	},
	
	removeCategory : function(value) {
		var filterData = this.fixture.GetFilterData();

		filterData.categoryBits &= ~value;

		this.fixture.SetFilterData(filterData);
	},
	
	clearCategories : function() {
		var filterData = this.fixture.GetFilterData();

		filterData.categoryBits = 0x0001;
		
		this.fixture.SetFilterData(filterData);
	},

	getCollisionCategories : function() {
		return this.fixture.GetFilterData().maskBits;
	},

	addCollisionCategory : function(value) {
		var filterData = this.fixture.GetFilterData();

		if(filterData.maskBits == 0xFFFF);
			filterData.maskBits = 0x0001;
			
		filterData.maskBits |= value;
		
		this.fixture.SetFilterData(filterData);
	},
	
	removeCollisionCategory : function(value) {
		var filterData = this.fixture.GetFilterData();
		
		filterData.maskBits &= ~value;

		this.fixture.SetFilterData(filterData);
	},
	
	clearCollisionCategories : function() {
		var filterData = this.fixture.GetFilterData();
		
		filterData.maskBits = 0xFFFF;
		
		this.fixture.SetFilterData(filterData);
	},
	
	reset : function() {
		var params = this.getParams();

		this.resetDrawable(params[0], params[1], params[2]);
	},

	update : function(ratio) {
		var params = this.getParams();
		
		this.updateDrawable(ratio, params[0], params[1], params[2]);
	},
	
	getParams : function() {
		var body = this.fixture.GetBody();
		var shape = this.fixture.GetShape();
		var type = shape.GetType();
		var position = body.GetPosition();
		var center = new PXVector2D();
		
		switch(type)
		{
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
});
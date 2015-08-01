BubbleVertex = Class.create({
	initialize : function(x, y) {
		this.x = x;
		this.y = y;
		this.vx = 5 * Math.random();
		this.vy = 5 * Math.random();
	},
	
	update : function(gravity) {
		this.x += this.vx;
		this.y += this.vy;
		this.vy += gravity;
		
		if(this.x < 0)
		{
			this.x = 0;
			this.vx = 0;
			this.vy = 0;
		}
		
		if(this.y < 0)
		{
			this.y = 0;
			this.vx = 0;
			this.vy = 0;
		}
		
		if(this.x > 800)
		{
			this.x = 800;
			this.vx = 0;
			this.vy = 0;
		}
		
		if(this.y > 600)
		{
			this.y = 600;
			this.vx = 0;
			this.vy = 0;
		}
		
		this.vx *= 0.99;
		this.vy *= 0.99;
	}
});

Bubble = Class.create(MoDrawable, {
	initialize : function($super, name) {
		$super(name);
		
		this.firmness = 0.1;
		this.gravity = -0.002;
		this.radius = 50;
		this.rotation = 0;
		this.rotationAmount = -0.01;
		this.points = [];
		this.pointCount = 10;
		this.startX = 0;
		this.startY = 0;
		this.invalidatePoints = true;
		this.alwaysDirty = true;
		this.penCache = new MoPen(MoSolidColorBrush.fromColorHex("#FFFFFF"), 4);
		this.penCache.setLineJoin(MoPenLineJoin.Round);
		this.brushCache = new MoSolidColorBrush(MoColor.Blue);

		MoApplication.getInstance().addEventHandler(MoFrameEvent.ENTER, this.handleFrameTick.asDelegate(this));
		this.addEventHandler(MoTouchEvent.TOUCH_START, this.handleTouchStartEvent.asDelegate(this));
		this.addEventHandler(MoTouchEvent.TOUCH_END, this.handleTouchEndEvent.asDelegate(this));
		this.addEventHandler(MoTouchEvent.TOUCH_MOVE, this.handleTouchMoveEvent.asDelegate(this));
	},
	
	handleTouchStartEvent : function(event) {
		event.preventDefault();
		
		for(var i = 0; i < event.points.length; i++)
		{
			console.log("start(" + this.name + ") : " + event.points[i].sceneX + " : " + event.points[i].sceneY);
		}
	},
	
	handleTouchEndEvent : function(event) {
		for(var i = 0; i < event.points.length; i++)
		{
			console.log("end(" + this.name + "): " + event.points[i].sceneX + " : " + event.points[i].sceneY);
		}
	},
	
	handleTouchMoveEvent : function(event) {
		for(var i = 0; i < event.points.length; i++)
		{
			console.log("move(" + this.name + "): " + event.points[i].sceneX + " : " + event.points[i].sceneY);
		}
	},
	
	handleMouseDown : function(evt) {
		console.log(this.name);
	},
	
	getFirmness : function() {
		return this.firmness;
	},
	
	setFirmness : function(value) {
		this.firmness = value;
	},
	
	getGravity : function() {
		return this.gravity;
	},
	
	setGravity : function(value) {
		this.gravity = value;
	},
	
	getRadius : function() {
		return this.radius;
	},
	
	setRadius : function(value) {
		this.radius = value;
	},
	
	getRotation : function() {
		return this.rotation;
	},
	
	setRotation : function(value) {
		this.rotation = value;
	},
	
	getRotationAmount : function() {
		return this.rotationAmount;
	},
	
	setRotationAmount : function(value) {
		this.rotationAmount = value;
	},
	
	getPointCount : function() {
		return this.pointCount;
	},
	
	setPointCount : function(value) {
		if(this.pointCount != value)
		{
			this.pointCount = value;
			this.invalidatePoints = true;
			this.invalidateProperties();
		}
	},
	
	setStartX : function(value) {
		if(this.startX != value)
		{
			this.startX = value;
			this.invalidatePoints = true;
			this.invalidateProperties();
		}
	},
	
	setStartY : function(value) {
		if(this.startY != value)
		{
			this.startY = value;
			this.invalidatePoints = true;
			this.invalidateProperties();
		}
	},
	
	commitProperties : function($super) {
		$super();
		
		if(this.invalidatePoints)
		{
			this.points = [];
			
			for(var i = 0; i < this.pointCount; ++i)
			{
				var angle = Math.PI * 2 / this.pointCount * i;
				this.points.push(new BubbleVertex(this.startX + Math.cos(angle) * this.radius, this.startY + Math.sin(angle) * this.radius));
			}
			
			this.invalidatePoints = false;
		}
	},
	
	handleFrameTick : function(evt) {
		var t = evt.getDeltaTime();
		var gfx = this.getGraphics();
		var cx = 0;
		var cy = 0;
		var v = null;
		
		if(this.points.length == 0)
			return;
		
		for(var i = 0; i < this.pointCount; ++i)
		{
			v = this.points[i];
			v.update(this.gravity * t);
			
			cx += v.x;
			cy += v.y;
			
			//gfx.drawEllipse(v.x, v.y, 2, 2);
			//gfx.fill(MoSolidColorBrush.fromColorHex("#FFFFFF"));
		}
		
		cx /= this.pointCount;
		cy /= this.pointCount;
		
		//gfx.drawEllipse(cx, cy, 5, 5);
		//gfx.fill(MoSolidColorBrush.fromColorHex("#FF0000"));
		
		for(var i = 0; i < this.pointCount; ++i)
		{
			v = this.points[i];
			
			var angle = Math.PI * 2 / this.pointCount * i + this.rotation;
			var tx = cx + Math.cos(angle) * this.radius;
			var ty = cy + Math.sin(angle) * this.radius;
			
			v.vx += (tx - v.x) * this.firmness;
			v.vy += (ty - v.y) * this.firmness;
		}
		
		this.rotation += Math.random() * this.rotationAmount;
		gfx.clear();
		this.renderOutline();
	},
	
	renderOutline : function() {
		var mids = [];
		var len = this.points.length;
		var ptA = null;
		var ptB = null;
		var gfx = this.getGraphics();
		
		for(var i = 0; i < len - 1; ++i)
		{
			ptA = this.points[i];
			ptB = this.points[i + 1];
			mids.push(new MoVector2D((ptA.x + ptB.x) * 0.5, (ptA.y + ptB.y) * 0.5));
		}
		
		mids.push(new MoVector2D((this.points[i].x + this.points[0].x) * 0.5, (this.points[i].y + this.points[0].y) * 0.5));
		
		gfx.beginPath();
		gfx.moveTo(mids[0].x, mids[0].y);
		
		for(var i = 1; i < len; ++i)
		{
			gfx.curveTo(this.points[i].x, this.points[i].y, mids[i].x, mids[i].y);
		}
		
		gfx.curveTo(this.points[0].x, this.points[0].y, mids[0].x, mids[0].y);
		gfx.closePath();
		
		gfx.fill(this.brushCache);
		gfx.stroke(this.penCache);
	}
});
MoParallaxCanvas = Class.create(MoCanvas, {
	initialize : function($super, name) {
		$super(name);
		
		this.speed = 0;
		this.limits = MoVector2D.NotSet();
		this.computedLimits = null;
		this.position = MoVector2D.Zero();

		this.addEventHandler(MoCollectionEvent.ITEM_ADDED, this.handleItemAddRemoveEvent.asDelegate(this));
		this.addEventHandler(MoCollectionEvent.ITEM_REMOVED, this.handleItemAddRemoveEvent.asDelegate(this));
		
		MoApplication.getInstance().addEventHandler(MoFrameEvent.ENTER, this.handleFrameTickEvent.asDelegate(this));
	},

	getSpeed : function() {
		return this.speed;
	},

	setSpeed : function(value) {
		this.speed = value;
	},

	getLimits : function() {
		return this.limits;
	},

	setLimits : function(value) {
		this.limits = value;
	},

	moveUp : function(by) {
		this.move(0, by);
	},

	moveDown : function(by) {
		this.move(0, -by);
	},
	
	moveLeft : function(by) {
		this.move(by, 0);
	},
	
	moveRight : function(by) {
		this.move(-by, 0);
	},
	
	move : function(byX, byY) {
		var x = byX * this.speed;
		var y = byY * this.speed;
		var computedLimits = this.computeLimits();
		var lx = computedLimits.x;
		var ly = computedLimits.y;

		this.position.x += x;
		this.position.y += y;

		if(Math.abs(this.position.x) > lx && !MoMath.isInfinity(lx))
			this.position.x -= x;
		
		if(Math.abs(this.position.y) > ly && !MoMath.isInfinity(ly))
			this.position.y -= y;		
	},

	computeLimits : function() {
		if(this.computedLimits != null)
			return this.computedLimits;

		var len = this.getCount();
		var child = null;
		var ignoreX = false;
		var ignoreY = false;
		var x = this.limits.x;
		var y = this.limits.y;
		
		for(var i = 0; i < len; ++i)
		{
			child = this.getAt(i);

			var dx = 0;
			var dy = 0;
			
			if(!(child instanceof MoParallaxCanvasLayer))
				continue;
			
			if(!MoMath.isInfinity(child.limits.x))
				dx = child.limits.x;

			if(MoMath.isInfinity(child.limits.y))
				dy = child.limits.y;

			x = Math.max((MoMath.isInfinity(x) ? 0 : x), dx);
			y = Math.max((MoMath.isInfinity(y) ? 0 : y), dy);
		}

		if(ignoreX)
			x = MoPositiveInfinity;

		if(ignoreY)
			y = MoPositiveInfinity;

		this.computedLimits = new MoVector2D(x, y);

		return this.computedLimits;
	},

	invalidateLimits : function() {
		this.computedLimits = null;
	},

	handleItemAddRemoveEvent : function(event) {
		this.invalidateLimits();
	},
	
	handleFrameTickEvent : function(event) {
		var t = event.getDeltaTime();
		var childWidth = 0;
		var childHeight = 0;
		var width = this.getWidth();
		var height = this.getHeight();
		var tx = 0;
		var ty = 0;
		var lx = 0;
		var ly = 0;
		var len = this.getCount();
		var child = null;
		var hasLimitX = !MoMath.isInfinity(this.limits.x);
		var hasLimitY = !MoMath.isInfinity(this.limits.y);

		for(var i = 0; i < len; ++i)
		{
			child = this.getAt(i);

			if(!(child instanceof MoParallaxCanvasLayer))
				return;

			childWidth = child.getWidth();
			childHeight = child.getHeight();

			tx = this.position.x;
			ty = this.position.y;
			lx = child.limits.x;
			ly = child.limits.y;

			if(MoMath.isInfinity(lx) && hasLimitX)
				lx = this.limits.x;

			if(MoMath.isInfinity(ly) && hasLimitY)
				ly = this.limits.y;

			if(Math.abs(tx) > lx && !MoMath.isInfinity(lx))
				tx = (tx < 0 ? -lx : lx);

			if(Math.abs(ty) > ly && !MoMath.isInfinity(ly))
				ty = (ty < 0 ? -ly : ly);

			tx = (width * 0.5) + (tx * child.ratio) + child.offset.x;
			ty = (height * 0.5) + (ty * child.ratio) + child.offset.y;

			child.setX(tx - (width * 0.5));
			child.setY(ty - (height * 0.5));
		}
	}
});
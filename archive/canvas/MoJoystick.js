/****************************************************************************
** TODO:
**   - add bounding box limit so the joystick base can only move within a
**     specified bounding rect
**
**   - add snap back tweening to the stick so it smoothly snaps back to 
**     the center
**
****************************************************************************/

MoJoystick = Class.create(MoDrawable, {
	initialize : function($super, name, outerRadius, innerRadius, isPinned) {
		$super(name);

		this.outerRadius = MoValueOrDefault(outerRadius, 50);
		this.innerRadius = MoValueOrDefault(innerRadius, 30);
		this.range = 0;
		this.baseX = 0;
		this.baseY = 0;
		this.stickX = 0;
		this.stickY = 0;
		this.lastParent = null;
		this.value = new MoVector2D(0, 0);
		this.angleValue = 0;
		this.isPinned = MoValueOrDefault(isPinned, false);
		this.isDown = false;
		
		this.updateRange();
		this.addEventHandler(MoEvent.PARENT_CHANGED, this.handleParentChange.asDelegate(this));
	},
	
	getOuterRadius : function() {
		return this.outerRadius;
	},
	
	setOuterRadius : function(value) {
		this.outerRadius = value;
		this.updateRange();
	},
	
	getInnerRadius : function() {
		return this.innerRadius;
	},
	
	setInnerRadius : function(value) {
		this.innerRadius = value;
		this.updateRange();
	},
	
	getIsPinned : function() {
		return this.isPinned;
	},
	
	setIsPinned : function(value) {
		this.isPinned = value;
	},

	getRange : function() {
		return this.range;
	},

	getDeltaX : function() {
		return this.stickX - this.baseX;
	},
	
	getDeltaY : function() {
		return this.stickY - this.baseY;
	},
	
	getAngleValue : function() {
		return this.angleValue;
	},
	
	getValue : function() {
		return this.value;
	},
	
	isZero : function() {
		return (this.value.x == 0 && this.value.y == 0);
	},
	
	isPointingUp : function() {
		return (this.value.y < 0);
	},
	
	isPointingDown : function() {
		return (this.value.y > 0);
	},
	
	isPointingLeft : function() {			
		return (this.value.x < 0);
	},
	
	isPointingRight : function() {
		return (this.value.x > 0);
	},

	layout : function($super, unscaledWidth, unscaledHeight) {	
		$super(unscaledWidth, unscaledHeight);

		var cx = unscaledWidth * 0.5;
		var cy = unscaledHeight * 0.5;

		this.graphics.clear();				
		this.render(this.graphics, cx, cy, this.getDeltaX() + cx, this.getDeltaY() + cy);
	},

	/** implementors should override this to provide a custom ui **/
	/*
		cx1,cy1: center of base
		cx2,cy2: center of stick
	*/
	render : function(gfx, cx1, cy1, cx2, cy2) {
		// base
		gfx.drawEllipse(cx1, cy1, this.outerRadius*2, this.outerRadius*2);
		gfx.stroke(new MoPen(MoSolidColorBrush.blue(), 1));

		// stick
		gfx.drawEllipse(cx2, cy2, this.innerRadius*2, this.innerRadius*2);
		gfx.stroke(new MoPen(MoSolidColorBrush.blue(), 1));	
	},

	updateRange : function() {
		this.range = (this.outerRadius - this.innerRadius);
		this.setWidth(this.outerRadius*2);
		this.setHeight(this.outerRadius*2);
	},

	updateValue : function() {
		var dx = this.getDeltaX();
		var dy = this.getDeltaY();
		var vx = dx / this.range;
		var vy = dy / this.range;

		if(vx != this.value.x || vy != this.value.y)
		{
			this.value.x = vx;
			this.value.y = vy;
			this.angleValue = MoMath.radiansToDegrees(Math.atan2(dy, dx));
			
			this.dispatchEvent(new MoEvent(MoEvent.CHANGE));
		}
	},
	
	handleParentChange : function(e) {
		if(!MoIsNull(this.lastParent))
		{
			this.lastParent.removeEventHandler(MoMouseEvent.MOUSE_DOWN, this.handleMouseDown.asDelegate(this));
			this.lastParent.removeEventHandler(MoMouseEvent.MOUSE_UP, this.handleMouseUp.asDelegate(this));
			this.lastParent.removeEventHandler(MoMouseEvent.MOUSE_UP_OUTSIDE, this.handleMouseUp.asDelegate(this));
			this.lastParent.removeEventHandler(MoMouseEvent.MOUSE_MOVE, this.handleMouseMove.asDelegate(this));		
		}

		this.lastParent = this.getParent();

		if(!MoIsNull(this.lastParent))
		{
			this.lastParent.addEventHandler(MoMouseEvent.MOUSE_DOWN, this.handleMouseDown.asDelegate(this));
			this.lastParent.addEventHandler(MoMouseEvent.MOUSE_UP, this.handleMouseUp.asDelegate(this));
			this.lastParent.addEventHandler(MoMouseEvent.MOUSE_UP_OUTSIDE, this.handleMouseUp.asDelegate(this));
			this.lastParent.addEventHandler(MoMouseEvent.MOUSE_MOVE, this.handleMouseMove.asDelegate(this));
		}
	},
	
	handleMouseDown : function(e) {	
		this.isDown = true;
		this.baseX = this.stickX = e.x;
		this.baseY = this.stickY = e.y;
		
		if(!this.isPinned)
		{
			this.setX(e.getLocalX() - (this.getExactOrMeasuredWidth() * 0.5));
			this.setY(e.getLocalY() - (this.getExactOrMeasuredHeight() * 0.5));
		}
		
		this.updateValue();
		this.requestLayout();
	},

	handleMouseUp : function(e) {
		this.isDown = false;
		this.baseX = this.stickX = (this.getExactOrMeasuredWidth() * 0.5);
		this.baseY = this.stickY = (this.getExactOrMeasuredHeight() * 0.5);

		this.updateValue();
		this.requestLayout();
	},

	handleMouseMove : function(e) {
		if(!this.isDown)
			return;

		var dx = e.x - this.baseX;
		var dy = e.y - this.baseY;
		var r = Math.sqrt(dx * dx + dy * dy);

		if(r > this.range)
		{
			this.stickX = this.baseX + dx / r * this.range;
			this.stickY = this.baseY + dy / r * this.range;
		}
		else
		{
			this.stickX = e.x;
			this.stickY = e.y;
		}

		this.updateValue();
		this.requestLayout();
	}
});
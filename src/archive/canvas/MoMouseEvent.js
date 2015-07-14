MoMouseEvent = Class.create(MoEvent, {
	initialize : function($super, type, x, y, button, modifiers, bubbles, cancelable) {
		$super(type, MoValueOrDefault(bubbles, true), MoValueOrDefault(cancelable, false));

		this.modifiers = modifiers;
		this.isLeftButtonDown = (button == MoMouseButton.Left);
		this.isMiddleButtonDown = (button == MoMouseButton.Middle);
		this.isRightButtonDown = (button == MoMouseButton.Right);
		this.isXButton1Down = (button == MoMouseButton.XButton1);
		this.isXButton2Down = (button == MoMouseButton.XButton2);
		this.x = x;
		this.y = y;
		this.lastTarget = null;

		this.pos = new MoVector2D(this.x, this.y);
		this.localX = 0;
		this.localY = 0;
	},
	
	getModifierFlags : function() {
		return this.modifiers;
	},
	
	getModifierState : function(mkey) {
		return ((this.modifiers & mkey) != MoModifierKeys.None);
	},
	
	getIsAltDown : function() {
		return this.getModifierState(MoModifierKeys.Alt);
	},
	
	getIsCtrlDown : function() {
		return this.getModifierState(MoModifierKeys.Control);
	},
	
	getIsShiftDown : function() {
		return this.getModifierState(MoModifierKeys.Shift);
	},
	
	getIsMetaDown : function() {
		return this.getModifierState(MoModifierKeys.Meta);
	},
	
	getIsLeftButtonDown : function() {
		return this.isLeftButtonDown;
	},
	
	getIsRightButtonDown : function() {
		return this.isRightButtonDown;
	},
	
	getIsMiddleButtonDown : function() {
		return this.isMiddleButtonDown;
	},
	
	getIsXButton1Down : function() {
		return this.isXButton1Down;
	},
	
	getIsXButton2Down : function() {
		return this.isXButton2Down;
	},
	
	getX : function() {
		return this.x;
	},
	
	getY : function() {
		return this.y;
	},
	
	getLocalX : function() {
		if(!this.recomputeLocalPosition())
			return this.x;

		return this.localX;
	},
	
	getLocalY : function() {
		if(!this.recomputeLocalPosition())
			return this.y;
			
		return this.localY;
	},
	
	recomputeLocalPosition : function(target) {
		var target = this.currentTarget || this.target;
		
		if(MoIsNull(target))
		{
			this.lastTarget = null;
			return false;
		}

		if(target != this.lastTarget)
		{
			this.lastTarget = target;
			
			if(this.lastTarget.pointToLocal)
			{
				var pt = this.lastTarget.pointToLocal(this.pos);
				
				this.localX = pt.x;
				this.localY = pt.y;
			}
		}	
		
		return true;
	}
});

Object.extend(MoMouseEvent, {
	MOUSE_DOWN : "mouseDown",
	MOUSE_UP : "mouseUp",
	MOUSE_UP_OUTSIDE : "mouseUpOutside",
	MOUSE_ENTER : "mouseEnter",
	MOUSE_LEAVE : "mouseLeave",
	MOUSE_MOVE : "mouseMove",
	MOUSE_WHEEL : "mouseWheel",
	CLICK : "click",
	DOUBLE_CLICK : "doubleClick"
});
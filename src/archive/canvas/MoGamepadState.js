MoGamepadState = Class.create(MoEquatable, {
	initialize : function() {
		// just initialize our class members here and let the update method 
		// actually set their values so we can avoid duplicating the code and
		// making state swaps more efficient
		this.name = null;
		this.index = null;
		this.timestamp = null;
		this.isConnected = null;
		this.buttons = null;
		this.leftTrigger = null;
		this.leftTriggerRaw = null;
		this.rightTrigger = null;
		this.rightTriggerRaw = null;
		this.leftStickValue = null;
		this.leftStickValueRaw = null;
		this.rightStickValue = null;
		this.rightStickValueRaw = null;
	},
	
	getName : function() {
		return this.name;
	},
	
	getIndex : function() {
		return this.index;
	},
	
	getIsConnected : function() {
		return this.isConnected;
	},
	
	getTimestamp : function() {
		return this.timestamp;
	},
	
	getA : function() {
		return this.hasFlag(this.buttons, MoGamepadButtons.A);
	},
	
	getB : function() {
		return this.hasFlag(this.buttons, MoGamepadButtons.B);
	},
	
	getX : function() {
		return this.hasFlag(this.buttons, MoGamepadButtons.X);
	},
	
	getY : function() {
		return this.hasFlag(this.buttons, MoGamepadButtons.Y);
	},
	
	getBack : function() {
		return this.hasFlag(this.buttons, MoGamepadButtons.Back);
	},
	
	getStart : function() {
		return this.hasFlag(this.buttons, MoGamepadButtons.Start);
	},
	
	getBig : function() {
		return this.hasFlag(this.buttons, MoGamepadButtons.Big);
	},
	
	getLeftShoulder : function() {
		return this.hasFlag(this.buttons, MoGamepadButtons.LeftShoulder);
	},
	
	getRightShoulder : function() {
		return this.hasFlag(this.buttons, MoGamepadButtons.RightShoulder);
	},
	
	getLeftTrigger : function() {
		return (this.getLeftTriggerValue() > 0);
	},
	
	getLeftTriggerValue : function(raw) {
		if(raw)
			return this.leftTriggerRaw;
		
		return this.leftTrigger;
	},
	
	getRightTrigger : function() {
		return (this.getRightTriggerValue() > 0);
	},
	
	getRightTriggerValue : function(raw) {
		if(raw)
			return this.rightTriggerRaw;

		return this.rightTrigger;
	},
	
	getLeftStick : function() {
		return this.hasFlag(this.buttons, MoGamepadButtons.LeftStick);
	},
	
	getLeftStickValue : function(raw) {
		if(raw)
			return this.leftStickValueRaw;

		return this.leftStickValue;
	},
	
	getRightStick : function() {
		return this.hasFlag(this.buttons, MoGamepadButtons.RightStick);
	},
	
	getRightStickValue : function(raw) {
		if(raw)
			return this.rightStickValueRaw;
		
		return this.rightStickValue;
	},
	
	getDPadUp : function() {
		return this.hasFlag(this.buttons, MoGamepadButtons.DPadUp);
	},
	
	getDPadDown : function() {
		return this.hasFlag(this.buttons, MoGamepadButtons.DPadDown);
	},
	
	getDPadLeft : function() {
		return this.hasFlag(this.buttons, MoGamepadButtons.DPadLeft);
	},
	
	getDPadRight : function() {
		return this.hasFlag(this.buttons, MoGamepadButtons.DPadRight);
	},
	
	getLeftStickUp : function() {
		return (this.leftStickValue.y < 0);
	},
	
	getLeftStickDown : function() {
		return (this.leftStickValue.y > 0);
	},
	
	getLeftStickLeft : function() {
		return (this.leftStickValue.x < 0);
	},

	getLeftStickRight : function() {
		return (this.leftStickValue.x > 0);
	},
	
	getRightStickUp : function() {
		return (this.rightStickValue.y < 0);
	},
	
	getRightStickDown : function() {
		return (this.rightStickValue.y > 0);
	},
	
	getRightStickLeft : function() {
		return (this.rightStickValue.x < 0);
	},
	
	getRightStickRight : function() {
		return (this.rightStickValue.x > 0);
	},
	
	isDown : function(button) {
		var state = this.buttons;
		
		if(this.getLeftStickUp())
			state |= MoGamepadButtons.LeftStickUp;
		if(this.getLeftStickDown())
			state |= MoGamepadButtons.LeftStickDown;
		if(this.getLeftStickLeft())
			state |= MoGamepadButtons.LeftStickLeft;
		if(this.getLeftStickRight())
			state |= MoGamepadButtons.LeftStickRight;
			
		if(this.getRightStickUp())
			state |= MoGamepadButtons.RightStickUp;
		if(this.getRightStickDown())
			state |= MoGamepadButtons.RightStickDown;
		if(this.getRightStickLeft())
			state |= MoGamepadButtons.RightStickLeft;
		if(this.getRightStickRight())
			state |= MoGamepadButtons.RightStickRight;
			
		if(this.getLeftTrigger())
			state |= MoGamepadButtons.LeftTrigger;
		if(this.getRightTrigger())
			state |= MoGamepadButtons.RightTrigger;

		return this.hasFlag(state, button);
	},
	
	isUp : function(button) {
		return !this.isDown(button);
	},

	hasFlag : function(flags, flag) {
		return ((flags & flag) == flag);
	},
	
	filterLeftStickValue : function(x, y) {
		return this.filterStickValue(x, y, MoGamepad.getLeftStickDeadZoneMode(), MoGamepad.getLeftStickDeadZoneSize());
	},
	
	filterRightStickValue : function(x, y) {
		return this.filterStickValue(x, y, MoGamepad.getRightStickDeadZoneMode(), MoGamepad.getRightStickDeadZoneSize());
	},

	filterStickValue : function(x, y, deadZoneMode, deadZoneSize) {
		if(deadZoneMode == MoGamepadDeadZoneMode.Circular)
		{
			var magnitude = Math.sqrt(x * x + y * y);
			var value = this.filterValue(magnitude, deadZoneSize);
			var normalized = (value > 0 ? value / magnitude : 0);
			
			return new MoVector2D(
				MoMath.clamp(x * normalized, -1.0, 1.0),
				MoMath.clamp(y * normalized, -1.0, 1.0));
		}

		if(deadZoneMode == MoGamepadDeadZoneMode.None)
			deadZoneSize = 0;

		return new MoVector2D(
			this.filterValue(x, deadZoneSize), 
			this.filterValue(y, deadZoneSize));
	},
	
	filterTriggerValue : function(value) {
		if(MoGamepad.getTriggerDeadZoneMode() != MoGamepadDeadZoneMode.None)
			return this.filterValue(value, MoGamepad.getTriggerDeadZoneSize());

		return this.filterValue(value, 0);
	},
	
	filterValue : function(value, size) {
		if(value < -size)
			value += size;
		else
		{
			if(value <= size)
				return 0;
			
			value -= size;
		}

		return MoMath.clamp(value / (1.0 - size), -1.0, 1.0);
	},
	
	update : function(name, index, timestamp, isConnected, buttons, leftStickValue, rightStickValue, leftTrigger, rightTrigger) {
		this.name = MoValueOrDefault(name, "");
		this.index = index;
		this.timestamp = timestamp;
		this.isConnected = isConnected;
		this.buttons = buttons;		

		this.leftTrigger = MoMath.clamp(this.filterTriggerValue(leftTrigger), 0, 1);
		this.leftTriggerRaw = MoMath.clamp(leftTrigger, 0, 1);
		this.rightTrigger = MoMath.clamp(this.filterTriggerValue(rightTrigger), 0, 1);
		this.rightTriggerRaw = MoMath.clamp(rightTrigger, 0, 1);
		
		this.leftStickValue = this.filterLeftStickValue(leftStickValue.x, leftStickValue.y);
		this.leftStickValueRaw = MoVector2D.Zero();
		this.leftStickValueRaw.x = MoMath.clamp(leftStickValue.x, -1, 1);
		this.leftStickValueRaw.y = MoMath.clamp(leftStickValue.y, -1, 1);

		this.rightStickValue = this.filterRightStickValue(rightStickValue.x, rightStickValue.y);
		this.rightStickValueRaw = MoVector2D.Zero();
		this.rightStickValueRaw.x = MoMath.clamp(rightStickValue.x, -1, 1);
		this.rightStickValueRaw.y = MoMath.clamp(rightStickValue.y, -1, 1);
	},

	copy : function() {
		var c = new MoGamepadState();
		c.update(this.name, this.index, this.timestamp, this.isConnected, this.buttons, this.leftStickValue, this.rightStickValue, this.leftTrigger, this.rightTrigger);
		return c;
	},

	copyFrom : function(other) {
		this.name = other.name;
		this.index = other.index;
		this.timestamp = other.timestamp;
		this.isConnected = other.isConnected;
		this.buttons = other.buttons;
		this.leftTrigger = other.leftTrigger;
		this.leftTriggerRaw = other.leftTriggerRaw;
		this.rightTrigger = other.rightTrigger;
		this.rightTriggerRaw = other.rightTriggerRaw;
		this.leftStickValue.x = other.leftStickValue.x;
		this.leftStickValue.y = other.leftStickValue.y;
		this.leftStickValueRaw.x = other.leftStickValueRaw.x;
		this.leftStickValueRaw.y = other.leftStickValueRaw.y;
		this.rightStickValue.x = other.rightStickValue.x;
		this.rightStickValue.y = other.rightStickValue.y;
		this.rightStickValueRaw.x = other.rightStickValueRaw.x;
		this.rightStickValueRaw.y = other.rightStickValueRaw.y;
	}
});
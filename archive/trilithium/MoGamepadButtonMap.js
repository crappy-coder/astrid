MoGamepadButtonMap = Class.create({
	initialize : function(map) {
		this.map = MoValueOrDefault(map, []);

		// just default to 32 available slots
		if(MoIsNull(map))
		{
			for(var i = 0; i < 32; ++i)
				this.map.push(MoGamepadButtons.None);
		}
	},
	
	indexOf : function(button) {
		if(button == MoGamepadButtons.None)
			return -1;

		for(var i = 0, len = this.map.length; i < len; ++i)
		{
			if(this.map[i] === button)
				return i;
		}

		return -1;
	},
	
	get : function(index) {
		if(this.isValidIndex(index))
			return this.map[index];
		
		return MoGamepadButtons.None;
	},
	
	add : function(button, index) {
		button = MoValueOrDefault(button, MoGamepadButtons.None);

		if(this.isValidIndex(index))
			this.map[index] = button;
	},

	remove : function(index) {
		if(this.isValidIndex(index))
			this.map[index] = MoGamepadButtons.None;
	},

	isValidIndex : function(index) {
		return (index >= 0 && index < this.map.length);
	}
});

Object.extend(MoGamepadButtonMap, {
	XBOX360 : new MoGamepadButtonMap([
		MoGamepadButtons.A, MoGamepadButtons.B, 
		MoGamepadButtons.X, MoGamepadButtons.Y,
		MoGamepadButtons.LeftShoulder, MoGamepadButtons.RightShoulder,
		MoGamepadButtons.None, MoGamepadButtons.None, // triggers are processed independantly
		MoGamepadButtons.Back, MoGamepadButtons.Start,
		MoGamepadButtons.LeftStick, MoGamepadButtons.RightStick,
		MoGamepadButtons.DPadUp, MoGamepadButtons.DPadDown,
		MoGamepadButtons.DPadLeft, MoGamepadButtons.DPadRight
	]),

	PS3 : new MoGamepadButtonMap([
		MoGamepadButtons.A, MoGamepadButtons.B, 
		MoGamepadButtons.X, MoGamepadButtons.Y,
		MoGamepadButtons.LeftShoulder, MoGamepadButtons.RightShoulder,
		MoGamepadButtons.None, MoGamepadButtons.None, // triggers are processed independantly
		MoGamepadButtons.Back, MoGamepadButtons.Start,
		MoGamepadButtons.LeftStick, MoGamepadButtons.RightStick,
		MoGamepadButtons.DPadUp, MoGamepadButtons.DPadDown,
		MoGamepadButtons.DPadLeft, MoGamepadButtons.DPadRight
	])
});
MoKeyEvent = Class.create(MoEvent, {
	initialize : function($super, type, key, isDown, isRepeat, modifierKeys, charCode, bubbles, cancelable) {
		$super(type, MoValueOrDefault(bubbles, true), MoValueOrDefault(cancelable, true));

		/** Boolean **/
		this.isDown = MoValueOrDefault(isDown, false);

		/** Boolean **/
		this.isUp = MoValueOrDefault(!isDown, false);

		/** Boolean **/
		this.isRepeat = MoValueOrDefault(isRepeat, false);

		/** Number **/
		this.keyCode = key;

		/** Number **/
		this.charCode = MoValueOrDefault(charCode, -1);

		/** MoKey **/
		this.key = (this.keyCode != 0 ? MoKey.fromKeyCode(this.keyCode) : MoKey.fromCharCode(this.charCode));

		/** MoModifierKeys **/
		this.modifierKeys = MoValueOrDefault(modifierKeys, MoModifierKeys.None);
	},

	getIsDown : function() {
		return this.isDown;
	},

	getIsUp : function() {
		return this.isUp;
	},
	
	getIsRepeat : function() {
		return this.isRepeat;
	},
	
	getKeyCode : function() {
		return this.keyCode;
	},

	getCharCode : function() {
		return this.charCode;
	},

	getKey : function() {
		return this.key;
	},
	
	getModifierKeys : function() {
		return this.modifierKeys;
	},
	
	getIsAltKeyDown : function() {
		return this.readModifierFlag(MoModifierKeys.Alt);
	},
	
	getIsControlKeyDown : function() {
		return this.readModifierFlag(MoModifierKeys.Control);
	},
	
	getIsShiftKeyDown : function() {
		return this.readModifierFlag(MoModifierKeys.Shift);
	},
	
	getIsMetaKeyDown : function() {
		return this.readModifierFlag(MoModifierKeys.Meta);
	},
	
	readModifierFlag : function(flag) {
		return ((this.modifierKeys & flag) == flag);
	},

	toString : function() {
		var keyStr = "None";

		for(var s in MoKey)
		{
			if(MoKey[s] == this.key)
			{
				keyStr = s;
				break;
			}
		}

		return String.format("KeyEvent[ keyCode=#{0}, charCode=#{1}, key=#{2}, altKeyDown=#{3}, ctrlKeyDown=#{4}, shiftKeyDown=#{5}, metaKeyDown=#{6}, isDown=#{7}, isRepeat=#{8}",
			this.keyCode, this.charCode, keyStr, this.getIsAltKeyDown(), this.getIsControlKeyDown(), this.getIsShiftKeyDown(), this.getIsMetaKeyDown(), this.getIsDown(), this.getIsRepeat());
	}
});

Object.extend(MoKeyEvent, {
	KEY_DOWN : "keyDown",
	KEY_UP : "keyUp",
	KEY_PRESS : "keyPress"
});

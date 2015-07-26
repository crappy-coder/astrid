MoModifierKeys = {
	"None"		: 0,
	"Alt"		: 1,
	"Control"	: 2,
	"Shift"		: 4,
	"Meta"		: 8,
	
	fromValues : function(alt, ctrl, shift, meta) {
		var bits = MoModifierKeys.None;
		
		if(alt)
			bits |= MoModifierKeys.Alt;
		
		if(ctrl)
			bits |= MoModifierKeys.Control;
		
		if(shift)
			bits |= MoModifierKeys.Shift;
		
		if(meta)
			bits |= MoModifierKeys.Meta;
		
		return bits;
	}
};
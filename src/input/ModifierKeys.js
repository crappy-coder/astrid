var ModifierKeys = {
	"None": 0,
	"Alt": 1,
	"Control": 2,
	"Shift": 4,
	"Meta": 8,

	fromValues: function (alt, ctrl, shift, meta) {
		var bits = ModifierKeys.None;

		if (alt) {
			bits |= ModifierKeys.Alt;
		}

		if (ctrl) {
			bits |= ModifierKeys.Control;
		}

		if (shift) {
			bits |= ModifierKeys.Shift;
		}

		if (meta) {
			bits |= ModifierKeys.Meta;
		}

		return bits;
	}
};

export default ModifierKeys;

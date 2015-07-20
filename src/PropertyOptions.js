var PropertyOptions = {
	None					: (1 << 0)-1,
	AffectsMeasure			: (1 << 0),
	AffectsLayout			: (1 << 1),
	AffectsParentMeasure	: (1 << 2),
	AffectsParentLayout		: (1 << 3),
	AffectsRender			: (1 << 4)
};

export default PropertyOptions;

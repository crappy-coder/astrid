MoMatrixTransform = Class.create(MoTransform, {
	initialize : function($super, matrix) {
		$super();

		this.tmp = new MoMatrix2D();
		this.setMatrix(MoValueOrDefault(matrix, new MoMatrix2D()));
	},
	
	initializeAnimatablePropertiesCore : function($super) {
		$super();
		
		this.enableAnimatableProperty("matrix", this.getMatrix, this.setMatrix, MoPropertyOptions.AffectsLayout | MoPropertyOptions.AffectsMeasure);
	},
	
	getValue : function() {
		this.tmp.copyFrom(this.getMatrix());

		return this.tmp;
	},
	
	getMatrix : function() {
		return this.getPropertyValue("matrix");
	},

	setMatrix : function(value) {
		this.setPropertyValue("matrix", value);
	},

	isEqualTo : function(other) {
		return (MoAreEqual(this.getMatrix(), other.getMatrix()));
	}
});
	
MoDashStyle = Class.create({
	initialize : function(dashes, offset) {
	
		/** Number[] **/
		this.dashes = MoValueOrDefault(dashes, new Array());
		
		/** Number **/
		this.offset = MoValueOrDefault(offset, 0);
	},
	
	getDashes : function() {
		return this.dashes;
	},
	
	setDashes : function(value) {
		this.dashes = value;
	},
	
	getOffset : function() {
		return this.offset;
	},
	
	setOffset : function(value) {
		this.offset = value;
	}
});

Object.extend(MoDashStyle, {

	// ----
	Solid : new MoDashStyle(),
	
	// * * * *
	Dot : new MoDashStyle(new Array(1, 2), 0),
	
	// - - - -
	Dash : new MoDashStyle(new Array(2, 2), 2),
	
	// - * - * - * -
	DashDot : new MoDashStyle(new Array(2, 2, 1, 2), 1),
	
	// - * * - * * -
	DashDotDot : new MoDashStyle(new Array(2, 2, 1, 2, 1, 2, 1), 1)
});
MoTransform = Class.create(MoEventDispatcher, MoAnimatable, {
	initialize : function($super) {		
		$super();
		
		/** MoMatrix2D **/
		this.identity = MoMatrix2D.createIdentity();
		
		this.initializeAnimatableProperties();
	},
	
	getValue : function() {
		/** override **/
		return this.identity;
	},
	
	transformPoint : function(point) {
		return this.getValue().transformPoint(point);
	},
	
	transformRect : function(rect) {
		return this.getValue().transformRect(rect);
	}
});
	
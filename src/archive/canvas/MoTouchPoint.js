MoTouchPoint = Class.create(MoEquatable, {
	initialize : function($super, id, sceneX, sceneY) {
		$super();
		
		this.id = id;
		this.sceneX = sceneX;
		this.sceneY = sceneY;
	},
	
	getId : function() {
		return this.id;
	},
	
	getSceneX : function() {
		return this.sceneX;
	},
	
	getSceneY : function() {
		return this.sceneY;
	},
	
	isEqualTo : function($super, other) {
		return ($super(other) &&
				 this.id == other.id &&
				 this.sceneX == other.sceneX &&
				 this.sceneY == other.sceneY);
	}
});
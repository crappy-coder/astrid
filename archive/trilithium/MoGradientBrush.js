MoGradientBrush = Class.create(MoBrush, {
	initialize : function($super) {
		$super();
		
		this.setColorStops(new Array());
	},
	
	initializeAnimatablePropertiesCore : function($super) {
		$super();
		
		this.enableAnimatableProperty("colorStops", this.getColorStops, this.setColorStops, MoPropertyOptions.AffectsLayout);
	},
	
	getColorStops : function() {
		return this.getPropertyValue("colorStops");
	},

	setColorStops : function(value) {
		if(value == null)
			value = new Array();

		this.setPropertyValue("colorStops", value);
	},
	
	getColorStopCount : function() {
		return this.getColorStops().length;
	},

	getColorStop : function(index) {
		return this.getColorStops()[index];
	},

	addColorStop : function(value) {		
		var stops = this.getColorStops();
		stops.push(value);

		this.setColorStops(stops);
	},
	
	clearColorStops : function() {
		this.setColorStops(null);
	},

	isEqualTo : function($super, other) {
		if($super(other) &&  this.getColorStopCount() == other.getColorStopCount())
		{
			var len = this.getColorStopCount();
			var stopA = null;
			var stopB = null;
			
			for(var i = 0; i < len; ++i)
			{
				stopA = this.getColorStop(i);
				stopB = other.getColorStop(i);

				if(stopA.isNotEqualTo(stopB))
					return false;
			}
			
			return true;
		}

		return false;
	}
});
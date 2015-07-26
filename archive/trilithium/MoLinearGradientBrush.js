MoLinearGradientBrush = Class.create(MoGradientBrush, {
	initialize : function($super) {
		$super();

		this.setStartPoint(new MoVector2D(0, 0));
		this.setEndPoint(new MoVector2D(1, 1));
	},
	
	initializeAnimatablePropertiesCore : function($super) {
		$super();
		
		this.enableAnimatableProperty("startPoint", this.getStartPoint, this.setStartPoint);
		this.enableAnimatableProperty("endPoint", this.getEndPoint, this.setEndPoint);
	},

	getStartPoint : function() {
		return this.getPropertyValue("startPoint");
	},
	
	setStartPoint : function(value) {
		this.setPropertyValue("startPoint", value);
	},

	getEndPoint : function() {
		return this.getPropertyValue("endPoint");
	},

	setEndPoint : function(value) {
		this.setPropertyValue("endPoint", value);
	},
	
	isEqualTo : function($super, other) {
		return ($super(other) &&
				MoAreEqual(this.getStartPoint(), other.getStartPoint()) &&
				MoAreEqual(this.getEndPoint(), other.getEndPoint()));
	}
});

Object.extend(MoLinearGradientBrush, {

	computeStartPointFromAngle : function(angle) {		
		return MoMath.pointOfAngle(
			MoMath.degreesToRadians(180-(angle % 360))).normalizeZero();
	},

	computeEndPointFromAngle : function(angle) {
		return MoMath.pointOfAngle(
			MoMath.degreesToRadians(360-(angle % 360))).normalizeZero();
	},

	fromGradientStops : function(stops) {
		var brush = new MoLinearGradientBrush();
		brush.setColorStops(stops);
		
		return brush;
	},
	
	fromGradientStopsWithAngle : function(stops, angle) {
		var brush = MoLinearGradientBrush.fromGradientStops(stops);
		brush.setStartPoint(MoLinearGradientBrush.computeStartPointFromAngle(angle));
		brush.setEndPoint(MoLinearGradientBrush.computeEndPointFromAngle(angle));
		
		return brush;
	},

	fromColorsWithAngle : function(startColor, endColor, angle) {
		var stops = new Array(
			new MoGradientStop(startColor, 0), 
			new MoGradientStop(endColor, 1));
			
		return MoLinearGradientBrush.fromGradientStopsWithAngle(stops, angle);
	}
});
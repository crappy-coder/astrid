MoDropShadowEffect = Class.create(MoEffect, {
	initialize : function($super, direction, depth, blurRadius, color) {		
		$super();
		
		this.setDirection(MoValueOrDefault(direction, 315));
		this.setBlurRadius(MoValueOrDefault(blurRadius, 5));
		this.setDepth(MoValueOrDefault(depth, 5));
		this.setColor(MoValueOrDefault(color, MoColor.Black));

		this.shadowCanvas = document.createElement("canvas");
		this.shadowContext = this.shadowCanvas.getContext("2d");
	},
	
	initializeAnimatablePropertiesCore : function($super) {
		$super();

		this.enableAnimatableProperty("direction", this.getDirection, this.setDirection, MoPropertyOptions.AffectsRender);
		this.enableAnimatableProperty("blurRadius", this.getBlurRadius, this.setBlurRadius, MoPropertyOptions.AffectsRender);
		this.enableAnimatableProperty("depth", this.getDepth, this.setDepth, MoPropertyOptions.AffectsRender);
		this.enableAnimatableProperty("color", this.getColor, this.setColor, MoPropertyOptions.AffectsRender);
	},

	getDirection : function() {
		return this.getPropertyValue("direction");
	},
	
	setDirection : function(value) {
		this.setPropertyValue("direction", value);
	},
	
	getBlurRadius : function() {
		return this.getPropertyValue("blurRadius");
	},
	
	setBlurRadius : function(value) {
		this.setPropertyValue("blurRadius", value);
	},
	
	getDepth : function() {
		return this.getPropertyValue("depth");
	},
	
	setDepth : function(value) {
		this.setPropertyValue("depth", value);
	},
	
	getColor : function() {
		return this.getPropertyValue("color");
	},
	
	setColor : function(value) {
		this.setPropertyValue("color", value);
	},

	getRenderBounds : function(contentRect) {
		var r = this.getBlurRadius();
		var d = this.getDepth();
		var dir = MoMath.degreesToRadians(this.getDirection());
		var p1 = new MoVector2D(contentRect.x - r, contentRect.y - r);
		var p2 = new MoVector2D(contentRect.bottomRight().x + r, contentRect.bottomRight().y + r);
		var x = d * Math.cos(dir);
		var y = d * Math.sin(dir);
		
		if(x >= 0)
			p2.x += x;
		else
			p1.x += x;

		if(y >= 0)
			p1.y -= y;
		else
			p2.y -= y;
		
		return MoRectangle.fromPoints(p1, p2);
	},
	
	processCore : function(target, pixelData) {
		var canvas = this.shadowCanvas;
		var ctx = this.shadowContext;	
		var dir = MoMath.degreesToRadians(-this.getDirection());
		var depth = this.getDepth();
		var x = depth * Math.cos(dir);
		var y = depth * Math.sin(dir);

		canvas.width = pixelData.width;
		canvas.height = pixelData.height;

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.save();
		ctx.shadowOffsetX = x;
		ctx.shadowOffsetY = y;
		ctx.shadowBlur = this.getBlurRadius();
		ctx.shadowColor = this.getColor().toRGBAString();
		ctx.drawImage(this.getEffectCanvas(), 0, 0);
		ctx.restore();

		return MoGraphicsUtil.getImageData(ctx, 0, 0, pixelData.width, pixelData.height, true);
	}
});
	
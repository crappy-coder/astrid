MoColorEffect = Class.create(MoEffect, {
	initialize : function($super, redScale, redOffset, greenScale, greenOffset, blueScale, blueOffset, alphaScale, alphaOffset) {
		$super();
		
		this.setRedScale(MoValueOrDefault(redScale, 1));
		this.setRedOffset(MoValueOrDefault(redOffset, 0));

		this.setGreenScale(MoValueOrDefault(greenScale, 1));
		this.setGreenOffset(MoValueOrDefault(greenOffset, 0));

		this.setBlueScale(MoValueOrDefault(blueScale, 1));
		this.setBlueOffset(MoValueOrDefault(blueOffset, 0));

		this.setAlphaScale(MoValueOrDefault(alphaScale, 1));
		this.setAlphaOffset(MoValueOrDefault(alphaOffset, 0));
	},

	initializeAnimatablePropertiesCore : function($super) {
		$super();

		this.enableAnimatableProperty("redScale", this.getRedScale, this.setRedScale, MoPropertyOptions.AffectsRender);
		this.enableAnimatableProperty("greenScale", this.getGreenScale, this.setGreenScale, MoPropertyOptions.AffectsRender);
		this.enableAnimatableProperty("blueScale", this.getBlueScale, this.setBlueScale, MoPropertyOptions.AffectsRender);
		this.enableAnimatableProperty("alphaScale", this.getAlphaScale, this.setAlphaScale, MoPropertyOptions.AffectsRender);
		this.enableAnimatableProperty("redOffset", this.getRedOffset, this.setRedOffset, MoPropertyOptions.AffectsRender);
		this.enableAnimatableProperty("greenOffset", this.getGreenOffset, this.setGreenOffset, MoPropertyOptions.AffectsRender);
		this.enableAnimatableProperty("blueOffset", this.getBlueOffset, this.setBlueOffset, MoPropertyOptions.AffectsRender);
		this.enableAnimatableProperty("alphaOffset", this.getAlphaOffset, this.setAlphaOffset, MoPropertyOptions.AffectsRender);
	},
	
	getRedScale : function() {
		return this.getPropertyValue("redScale");
	},
	
	setRedScale : function(value) {
		this.setPropertyValue("redScale", value);
	},
	
	getGreenScale : function() {
		return this.getPropertyValue("greenScale");
	},
	
	setGreenScale : function(value) {
		this.setPropertyValue("greenScale", value);
	},
	
	getBlueScale : function() {
		return this.getPropertyValue("blueScale");
	},
	
	setBlueScale : function(value) {
		this.setPropertyValue("blueScale", value);
	},
	
	getAlphaScale : function() {
		return this.getPropertyValue("alphaScale");
	},
	
	setAlphaScale : function(value) {
		this.setPropertyValue("alphaScale", value);
	},
	
	getRedOffset : function() {
		return this.getPropertyValue("redOffset");
	},
	
	setRedOffset : function(value) {
		this.setPropertyValue("redOffset", value);
	},
	
	getGreenOffset : function() {
		return this.getPropertyValue("greenOffset");
	},
	
	setGreenOffset : function(value) {
		this.setPropertyValue("greenOffset", value);
	},
	
	getBlueOffset : function() {
		return this.getPropertyValue("blueOffset");
	},
	
	setBlueOffset : function(value) {
		this.setPropertyValue("blueOffset", value);
	},
	
	getAlphaOffset : function() {
		return this.getPropertyValue("alphaOffset");
	},
	
	setAlphaOffset : function(value) {
		this.setPropertyValue("alphaOffset", value);
	},
	
	processCore : function(target, pixelData) {
		var data = pixelData.data;
		var len = data.length;
		
		for(var i = 0; i < len; i += 4)
		{
			data[i + 0] = data[i + 0] * this.getRedScale() + this.getRedOffset();
			data[i + 1] = data[i + 1] * this.getGreenScale() + this.getGreenOffset();
			data[i + 2] = data[i + 2] * this.getBlueScale() + this.getBlueOffset();
			data[i + 3] = data[i + 3] * this.getAlphaScale() + this.getAlphaOffset();
		}
		
		return pixelData;
	}
});
	
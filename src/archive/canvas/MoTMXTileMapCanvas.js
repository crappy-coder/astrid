MoTMXTileMapCanvas = Class.create(MoCanvas, {
	initialize : function($super, name, mapData) {
		$super(name);
		
		this.tmxData = MoValueOrDefault(mapData, null);
		this.setIsHitTestVisible(false);
	},
	
	getMapData : function() {
		return this.tmxData;
	},

	setMapData : function(value) {
		this.tmxData = value;
		this.reset();
	},
	
	reset : function() {
		this.clear();

		if(MoIsNull(this.tmxData))
			return;

		this.setWidth(this.tmxData.getPixelWidth());
		this.setHeight(this.tmxData.getPixelHeight());

		var len = this.tmxData.getLayers().length;
		var layer = null;
		
		for(var i = 0; i < len; i++)
		{
			layer = this.tmxData.getLayers()[i];

			if(layer.getVisible())
				this.addLayer(layer);
		}
	},

	addLayer : function(layerInfo) {
		var tileset = this.tmxData.getLayerTileSet(layerInfo)
		
		if(tileset == null)
			return;
		
		this.add(new MoTMXTileMapLayerCanvas(this.tmxData, layerInfo, tileset));
	}
});
MoTMXTileMapLayerTile = Class.create({
	initialize : function(tileId, tileRect, tilePosition) {
		this.tileId = tileId;
		this.tileRect = tileRect;
		this.tilePosition = tilePosition;
	}
});

MoTMXTileMapLayerCanvas = Class.create(MoCanvas, {
	initialize : function($super, mapInfo, layerInfo, tilesetInfo) {
		$super(layerInfo.getName());

		this.mapInfo = mapInfo;
		this.layerInfo = layerInfo;
		this.tilesetInfo = tilesetInfo;
		this.tiles = new Array();
		this.texture = MoTextureSource.fromFile(this.getTileSet().getImageSource());
		this.hasTiles = false;
		
		this.setIsHitTestVisible(false);
		this.setAlpha(layerInfo.getOpacity());
		this.initializeTiles();
	},
	
	getTileSet : function() {
		return this.tilesetInfo;
	},

	getLayer : function() {
		return this.layerInfo;
	},
	
	initializeTiles : function() {

		this.setWidth(this.mapInfo.getPixelWidth());
		this.setHeight(this.mapInfo.getPixelHeight());

		if(this.texture.getIsSourceReady())
		{
			var layer = this.getLayer();
			var tileset = this.getTileSet();

			this.tiles.clear();
		
			for(var x = 0; x < this.mapInfo.getWidth(); x++)
			{
				for(var y = 0; y < this.mapInfo.getHeight(); y++)
				{
					var idx = x + this.mapInfo.getWidth() * y;
					var tileId = layer.getTiles()[idx];
					
					if(tileId == 0)
						continue;

					var tileRect = this.getTileRect(tileId);
					var tilePosition = this.getTilePixelPosition(x, y);

					this.tiles.push(new MoTMXTileMapLayerTile(tileId, tileRect, tilePosition));
				}
			}

			this.texture.removeEventHandler(MoSourceEvent.READY, this.handleTextureSourceReadyEvent.asDelegate(this));
			this.hasTiles = true;
			this.requestLayout();
		}
		else
		{		
			this.texture.addEventHandler(MoSourceEvent.READY, this.handleTextureSourceReadyEvent.asDelegate(this));
		}
	},

	handleTextureSourceReadyEvent : function(event) {
		if(!this.hasTiles)
			this.initializeTiles();
	},

	getTileRect : function(tileId) {
		var tileset = this.getTileSet();
		var rect = new MoRectangle(0, 0, tileset.getTileWidth(), tileset.getTileHeight());
		var rowWidth = Math.floor((this.texture.getWidth() - (tileset.getMargin() * 2) + tileset.getSpacing()) / (tileset.getTileWidth() + tileset.getSpacing()));
		var adjustedTileId = tileId - tileset.getFirstGID();

		rect.x = Math.floor(adjustedTileId % rowWidth) * (tileset.getTileWidth() + tileset.getSpacing()) + tileset.getMargin();
		rect.y = Math.floor(adjustedTileId / rowWidth) * (tileset.getTileHeight() + tileset.getSpacing()) + tileset.getMargin();

		return rect;
	},

	getTilePixelPosition : function(col, row) {
		var pos = new MoVector2D.Zero();
		var width = this.mapInfo.getWidth();
		var height = this.mapInfo.getHeight();
		var tileWidth = this.mapInfo.getTileWidth();
		var tileHeight = this.mapInfo.getTileHeight();

		switch(this.mapInfo.getOrientation())
		{
			case MoTMXTileMap.TYPE_ORTHOGONAL:
				pos.x = col * tileWidth;
				pos.y = row * tileHeight;
				break;
			case MoTMXTileMap.TYPE_ISOMETRIC:
				pos.x = (col - row) * tileWidth / 2 + (height * tileWidth / 2);
				pos.y = (col + row) * tileHeight / 2;
				break;
			case MoTMXTileMap.TYPE_HEXAGONAL:
				pos.x = col * tileWidth * 0.75;
				pos.y = row * tileHeight + ((col % 2) == 1 ? tileHeight * 0.5 : 0);
				break;
		}

		return pos;
	},

	layout : function($super, unscaledWidth, unscaledHeight) {
		$super(unscaledWidth, unscaledHeight);
		
		if(!this.hasTiles)
			return;

		var gfx = this.getGraphics();
		var len = this.tiles.length;
		var tile = null;
		
		for(var i = 0; i < len; i++)
		{
			tile = this.tiles[i];

			gfx.drawImageComplex(
				this.texture, 
				tile.tileRect.x,
				tile.tileRect.y,
				tile.tileRect.width,
				tile.tileRect.height,
				tile.tilePosition.x,
				tile.tilePosition.y,
				tile.tileRect.width,
				tile.tileRect.height);
		}
	}
});
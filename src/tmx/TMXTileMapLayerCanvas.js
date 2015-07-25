import Canvas from "./../Canvas";
import TextureSource from "./../TextureSource";
import SourceEvent from "./../SourceEvent";
import Rectangle from "./../Rectangle.js";
import Vector2D from "./../math/Vector2D";
import TMXTileMap from "./TMXTileMap";

class TMXTileMapLayerTile {
	constructor(tileId, tileRect, tilePosition) {
		this.tileId = tileId;
		this.tileRect = tileRect;
		this.tilePosition = tilePosition;
	}
}

class TMXTileMapLayerCanvas extends Canvas {
	constructor(mapInfo, layerInfo, tilesetInfo) {
		super(layerInfo.getName());

		this.mapInfo = mapInfo;
		this.layerInfo = layerInfo;
		this.tilesetInfo = tilesetInfo;
		this.tiles = [];
		this.texture = TextureSource.fromFile(this.getTileSet().getImageSource());
		this.hasTiles = false;

		this.setIsHitTestVisible(false);
		this.setAlpha(layerInfo.getOpacity());
		this.initializeTiles();
	}

	getTileSet() {
		return this.tilesetInfo;
	}

	getLayer() {
		return this.layerInfo;
	}

	initializeTiles() {

		this.setWidth(this.mapInfo.getPixelWidth());
		this.setHeight(this.mapInfo.getPixelHeight());

		if (this.texture.getIsSourceReady()) {
			var layer = this.getLayer();

			this.tiles.clear();

			for (var x = 0; x < this.mapInfo.getWidth(); x++) {
				for (var y = 0; y < this.mapInfo.getHeight(); y++) {
					var idx = x + this.mapInfo.getWidth() * y;
					var tileId = layer.getTiles()[idx];

					if (tileId == 0) {
						continue;
					}

					var tileRect = this.getTileRect(tileId);
					var tilePosition = this.getTilePixelPosition(x, y);

					this.tiles.push(new TMXTileMapLayerTile(tileId, tileRect, tilePosition));
				}
			}

			this.texture.removeEventHandler(SourceEvent.READY, this.handleTextureSourceReadyEvent.asDelegate(this));
			this.hasTiles = true;
			this.requestLayout();
		}
		else {
			this.texture.addEventHandler(SourceEvent.READY, this.handleTextureSourceReadyEvent.asDelegate(this));
		}
	}

	handleTextureSourceReadyEvent(event) {
		if (!this.hasTiles) {
			this.initializeTiles();
		}
	}

	getTileRect(tileId) {
		var tileset = this.getTileSet();
		var rect = new Rectangle(0, 0, tileset.getTileWidth(), tileset.getTileHeight());
		var rowWidth = Math.floor((this.texture.getWidth() - (tileset.getMargin() * 2) + tileset.getSpacing()) /
				(tileset.getTileWidth() + tileset.getSpacing()));
		var adjustedTileId = tileId - tileset.getFirstGID();

		rect.x = Math.floor(adjustedTileId % rowWidth) * (tileset.getTileWidth() + tileset.getSpacing()) +
				tileset.getMargin();
		rect.y = Math.floor(adjustedTileId / rowWidth) * (tileset.getTileHeight() + tileset.getSpacing()) +
				tileset.getMargin();

		return rect;
	}

	getTilePixelPosition(col, row) {
		var pos = new Vector2D.Zero();
		var height = this.mapInfo.getHeight();
		var tileWidth = this.mapInfo.getTileWidth();
		var tileHeight = this.mapInfo.getTileHeight();

		switch (this.mapInfo.getOrientation()) {
			case TMXTileMap.TYPE_ORTHOGONAL:
				pos.x = col * tileWidth;
				pos.y = row * tileHeight;
				break;
			case TMXTileMap.TYPE_ISOMETRIC:
				pos.x = (col - row) * tileWidth / 2 + (height * tileWidth / 2);
				pos.y = (col + row) * tileHeight / 2;
				break;
			case TMXTileMap.TYPE_HEXAGONAL:
				pos.x = col * tileWidth * 0.75;
				pos.y = row * tileHeight + ((col % 2) == 1 ? tileHeight * 0.5 : 0);
				break;
		}

		return pos;
	}

	layout(unscaledWidth, unscaledHeight) {
		super.layout(unscaledWidth, unscaledHeight);

		if (!this.hasTiles) {
			return;
		}

		var gfx = this.getGraphics();
		var len = this.tiles.length;
		var tile = null;

		for (var i = 0; i < len; i++) {
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
					tile.tileRect.height
			);
		}
	}
}

export default TMXTileMapLayerCanvas;

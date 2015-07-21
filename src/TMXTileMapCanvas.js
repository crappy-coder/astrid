import Canvas from "./Canvas";
import { ValueOrDefault } from "./Engine";
import TMXTileMapLayerCanvas from "./TMXTileMapLayerCanvas";

class TMXTileMapCanvas extends Canvas {
	constructor(name, mapData) {
		super(name);

		this.tmxData = ValueOrDefault(mapData, null);
		this.setIsHitTestVisible(false);
	}

	getMapData() {
		return this.tmxData;
	}

	setMapData(value) {
		this.tmxData = value;
		this.reset();
	}

	reset() {
		this.clear();

		if (this.tmxData == null) {
			return;
		}

		this.setWidth(this.tmxData.getPixelWidth());
		this.setHeight(this.tmxData.getPixelHeight());

		var len = this.tmxData.getLayers().length;
		var layer = null;

		for (var i = 0; i < len; i++) {
			layer = this.tmxData.getLayers()[i];

			if (layer.getVisible()) {
				this.addLayer(layer);
			}
		}
	}

	addLayer(layerInfo) {
		var tileset = this.tmxData.getLayerTileSet(layerInfo);

		if (tileset == null) {
			return;
		}

		this.add(new TMXTileMapLayerCanvas(this.tmxData, layerInfo, tileset));
	}
}

export default TMXTileMapCanvas;

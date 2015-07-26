import EventDispatcher from "../EventDispatcher";
import { CreateHttpRequestObject, DebugWrite, DebugLevel } from "../Engine";
import Dictionary from "../Dictionary";

class TMXTileMap extends EventDispatcher {
	constructor() {
		super();

		this.tileSets = [];
		this.objectGroups = [];
		this.layers = [];
		this.properties = null;
		this.filePath = "";
		this.basePath = "";
		this.orientation = "";
		this.version = "";
		this.width = 0;
		this.height = 0;
		this.tileWidth = 0;
		this.tileHeight = 0;
	}

	getTileSets() {
		return this.tileSets;
	}

	getObjectGroups() {
		return this.objectGroups;
	}

	getLayers() {
		return this.layers;
	}

	getProperties() {
		return this.properties;
	}

	getFilePath() {
		return this.filePath;
	}

	getOrientation() {
		return this.orientation;
	}

	getVersion() {
		return this.version;
	}

	getWidth() {
		return this.width;
	}

	getHeight() {
		return this.height;
	}

	getTileWidth() {
		return this.tileWidth;
	}

	getTileHeight() {
		return this.tileHeight;
	}

	getPixelWidth() {
		return this.getWidth() * this.getTileWidth();
	}

	getPixelHeight() {
		return this.getHeight() * this.getTileHeight();
	}

	getLayerTileSet(layer) {
		var tileset = null;
		var len = this.tileSets.length;

		for (var i = len - 1; i >= 0; i--) {
			tileset = this.tileSets[i];

			for (var x = 0; x < this.width; x++) {
				for (var y = 0; y < this.height; y++) {
					var idx = x + this.width * y;
					var id = layer.getTiles()[idx];

					if (id != 0) {
						if (id >= tileset.getFirstGID()) {
							return tileset;
						}
					}
				}
			}
		}

		return null;
	}

	static load(tmxXmlFilePath, readyCallback) {
		var request = CreateHttpRequestObject();

		if (request == null) {
			DebugWrite("Unable to create XMLHttpRequest object.", DebugLevel.Error);
			return;
		}

		var tmx = new TMXTileMap();
		tmx.filePath = tmxXmlFilePath;
		tmx.basePath = tmxXmlFilePath.substring(0, tmxXmlFilePath.lastIndexOf("/") + 1);

		request.onreadystatechange = function () {

			if (request.readyState == 4) {
				if (request.status == 200 || request.status == 304) {
					var xml = request.responseXML;
					var mapNode = xml.documentElement;
					var attr = null;

					// parse the map attributes
					for (var i = 0; i < mapNode.attributes.length; i++) {
						attr = mapNode.attributes[i];

						switch (attr.localName) {
							case "version":
								tmx.version = attr.value;
								break;
							case "orientation":
								tmx.orientation = attr.value;
								break;
							case "width":
								tmx.width = parseInt(attr.value);
								break;
							case "height":
								tmx.height = parseInt(attr.value);
								break;
							case "tilewidth":
								tmx.tileWidth = parseInt(attr.value);
								break;
							case "tileheight":
								tmx.tileHeight = parseInt(attr.value);
								break;
						}
					}

					// now parse the child nodes
					for (var i = 0; i < mapNode.childNodes.length; i++) {
						var node = mapNode.childNodes[i];

						switch (node.localName) {
							case "tileset":
								tmx.tileSets.push(TMXTileMap.parseTileset(node, tmx.basePath));
								break;
							case "layer":
								tmx.layers.push(TMXTileMap.parseLayer(node));
								break;
							case "objectgroup":
								tmx.objectGroups.push(TMXTileMap.parseObjectGroup(node));
								break;
							case "properties":
								tmx.properties = TMXTileMap.parseProperties(node);
								break;
						}
					}

					if (readyCallback != null) {
						readyCallback(tmx);
					}
				}
				else {
					DebugWrite("Unable to load tmx map from url: #{0}, reason=#{1}, responseCode=#{2}", DebugLevel.Error, tmxXmlFilePath, request.statusText, request.status);
				}
			}
		};

		request.open("GET", tmxXmlFilePath, true);
		request.send(null);
	}

	static parseMapXml() {}

	static parseTileset(node, basePath) {

		var set = new TMXTileSet();
		var i, attr;

		for (i = 0; i < node.attributes.length; i++) {
			attr = node.attributes[i];

			switch (attr.localName) {
				case "firstgid":
					set.firstGid = parseInt(attr.value);
					break;
				case "name":
					set.name = attr.value;
					break;
				case "tilewidth":
					set.tileWidth = parseInt(attr.value);
					break;
				case "tileheight":
					set.tileHeight = parseInt(attr.value);
					break;
				case "spacing":
					set.spacing = parseInt(attr.value);
					break;
				case "margin":
					set.margin = parseInt(attr.value);
					break;
			}
		}

		for (i = 0; i < node.childNodes.length; i++) {
			var n = node.childNodes[i];

			if (n.localName == "image") {
				attr = TMXTileMap.getAttributeByName(n, "source");

				if (attr != null) {
					set.imageSource = basePath + attr.value;
				}

				break;
			}
		}

		return set;
	}

	static parseLayer(node) {
		var layer = new TMXLayer();
		var i;

		for (i = 0; i < node.attributes.length; i++) {
			var attr = node.attributes[i];

			switch (attr.localName) {
				case "name":
					layer.name = attr.value;
					break;
				case "opacity":
					layer.opacity = Number(attr.value);
					break;
				case "visible":
					layer.visible = (parseInt(attr.value) == 1);
					break;
			}
		}

		for (i = 0; i < node.childNodes.length; i++) {
			var n = node.childNodes[i];

			if (n.localName == "data") {
				TMXTileMap.parseTileData(n, layer);
			}
		}

		return layer;
	}

	static parseTileData(node, layer) {
		var attr = TMXTileMap.getAttributeByName(node, "encoding");

		if (attr.value != "csv") {
			return;
		}

		var tiles = node.textContent.split(",");

		if (tiles != null) {
			for (var i = 0; i < tiles.length; i++) {
				layer.tiles.push(parseInt(tiles[i]));
			}
		}
	}

	static parseObjectGroup(node) {
		var group = new TMXObjectGroup();

		var attr = TMXTileMap.getAttributeByName(node, "encoding");

		if (attr != null) {
			group.name = attr.value;
		}

		for (var i = 0; i < node.childNodes.length; i++) {
			var n = node.childNodes[i];

			if (n.localName == "object") {
				group.objects.push(TMXTileMap.parseObject(n));
			}
		}

		return group;
	}

	static parseObject(node) {
		var obj = new TMXObject();
		var i;

		for (i = 0; i < node.attributes.length; i++) {
			var attr = node.attributes[i];

			switch (attr.localName) {
				case "name":
					obj.name = attr.value;
					break;
				case "type":
					obj.type = attr.value;
					break;
				case "x":
					obj.x = parseInt(attr.value);
					break;
				case "y":
					obj.y = parseInt(attr.value);
					break;
				case "width":
					obj.width = parseInt(attr.value);
					break;
				case "height":
					obj.height = parseInt(attr.value);
					break;
				case "gid":
					obj.gid = parseInt(attr.value);
					break;
			}
		}

		for (i = 0; i < node.childNodes.length; i++) {
			if (node.childNodes[i].localName == "properties") {
				obj.properties = TMXTileMap.parseProperties(node.childNodes[i]);
			}
		}

		return obj;
	}

	static parseProperties(node) {
		var props = new Dictionary();

		for (var i = 0; i < node.childNodes.length; i++) {
			if (node.childNodes[i].localName == "property") {
				var nameAttr = TMXTileMap.getAttributeByName(node.childNodes[i], "name");
				var valueAttr = TMXTileMap.getAttributeByName(node.childNodes[i], "name");

				props.set(nameAttr.value, valueAttr.value);
			}
		}

		return props;
	}

	static getAttributeByName(node, name) {
		for (var i = 0; i < node.attributes.length; i++) {
			var attr = node.attributes[i];

			if (attr.localName == name) {
				return attr;
			}
		}

		return null;
	}
}

Object.assign(TMXTileMap, {
	TYPE_ORTHOGONAL: "orthogonal",
	TYPE_ISOMETRIC: "isometric",
	TYPE_HEXAGONAL: "hexagonal"
});

export default TMXTileMap;

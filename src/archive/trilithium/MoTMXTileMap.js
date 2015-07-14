MoTMXTileMap = Class.create(MoEventDispatcher, {
	initialize : function($super) {
		$super();
		
		this.tileSets = new Array();
		this.objectGroups = new Array();
		this.layers = new Array();
		this.properties = null;
		this.filePath = "";
		this.basePath = "";
		this.orientation = "";
		this.version = "";
		this.width = 0;
		this.height = 0;
		this.tileWidth = 0;
		this.tileHeight = 0;
	},
	
	getTileSets : function() {
		return this.tileSets;
	},
	
	getObjectGroups : function() {
		return this.objectGroups;
	},
	
	getLayers : function() {
		return this.layers;
	},
	
	getProperties : function() {
		return this.properties;
	},
	
	getFilePath : function() {
		return this.filePath;
	},
	
	getOrientation : function() {
		return this.orientation;
	},
	
	getVersion : function() {
		return this.version;
	},
	
	getWidth : function() {
		return this.width;
	},
	
	getHeight : function() {
		return this.height;
	},
	
	getTileWidth : function() {
		return this.tileWidth;
	},
	
	getTileHeight : function() {
		return this.tileHeight;
	},
	
	getPixelWidth : function() {
		return this.getWidth() * this.getTileWidth();
	},
	
	getPixelHeight : function() {
		return this.getHeight() * this.getTileHeight();
	},
	
	getLayerTileSet : function(layer) {
		var tileset = null;
		var len = this.tileSets.length;
		
		for(var i = len-1; i >= 0; i--)
		{
			tileset = this.tileSets[i];

			for(var x = 0; x < this.width; x++)
			{
				for(var y = 0; y < this.height; y++)
				{
					var idx = x + this.width * y;
					var id = layer.getTiles()[idx];
					
					if(id != 0)
					{
						if(id >= tileset.getFirstGID())
							return tileset;
					}
				}
			}
		}

		return null;
	}
});

Object.extend(MoTMXTileMap, {
	TYPE_ORTHOGONAL : "orthogonal",
	TYPE_ISOMETRIC : "isometric",
	TYPE_HEXAGONAL : "hexagonal",

	load : function(tmxXmlFilePath, readyCallback) {
		var request = MoCreateHttpRequestObject();

		if(MoIsNull(request))
		{
			MoDebugWrite("Unable to create XMLHttpRequest object.", MoDebugLevel.Error);
			return;
		}

		var tmx = new MoTMXTileMap();
		tmx.filePath = tmxXmlFilePath;
		tmx.basePath = tmxXmlFilePath.substring(0, tmxXmlFilePath.lastIndexOf("/")+1);

		request.onreadystatechange = function() {
			
			if(request.readyState == 4)
			{
				if(request.status == 200 || request.status == 304)
				{
					var xml = request.responseXML;
					var mapNode = xml.documentElement;
					var attr = null;

					// parse the map attributes
					for(var i = 0; i < mapNode.attributes.length; i++)
					{
						attr = mapNode.attributes[i];
			
						switch(attr.localName)
						{
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
					for(var i = 0; i < mapNode.childNodes.length; i++)
					{
						var node = mapNode.childNodes[i];
			
						switch(node.localName)
						{
							case "tileset":
								tmx.tileSets.push(MoTMXTileMap.parseTileset(node, tmx.basePath));
								break;
							case "layer":
								tmx.layers.push(MoTMXTileMap.parseLayer(node));
								break;
							case "objectgroup":
								tmx.objectGroups.push(MoTMXTileMap.parseObjectGroup(node));
								break;
							case "properties":
								tmx.properties = MoTMXTileMap.parseProperties(node);
								break;
						}
					}

					if(!MoIsNull(readyCallback))
						readyCallback(tmx);
				}
				else
				{
					MoDebugWrite("Unable to load tmx map from url: #{0}, reason=#{1}, responseCode=#{2}", MoDebugLevel.Error, tmxXmlFilePath, request.statusText, request.status);
				}
			}
		};

		request.open("GET", tmxXmlFilePath, true);
		request.send(null);
	},

	parseMapXml : function() {

	},
	
	parseTileset : function(node, basePath) {
	
		var set = new MoTMXTileSet();
	
		for(var i = 0; i < node.attributes.length; i++)
		{
			var attr = node.attributes[i];
		
			switch(attr.localName)
			{
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
		
		for(var i = 0; i < node.childNodes.length; i++)
		{
			var n = node.childNodes[i];
			
			if(n.localName == "image")
			{
				var attr = MoTMXTileMap.getAttributeByName(n, "source");
				
				if(attr != null)
					set.imageSource = basePath + attr.value;
				
				break;
			}
		}
		
		return set;
	},
	
	parseLayer : function(node) {
		var layer = new MoTMXLayer();
	
		for(var i = 0; i < node.attributes.length; i++)
		{
			var attr = node.attributes[i];
		
			switch(attr.localName)
			{
				case "name":
					layer.name = attr.value;
					break;
				case "opacity":
					layer.opacity = Number(attr.value);
					break;
				case "visible":
					layer.visible = (parseInt(attr.value) == 1 ? true : false);
					break;
			}
		}
		
		for(var i = 0; i < node.childNodes.length; i++)
		{
			var n = node.childNodes[i];
			
			if(n.localName == "data")
				MoTMXTileMap.parseTileData(n, layer);
		}

		return layer;
	},
	
	parseTileData : function(node, layer) {
		var attr = MoTMXTileMap.getAttributeByName(node, "encoding");
		
		if(attr.value != "csv")
			return;
		
		var tiles = node.textContent.split(",");
		
		if(tiles != null)
		{
			for(var i = 0; i < tiles.length; i++)
			{
				layer.tiles.push(parseInt(tiles[i]));
			}
		}
	},
	
	parseObjectGroup : function(node) {
		var group = new MoTMXObjectGroup();
		
		var attr = MoTMXTileMap.getAttributeByName(node, "encoding");
		
		if(attr != null)
			group.name = attr.value;
		
		for(var i = 0; i < node.childNodes.length; i++)
		{
			var n = node.childNodes[i];
			
			if(n.localName == "object")
				group.objects.push(MoTMXTileMap.parseObject(n));
		}
		
		return group;
	},
	
	parseObject : function(node) {
		var obj = new MoTMXObject();
	
		for(var i = 0; i < node.attributes.length; i++)
		{
			var attr = node.attributes[i];
		
			switch(attr.localName)
			{
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
		
		for(var i = 0; i < node.childNodes.length; i++)
		{
			if(node.childNodes[i].localName == "properties")
				obj.properties = MoTMXTileMap.parseProperties(node.childNodes[i]);
		}
		
		return obj;
	},
	
	parseProperties : function(node) {
		var props = new MoDictionary();
		
		for(var i = 0; i < node.childNodes.length; i++)
		{
			if(node.childNodes[i].localName == "property")
			{
				var nameAttr = MoTMXTileMap.getAttributeByName(node.childNodes[i], "name");
				var valueAttr = MoTMXTileMap.getAttributeByName(node.childNodes[i], "name");
				
				props.set(nameAttr.value, valueAttr.value);
			}
		}
		
		return props;
	},
	
	getAttributeByName : function(node, name) {
		for(var i = 0; i < node.attributes.length; i++)
		{
			var attr = node.attributes[i];
			
			if(attr.localName == name)
				return attr;
		}
		
		return null;
	}
});
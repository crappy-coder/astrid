class TMXTileSet {
	constructor() {
		this.firstGid = 0;
		this.name = "";
		this.tileWidth = 0;
		this.tileHeight = 0;
		this.spacing = 0;
		this.margin = 0;
		this.imageSource = null;
	}
	
	getFirstGID() {
		return this.firstGid;
	}
	
	getName() {
		return this.name;
	}
	
	getTileWidth() {
		return this.tileWidth;
	}
	
	getTileHeight() {
		return this.tileHeight;
	}
	
	getSpacing() {
		return this.spacing;
	}
	
	getMargin() {
		return this.margin;
	}
	
	getImageSource() {
		return this.imageSource;
	}
}

export default TMXTileSet;

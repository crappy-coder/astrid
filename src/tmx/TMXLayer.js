class TMXLayer {
	constructor() {
		this.name = "";
		this.opacity = 1;
		this.visible = true;
		this.tiles = [];
	}

	getName() {
		return this.name;
	}

	getOpacity() {
		return this.opacity;
	}

	getVisible() {
		return this.visible;
	}

	getTiles() {
		return this.tiles;
	}
}

export default TMXLayer;

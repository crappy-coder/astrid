class TMXObject {
	constructor() {
		this.name = "";
		this.type = "";
		this.x = 0;
		this.y = 0;
		this.width = 0;
		this.height = 0;
		this.gid = 0;
		this.properties = null;
	}

	getName() {
		return this.name;
	}

	getType() {
		return this.type;
	}

	getX() {
		return this.x;
	}

	getY() {
		return this.y;
	}

	getWidth() {
		return this.width;
	}

	getHeight() {
		return this.height;
	}

	getGID() {
		return this.gid;
	}

	getProperties() {
		return this.properties;
	}
}

export default TMXObject;

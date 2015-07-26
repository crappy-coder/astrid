import Equatable from "../Equatable";

class TouchPoint extends Equatable {
	constructor(id, sceneX, sceneY) {
		super();

		this.id = id;
		this.sceneX = sceneX;
		this.sceneY = sceneY;
	}

	getId() {
		return this.id;
	}

	getSceneX() {
		return this.sceneX;
	}

	getSceneY() {
		return this.sceneY;
	}

	isEqualTo(other) {
		return (super.isEqualTo(other) &&
			this.id == other.id &&
			this.sceneX == other.sceneX &&
			this.sceneY == other.sceneY);
	}
}

export default TouchPoint;

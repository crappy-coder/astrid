import Color from "../graphics/Color";
import Vector2D from "../Vector2D";

class ParticleVertex {
	constructor() {
		this.size = 0;
		this.color = Color.Black.copy();
		this.position = Vector2D.Zero();
	}

	toString() {
		return "position: " + this.position + ", size: " + this.size + ", color: " + this.color;
	}
}

export default ParticleVertex;

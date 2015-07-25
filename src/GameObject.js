import AIEntity from "ai/AIEntity";

class GameObject extends AIEntity {
	constructor(name, container, surface) {
		super(name);

		this.surface = surface;
		this.container = container;
		this.sprite = null;
		this.entity = null;
	}

	setup() {
		/** override **/
	}

	getSurface() {
		return this.surface;
	}

	getSprite() {
		return this.sprite;
	}

	getContainer() {
		return this.container;
	}

	getEntity() {
		return this.entity;
	}

	getIsPlayingAnimation(name) {
		if (name == null) {
			return this.sprite.getIsRunning();
		}

		return (this.sprite.getIsRunning() && this.sprite.getAnimationName() == name);
	}

	playAnimation(name) {
		this.sprite.play(name);
	}

	stopAnimation() {
		this.sprite.stop();
	}

	pauseAnimation() {
		this.sprite.pause();
	}

	resumeAnimation() {
		this.sprite.resume();
	}

	static create(surface, name, container, objectType) {
		var obj = new objectType(name, container, surface);

		obj.setup();
		surface.addAIEntity(obj);

		return obj;
	}
}

export default GameObject;

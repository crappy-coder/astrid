import Canvas from "./Canvas";
import { ValueOrDefault } from "../Engine";
import Sprite from "./Sprite";

class SpriteGroup extends Canvas {
	constructor(name, groupName, textureAtlas) {
		super(name);

		this.textureAtlas = textureAtlas;
		this.setGroupName(groupName);
	}

	getGroupName() {
		return this.groupName;
	}

	setGroupName(value) {
		if (value == null) {
			throw new Error("Sprite must have a group.");
		}

		if (this.groupName != value) {
			this.groupName = value;
			this.reset();
		}
	}

	getTextureAtlas() {
		return this.textureAtlas;
	}

	getSprite(id) {
		return this.getByName("sprite-" + id);
	}

	play(name) {
		if (name == null) {
			this.playAll();
		}
		else {
			this.forEach("play", this.getAnimationIdForAnimationGroup(name));
		}
	}

	playAll() {
		this.forEach("play");
	}

	pause(name) {
		if (name == null) {
			this.pauseAll();
		}
		else {
			this.forEach("pause", this.getAnimationIdForAnimationGroup(name));
		}
	}

	pauseAll() {
		this.forEach("pause");
	}

	resume(name) {
		if (name == null) {
			this.resumeAll();
		}
		else {
			this.forEach("resume", this.getAnimationIdForAnimationGroup(name));
		}
	}

	resumeAll() {
		this.forEach("resume");
	}

	stop(name) {
		if (name == null) {
			this.stopAll();
		}
		else {
			this.forEach("stop", this.getAnimationIdForAnimationGroup(name));
		}
	}

	stopAll() {
		this.forEach("stop");
	}

	forEach(funcName, ids) {
		ids = ValueOrDefault(ids, null);
		var i, len;

		if (ids == null) {
			len = this.getCount();
			var child = null;

			for (i = 0; i < len; ++i) {
				child = this.getAt(i);

				if (child instanceof Sprite) {
					child[funcName]();
				}
			}
		}
		else {
			len = ids.length;
			var sprite = null;

			for (i = 0; i < len; ++i) {
				sprite = this.getSprite(ids[i]);
				sprite[funcName]();
			}
		}
	}

	getAnimationIdForAnimationGroup(name) {
		var group = this.textureAtlas.getGroupAnimations(this.groupName);
		var len = group.length;
		var names = [];

		for (var i = 0; i < len; ++i) {
			if (group[i].name.toLowerCase() == name.toLowerCase()) {
				names.push(group[i].id);
			}
		}

		return names;
	}

	reset() {
		this.stopAll();
		this.clear();

		var group = this.textureAtlas.getGroupAnimations(this.groupName);
		var len = group.length;
		var sprite = null;
		var animation = null;

		for (var i = 0; i < len; ++i) {
			animation = group[i];
			sprite = this.textureAtlas.getSprite("sprite-" + animation.id, animation.ref);
			sprite.setX(animation.x);
			sprite.setY(animation.y);

			if (animation.width > 0) {
				sprite.setWidth(animation.width);
			}

			if (animation.height > 0) {
				sprite.setHeight(animation.height);
			}

			this.add(sprite);
		}

		this.requestMeasure();
		this.requestLayout();
	}
}

export default SpriteGroup;

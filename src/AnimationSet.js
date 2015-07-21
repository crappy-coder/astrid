import EventDispatcher from "./EventDispatcher";

class AnimationSet extends EventDispatcher {
	constructor() {
		super();
		
		this.animations = [];
	}

	play() {
		/** override **/
	}

	pause() {
		/** override **/
	}

	resume() {
		/** override **/
	}

	stop() {
		/** override **/
	}

	reverse() {
		/** override **/
	}

	getAnimationAt(index) {
		return this.animations[index];
	}
	
	getAnimationCount() {
		return this.animations.length;
	}
	
	indexOfAnimation(animation) {
		return this.animations.indexOf(animation);
	}
	
	addAnimation(animation) {
		this.animations.push(animation);
	}
	
	removeAnimation(animation) {
		this.animations.remove(animation);
	}
	
	removeAnimationAt(index) {
		this.animations.removeAt(index);
	}
		
	clear() {
		this.animations.clear();
	}
}

export default AnimationSet;

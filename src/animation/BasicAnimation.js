import Animation from "./Animation";
import AnimationPath from "./AnimationPath";
import Keyframe from "./../Keyframe.js";

class BasicAnimation extends Animation {
	constructor(target, propertyName, fromValue, toValue) {
		super(target);

		this.fromValue = fromValue;
		this.toValue = toValue;
		this.propertyName = propertyName;
	}

	getFromValue() {
		return this.fromValue;
	}

	setFromValue(value) {
		this.fromValue = value;
	}
	
	getToValue() {
		return this.toValue;
	}
	
	setToValue(value) {
		this.toValue = value;
	}
	
	getPropertyName() {
		return this.propertyName;
	}

	setPropertyName(value) {
		this.propertyName = value;
	}
	
	play() {
		var animationPath = new AnimationPath(this.getPropertyName());
		animationPath.addKeyframe(new Keyframe(0, this.getFromValue()));
		animationPath.addKeyframe(new Keyframe(this.getDuration(), this.getToValue()));

		this.clearAnimationPaths();
		this.addAnimationPath(animationPath);

		this.playImpl();
	}
}

export default BasicAnimation;

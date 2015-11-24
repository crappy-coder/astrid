import Animation from "./Animation";
import AnimationPath from "./AnimationPath";
import Keyframe from "./Keyframe.js";
import { ValueOrDefault } from "../Engine";

class BasicParallelAnimation extends Animation {
	constructor(target, propertyNames, fromValues, toValues) {
		super(target);

		this.fromValues = ValueOrDefault(fromValues, []);
		this.toValues = ValueOrDefault(toValues, []);
		this.propertyNames = ValueOrDefault(propertyNames, []);
	}

	getFromValues() {
		return this.fromValues;
	}

	setFromValues(value) {
		this.fromValues = value;
	}
	
	getToValues() {
		return this.toValues;
	}
	
	setToValues(value) {
		this.toValues = value;
	}
	
	getPropertyNames() {
		return this.propertyNames;
	}

	setPropertyNames(value) {
		this.propertyNames = value;
	}
	
	play() {
		var animationPath = null;

		this.clearAnimationPaths();

		for(var i = 0, len = this.propertyNames.length; i < len; ++i)
		{
			var fromValue = (this.fromValues && i < this.fromValues.length ? this.fromValues[i] : null);
			var toValue = (this.toValues && i < this.toValues.length ? this.toValues[i] : null);

			animationPath = new AnimationPath(this.propertyNames[i]);
			animationPath.addKeyframe(new Keyframe(0, fromValue));
			animationPath.addKeyframe(new Keyframe(this.getDuration(), toValue));

			this.addAnimationPath(animationPath);
		}


		this.playImpl();
	}
}

export default BasicParallelAnimation;

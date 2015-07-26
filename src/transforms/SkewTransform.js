import Transform from "./Transform";
import { ValueOrDefault } from "./../Engine";
import PropertyOptions from "./../ui/PropertyOptions";
import Matrix2D from "./../Matrix2D";

class SkewTransform extends Transform {
	constructor(skewX, skewY, centerX, centerY) {
		super();

		this.setSkewX(ValueOrDefault(skewX, 0));
		this.setSkewY(ValueOrDefault(skewY, 0));
		this.setCenterX(ValueOrDefault(centerX, 0));
		this.setCenterY(ValueOrDefault(centerY, 0));
	}

	initializeAnimatablePropertiesCore() {
		super.initializeAnimatablePropertiesCore();

		this.enableAnimatableProperty("skewX", this.getSkewX, this.setSkewX, PropertyOptions.AffectsMeasure |
				PropertyOptions.AffectsLayout);
		this.enableAnimatableProperty("skewY", this.getSkewY, this.setSkewY, PropertyOptions.AffectsMeasure |
				PropertyOptions.AffectsLayout);
		this.enableAnimatableProperty("centerX", this.getCenterX, this.setCenterX, PropertyOptions.AffectsMeasure |
				PropertyOptions.AffectsLayout);
		this.enableAnimatableProperty("centerY", this.getCenterY, this.setCenterY, PropertyOptions.AffectsMeasure |
				PropertyOptions.AffectsLayout);
	}

	getValue() {
		var mx = new Matrix2D();
		var hasCenterPoint = (this.getCenterX() != 0 || this.getCenterY() != 0);

		if (hasCenterPoint) {
			mx.translate(-this.getCenterX(), -this.getCenterY());
		}

		mx.skew(this.getSkewX(), this.getSkewY());

		if (hasCenterPoint) {
			mx.translate(this.getCenterX(), this.getCenterY());
		}

		return mx;
	}

	getSkewX() {
		return this.getPropertyValue("skewX");
	}

	setSkewX(value) {
		this.setPropertyValue("skewX", value);
	}

	getSkewY() {
		return this.getPropertyValue("skewY");
	}

	setSkewY(value) {
		this.setPropertyValue("skewY", value);
	}

	getCenterX() {
		return this.getPropertyValue("centerX");
	}

	setCenterX(value) {
		this.setPropertyValue("centerX", value);
	}

	getCenterY() {
		return this.getPropertyValue("centerY");
	}

	setCenterY(value) {
		this.setPropertyValue("centerY", value);
	}

	isEqualTo(other) {
		return (this.getCenterX() == other.getCenterX() &&
			this.getCenterY() == other.getCenterY() &&
			this.getSkewX() == other.getSkewX() &&
			this.getSkewY() == other.getSkewY());
	}
}

export default SkewTransform;

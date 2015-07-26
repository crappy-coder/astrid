import Transform from "./Transform";
import PropertyOptions from "../ui/PropertyOptions";
import Matrix2D from "../Matrix2D";

class GeneralTransform extends Transform {
	constructor() {
		super();

		this.setCenterX(0);
		this.setCenterY(0);
		this.setX(0);
		this.setY(0);
		this.setSkewX(0);
		this.setSkewY(0);
		this.setScaleX(1);
		this.setScaleY(1);
		this.setRotation(0);
	}

	initializeAnimatablePropertiesCore() {
		super.initializeAnimatablePropertiesCore();

		this.enableAnimatableProperty("x", this.getX, this.setX, PropertyOptions.AffectsLayout |
			PropertyOptions.AffectsMeasure);
		this.enableAnimatableProperty("y", this.getY, this.setY, PropertyOptions.AffectsLayout |
			PropertyOptions.AffectsMeasure);
		this.enableAnimatableProperty("centerX", this.getCenterX, this.setCenterX, PropertyOptions.AffectsLayout |
			PropertyOptions.AffectsMeasure);
		this.enableAnimatableProperty("centerY", this.getCenterY, this.setCenterY, PropertyOptions.AffectsLayout |
			PropertyOptions.AffectsMeasure);
		this.enableAnimatableProperty("scaleX", this.getScaleX, this.setScaleX, PropertyOptions.AffectsLayout |
			PropertyOptions.AffectsMeasure);
		this.enableAnimatableProperty("scaleY", this.getScaleY, this.setScaleY, PropertyOptions.AffectsLayout |
			PropertyOptions.AffectsMeasure);
		this.enableAnimatableProperty("skewX", this.getSkewX, this.setSkewX, PropertyOptions.AffectsLayout |
			PropertyOptions.AffectsMeasure);
		this.enableAnimatableProperty("skewY", this.getSkewY, this.setSkewY, PropertyOptions.AffectsLayout |
			PropertyOptions.AffectsMeasure);
		this.enableAnimatableProperty("rotation", this.getRotation, this.setRotation, PropertyOptions.AffectsLayout |
			PropertyOptions.AffectsMeasure);
	}

	getValue() {
		var mx = new Matrix2D();
		var hasCenterPoint = (this.getCenterX() != 0 || this.getCenterY() != 0);

		if (this.getScaleX() != 1 || this.getScaleY() != 1) {
			mx.scaleAt(this.getScaleX(), this.getScaleY(), this.getCenterX(), this.getCenterY());
		}

		if (this.getSkewX() != 0 || this.getSkewY() != 0) {
			if (hasCenterPoint) {
				mx.translate(-this.getCenterX(), -this.getCenterY());
			}

			mx.skew(this.getSkewX(), this.getSkewY());

			if (hasCenterPoint) {
				mx.translate(this.getCenterX(), this.getCenterY());
			}
		}

		if (this.getRotation() != 0) {
			mx.rotateAt(this.getRotation(), this.getCenterX(), this.getCenterY());
		}

		if (this.getX() != 0 || this.getY() != 0) {
			mx.translate(this.getX(), this.getY());
		}

		return mx;
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

	getX() {
		return this.getPropertyValue("x");
	}

	setX(value) {
		this.setPropertyValue("x", value);
	}

	getY() {
		return this.getPropertyValue("y");
	}

	setY(value) {
		this.setPropertyValue("y", value);
	}

	getScaleX() {
		return this.getPropertyValue("scaleX");
	}

	setScaleX(value) {
		this.setPropertyValue("scaleX", value);
	}

	getScaleY() {
		return this.getPropertyValue("scaleY");
	}

	setScaleY(value) {
		this.setPropertyValue("scaleY", value);
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

	getRotation() {
		return this.getPropertyValue("rotation");
	}

	setRotation(value) {
		this.setPropertyValue("rotation", value);
	}

	isEqualTo(other) {
		return (this.getCenterX() == other.getCenterX() &&
			this.getCenterY() == other.getCenterY() &&
			this.getX() == other.getX() &&
			this.getY() == other.getY() &&
			this.getSkewX() == other.getSkewX() &&
			this.getSkewY() == other.getSkewY() &&
			this.getScaleX() == other.getScaleX() &&
			this.getScaleY() == other.getScaleY() &&
			this.getRotation() == other.getRotation());
	}
}

export default GeneralTransform;

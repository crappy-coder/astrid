import Transform from "./Transform";
import { ValueOrDefault } from "./Engine";
import PropertyOptions from "./PropertyOptions";
import Matrix2D from "./Matrix2D";

class RotateTransform extends Transform {
	constructor(angle, centerX, centerY) {
		super();

		this.setAngle(ValueOrDefault(angle, 0));
		this.setCenterX(ValueOrDefault(centerX, 0));
		this.setCenterY(ValueOrDefault(centerY, 0));
	}

	initializeAnimatablePropertiesCore() {
		super.initializeAnimatablePropertiesCore();

		this.enableAnimatableProperty("angle", this.getAngle, this.setAngle, PropertyOptions.AffectsLayout | PropertyOptions.AffectsMeasure);
		this.enableAnimatableProperty("centerX", this.getCenterX, this.setCenterX, PropertyOptions.AffectsLayout | PropertyOptions.AffectsMeasure);
		this.enableAnimatableProperty("centerY", this.getCenterY, this.setCenterY, PropertyOptions.AffectsLayout | PropertyOptions.AffectsMeasure);
	}

	getValue() {
		var mx = Matrix2D.createIdentity();
		mx.rotateAt(this.getAngle(), this.getCenterX(), this.getCenterY());

		return mx;
	}

	getAngle() {
		return this.getPropertyValue("angle");
	}

	setAngle(value) {
		this.setPropertyValue("angle", value);
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
		return (this.getAngle() == other.getAngle() &&
				this.getCenterX() == other.getCenterX() &&
				this.getCenterY() == other.getCenterY());
	}
}

export default RotateTransform;

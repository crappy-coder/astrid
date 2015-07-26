import Transform from "./Transform";
import { ValueOrDefault } from "./../Engine";
import PropertyOptions from "./../ui/PropertyOptions";
import Matrix2D from "./../Matrix2D";

class TranslateTransform extends Transform {
	constructor(x, y) {
		super();

		this.setX(ValueOrDefault(x, 0));
		this.setY(ValueOrDefault(y, 0));
	}

	initializeAnimatablePropertiesCore() {
		super.initializeAnimatablePropertiesCore();

		this.enableAnimatableProperty("x", this.getX, this.setX, PropertyOptions.AffectsLayout |
				PropertyOptions.AffectsMeasure);
		this.enableAnimatableProperty("y", this.getY, this.setY, PropertyOptions.AffectsLayout |
				PropertyOptions.AffectsMeasure);
	}

	getValue() {
		var mx = Matrix2D.createIdentity();
		mx.translate(this.getX(), this.getY());

		return mx;
	}

	transformRect(rect) {
		if (!rect.isEmpty()) {
			rect.offset(this.getX(), this.getY());
		}

		return rect;
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

	isEqualTo(other) {
		return (this.getX() == other.getX() &&
			this.getY() == other.getY());
	}
}

export default TranslateTransform;

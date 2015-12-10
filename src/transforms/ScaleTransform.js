import Transform from "./Transform";
import PropertyOptions from "../ui/PropertyOptions";
import Matrix2D from "../Matrix2D";

class ScaleTransform extends Transform {
	constructor(scaleX, scaleY, centerX, centerY) {
		super();

		this.setScaleX(astrid.valueOrDefault(scaleX, 1));
		this.setScaleY(astrid.valueOrDefault(scaleY, 1));
		this.setCenterX(astrid.valueOrDefault(centerX, 0));
		this.setCenterY(astrid.valueOrDefault(centerY, 0));
	}

	initializeAnimatablePropertiesCore() {
		super.initializeAnimatablePropertiesCore();

		this.enableAnimatableProperty("scaleX", this.getScaleX, this.setScaleX, PropertyOptions.AffectsMeasure |
				PropertyOptions.AffectsLayout);
		this.enableAnimatableProperty("scaleY", this.getScaleY, this.setScaleY, PropertyOptions.AffectsMeasure |
				PropertyOptions.AffectsLayout);
		this.enableAnimatableProperty("centerX", this.getCenterX, this.setCenterX, PropertyOptions.AffectsMeasure |
				PropertyOptions.AffectsLayout);
		this.enableAnimatableProperty("centerY", this.getCenterY, this.setCenterY, PropertyOptions.AffectsMeasure |
				PropertyOptions.AffectsLayout);
	}

	getValue() {
		var mx = Matrix2D.createIdentity();
		mx.scaleAt(this.getScaleX(), this.getScaleY(), this.getCenterX(), this.getCenterY());

		return mx;
	}

	transformRect(rect) {
		if (!rect.isEmpty()) {
			var hasCenterPoint = (this.getCenterX() != 0 || this.getCenterY() != 0);

			if (hasCenterPoint) {
				rect.x -= this.getCenterX();
				rect.y -= this.getCenterY();
			}

			rect.scale(this.getScaleX(), this.getScaleY());

			if (hasCenterPoint) {
				rect.x += this.getCenterX();
				rect.y += this.getCenterY();
			}
		}

		return rect;
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
			this.getScaleX() == other.getScaleX() &&
			this.getScaleY() == other.getScaleY());
	}
}

export default ScaleTransform;

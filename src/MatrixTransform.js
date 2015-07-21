import Transform from "./Transform";
import Matrix2D from "./Matrix2D";
import { ValueOrDefault, AreEqual } from "./Engine";
import PropertyOptions from "./PropertyOptions";

class MatrixTransform extends Transform {
	constructor(matrix) {
		super();

		this.tmp = new Matrix2D();
		this.setMatrix(ValueOrDefault(matrix, new Matrix2D()));
	}

	initializeAnimatablePropertiesCore() {
		super.initializeAnimatablePropertiesCore();

		this.enableAnimatableProperty("matrix", this.getMatrix, this.setMatrix, PropertyOptions.AffectsLayout |
				PropertyOptions.AffectsMeasure);
	}

	getValue() {
		this.tmp.copyFrom(this.getMatrix());

		return this.tmp;
	}

	getMatrix() {
		return this.getPropertyValue("matrix");
	}

	setMatrix(value) {
		this.setPropertyValue("matrix", value);
	}

	isEqualTo(other) {
		return (AreEqual(this.getMatrix(), other.getMatrix()));
	}
}

export default MatrixTransform;

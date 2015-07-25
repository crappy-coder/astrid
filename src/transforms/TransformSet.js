import Transform from "./Transform";
import PropertyOptions from "./../PropertyOptions";
import Matrix2D from "./../math/Matrix2D";
import { AreNotEqual } from "./../Engine";

class TransformSet extends Transform {
	constructor() {
		super();

		this.setChildren([]);
	}

	initializeAnimatablePropertiesCore() {
		super.initializeAnimatablePropertiesCore();

		this.enableAnimatableProperty("children", this.getChildren, this.setChildren, PropertyOptions.AffectsLayout |
				PropertyOptions.AffectsMeasure);
	}

	getValue() {
		var mx = Matrix2D.createIdentity();
		var len = this.getChildren().length;

		if (len > 0) {
			var xform = null;

			for (var i = 0; i < len; i++) {
				xform = this.getChildren()[i];

				if (xform != null) {
					mx.append(xform.getValue());
				}
			}
		}

		return mx;
	}

	add(transform) {
		var children = this.getChildren();
		children.push(transform);

		this.setChildren(children);
	}

	remove(transform) {
		var children = this.getChildren();
		children.remove(transform);

		this.setChildren(children);
	}

	removeAt(index) {
		var children = this.getChildren();
		children.removeAt(index);

		this.setChildren(children);
	}

	getAt(index) {
		return this.getChildren()[index];
	}

	getChildren() {
		return this.getPropertyValue("children");
	}

	setChildren(value) {
		if (value == null) {
			value = [];
		}

		this.setPropertyValue("children", value);
	}

	clear() {
		this.setChildren(null);
	}

	getForType(type) {
		var len = this.getChildren().length;
		var xform = null;

		for (var i = 0; i < len; i++) {
			xform = this.getChildren()[i];

			if (xform != null && xform instanceof type) {
				return xform;
			}
		}

		return null;
	}

	isEqualTo(other) {
		if (this.getChildren().length == other.getChildren().length) {
			var len = this.getChildren().length;
			var c1 = null;
			var c2 = null;

			for (var i = 0; i < len; ++i) {
				c1 = this.getChildren()[i];
				c2 = other.getChildren()[i];

				if (AreNotEqual(c1, c2)) {
					return false;
				}
			}

			return true;
		}

		return false;
	}
}

export default TransformSet;

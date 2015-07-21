import ContentControl from "./ContentControl";
import { AreNotEqual } from "./Engine";
import CornerRadius from "./CornerRadius";

class Border extends ContentControl {
	constructor(name) {
		super(name);

		this.cornerRadius = CornerRadius.fromUniform(0);
	}

	getCornerRadius() {
		return this.cornerRadius;
	}

	setCornerRadius(value) {
		if (AreNotEqual(this.cornerRadius, value)) {
			this.cornerRadius = value;

			if (this.cornerRadius == null) {
				this.cornerRadius = CornerRadius.fromUniform(0);
			}

			this.requestLayout();
		}
	}

	layout(unscaledWidth, unscaledHeight) {
		super.layout(unscaledWidth, unscaledHeight);

		if (this.getChild() == null || this.cornerRadius.isSquare()) {
			return;
		}

		var thickness = this.getBorderThickness();
		var inset = thickness * 0.5;

		this.graphics.clear();
		this.graphics.beginPath();
		this.graphics.drawRoundRectComplex(
			inset,
			inset,
			Math.max(0, unscaledWidth - inset),
			Math.max(0, unscaledHeight - inset),
			this.cornerRadius
		);
		this.drawBackground();
		this.drawBorder();
	}
}

export default Border;

import Drawable from "./Drawable";
import { AreNotEqual } from "./Engine";

class Panel extends Drawable {
	constructor(name) {
		super(name);

		this.background = null;
	}

	getBackground() {
		return this.background;
	}

	setBackground(value) {
		if (AreNotEqual(this.background, value)) {
			this.background = value;
			this.requestLayout();
		}
	}

	layout(unscaledWidth, unscaledHeight) {
		super.layout(unscaledWidth, unscaledHeight);

		this.graphics.clear();

		if (this.background != null) {
			this.graphics.drawRect(0, 0, unscaledWidth, unscaledHeight);
			this.graphics.fill(this.background);
		}
	}
}

export default Panel;

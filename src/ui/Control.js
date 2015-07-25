import Drawable from "./Drawable";
import Pen from "./Pen";
import { AreNotEqual } from "./../Engine";

class Control extends Drawable {
	constructor(name) {
		super(name);

		this.background = null;
		this.foreground = null;
		this.borderBrush = null;
		this.borderThickness = 0;
		this.pen = null; // cached pen for strokes
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

	getForeground() {
		return this.foreground;
	}

	setForeground(value) {
		if (AreNotEqual(this.foreground, value)) {
			this.foreground = value;
			this.requestLayout();
		}
	}

	getBorderBrush() {
		return this.borderBrush;
	}

	setBorderBrush(value) {
		if (AreNotEqual(this.borderBrush, value)) {
			this.borderBrush = value;

			this.invalidateProperties();
			this.requestLayout();
		}
	}

	getBorderThickness() {
		return this.borderThickness;
	}

	setBorderThickness(value) {
		if (this.borderThickness != value) {
			this.borderThickness = value;

			this.invalidateProperties();
			this.requestMeasure();
			this.requestLayout();
		}
	}

	commitProperties() {
		super.commitProperties();

		if (this.borderBrush != null && this.borderThickness > 0) {
			if (this.pen == null) {
				this.pen = new Pen(this.borderBrush, this.borderThickness);
			}
			else {
				this.pen.setBrush(this.borderBrush);
				this.pen.setThickness(this.borderThickness);
			}
		}
		else {
			this.pen = null;
		}
	}

	layout(unscaledWidth, unscaledHeight) {
		super.layout(unscaledWidth, unscaledHeight);

		this.graphics.clear();

		if (this.background != null || (this.borderBrush != null && this.borderThickness > 0)) {
			var thickness = this.getBorderThickness();
			var inset = thickness * 0.5;

			this.graphics.drawRect(inset, inset, Math.max(0, unscaledWidth - thickness), Math.max(0, unscaledHeight -
				thickness));
			this.drawBackground();
			this.drawBorder();
		}
	}

	drawBackground() {
		if (this.background != null) {
			this.graphics.fill(this.background);
		}
	}

	drawBorder() {
		if (this.pen != null) {
			this.graphics.stroke(this.pen);
		}
	}
}

export default Control;

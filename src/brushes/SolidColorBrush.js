import Brush from "./Brush";
import PropertyOptions from "./PropertyOptions";
import { AreEqual } from "./../Engine";
import Color from "./../graphics/Color";

class SolidColorBrush extends Brush {
	constructor(color) {
		super();

		this.setColor(color);
	}

	initializeAnimatablePropertiesCore() {
		super.initializeAnimatablePropertiesCore();

		this.enableAnimatableProperty("color", this.getColor, this.setColor, PropertyOptions.AffectsLayout);
	}

	getColor() {
		return this.getPropertyValue("color");
	}

	setColor(value) {
		this.setPropertyValue("color", value);
	}

	isEqualTo(other) {
		if (super.isEqualTo(other)) {
			return AreEqual(this.getColor(), other.getColor());
		}

		return false;
	}

	static fromColor(color) {
		return new SolidColorBrush(color);
	}

	static fromColorHex(hexColor) {
		return SolidColorBrush.fromColor(Color.fromHex(hexColor));
	}

	static fromColorHexWithAlpha(hexColor, alpha) {
		return SolidColorBrush.fromColor(Color.fromHexWithAlpha(hexColor, alpha));
	}

	static fromColorRGB(r, g, b) {
		return SolidColorBrush.fromColor(new Color(r, g, b, 1.0));
	}

	static fromColorRGBA(r, g, b, a) {
		return SolidColorBrush.fromColor(new Color(r, g, b, a));
	}

	static black() {
		return SolidColorBrush.fromColor(Color.black());
	}

	static white() {
		return SolidColorBrush.fromColor(Color.white());
	}

	static red() {
		return SolidColorBrush.fromColor(Color.red());
	}

	static green() {
		return SolidColorBrush.fromColor(Color.green());
	}

	static blue() {
		return SolidColorBrush.fromColor(Color.blue());
	}

	static yellow() {
		return SolidColorBrush.fromColor(Color.yellow());
	}

	static magenta() {
		return SolidColorBrush.fromColor(Color.magenta());
	}

	static turquoise() {
		return SolidColorBrush.fromColor(Color.turquoise());
	}

	static transparent() {
		return SolidColorBrush.fromColor(Color.transparent());
	}
}

export default SolidColorBrush;

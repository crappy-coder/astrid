import BasicAnimation from "./BasicAnimation";
import ColorInterpolator from "./ColorInterpolator";

class ColorAnimation extends BasicAnimation {
	constructor(target, propertyName, fromColor, toColor) {
		super(target, propertyName, fromColor, toColor);

		this.setInterpolator(ColorInterpolator.getInstance());
	}
}

export default ColorAnimation;

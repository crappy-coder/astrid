import Brush from "./Brush";
import PropertyOptions from "../ui/PropertyOptions";

class GradientBrush extends Brush {
	constructor() {
		super();

		this.setColorStops();
	}

	initializeAnimatablePropertiesCore() {
		super.initializeAnimatablePropertiesCore();

		this.enableAnimatableProperty("colorStops", this.getColorStops, this.setColorStops, PropertyOptions.AffectsLayout);
	}

	getColorStops() {
		return this.getPropertyValue("colorStops");
	}

	setColorStops(value) {
		if (value == null) {
			value = [];
		}

		this.setPropertyValue("colorStops", value);
	}

	getColorStopCount() {
		return this.getColorStops().length;
	}

	getColorStop(index) {
		return this.getColorStops()[index];
	}

	addColorStop(value) {
		var stops = this.getColorStops();
		stops.push(value);

		this.setColorStops(stops);
	}

	clearColorStops() {
		this.setColorStops(null);
	}

	isEqualTo(other) {
		if (super.isEqualTo(other) && this.getColorStopCount() == other.getColorStopCount()) {
			var len = this.getColorStopCount();
			var stopA = null;
			var stopB = null;

			for (var i = 0; i < len; ++i) {
				stopA = this.getColorStop(i);
				stopB = other.getColorStop(i);

				if (stopA.isNotEqualTo(stopB)) {
					return false;
				}
			}

			return true;
		}

		return false;
	}
}

export default GradientBrush;

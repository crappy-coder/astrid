import EventDispatcher from "../EventDispatcher";
import Animatable from "../animation/Animatable";
import SourceEvent from "../SourceEvent";
import PropertyOptions from "../ui/PropertyOptions";

var Mixed = astrid.mixin(EventDispatcher, Animatable);

class Brush extends Mixed {
	constructor() {
		super();

		/** Boolean **/
		this.isAvailable = false;

		/** CanvasGradient/CanvasPattern **/
		this.nativeBrushCache = null;

		this.setOpacity(1);
		this.initializeAnimatableProperties();
	}

	initializeAnimatablePropertiesCore() {
		this.enableAnimatableProperty("transform", this.getTransform, this.setTransform, PropertyOptions.AffectsLayout | PropertyOptions.AffectsMeasure);
		this.enableAnimatableProperty("opacity", this.getOpacity, this.setOpacity, PropertyOptions.AffectsLayout);
	}

	getIsAvailable() {
		return this.isAvailable;
	}

	getTransform() {
		return this.getPropertyValue("transform");
	}

	setTransform(value) {
		this.setPropertyValue("transform", value);
	}

	getOpacity() {
		return this.getPropertyValue("opacity");
	}

	setOpacity(value) {
		this.setPropertyValue("opacity", Math.min(1, Math.max(0, value)));
	}

	raiseAvailableEvent() {
		this.isAvailable = true;
		this.dispatchEvent(new SourceEvent(SourceEvent.READY));
		this.raisePropertyChangedEvent("isAvailable", false, true);
	}

	isEqualTo(other) {
		if (this.getOpacity() == other.getOpacity()) {
			return astrid.areEqual(this.getTransform(), other.getTransform());
		}

		return false;
	}
}

export default Brush;

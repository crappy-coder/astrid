import EventDispatcher from "./EventDispatcher";
import { ValueOrDefault } from "./Engine";
import Color from "./Color";
import Animatable from "./Animatable";
import PropertyOptions from "./PropertyOptions";

class GradientStop extends EventDispatcher {
	constructor(color, offset) {
		super();

		this.setColor(ValueOrDefault(color, Color.Transparent));
		this.setOffset(ValueOrDefault(offset, 0));
		
		/** MoGradientBrush **/
		this.brush = null;
		
		this.initializeAnimatableProperties();
	}

	initializeAnimatablePropertiesCore() {
		this.enableAnimatableProperty("color", this.getColor, this.setColor, PropertyOptions.AffectsLayout);
		this.enableAnimatableProperty("offset", this.getOffset, this.setOffset, PropertyOptions.AffectsLayout);
	}

	getColor() {
		return this.getPropertyValue("color");
	}

	setColor(value) {
		this.setPropertyValue("color", value);
	}

	getOffset() {
		return this.getPropertyValue("offset");
	}
	
	setOffset(value) {
		this.setPropertyValue("offset", value);
	}
	
	isEqualTo(other) {
		return (MoAreEqual(this.getColor(), other.getColor()) && this.getOffset() && other.getOffset());
	}

	toString() {
		return "GradientStop[ offset=" + this.getOffset() + ", color=" + this.getColor() + " ]";
	}
}

Object.assign(GradientStop.prototype,  Animatable);

export default GradientStop;

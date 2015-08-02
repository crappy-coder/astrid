import EventDispatcher from "../EventDispatcher";
import { ValueOrDefault, AreEqual, Mixin } from "../Engine";
import Color from "../graphics/Color";
import Animatable from "../animation/Animatable";
import PropertyOptions from "../ui/PropertyOptions";

var Mixed = Mixin(EventDispatcher, Animatable);

class GradientStop extends Mixed {
	constructor(color, offset) {
		super();

		this.setColor(ValueOrDefault(color, Color.Transparent));
		this.setOffset(ValueOrDefault(offset, 0));
		
		/** GradientBrush **/
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
		return (AreEqual(this.getColor(), other.getColor()) && this.getOffset() && other.getOffset());
	}

	toString() {
		return "GradientStop[ offset=" + this.getOffset() + ", color=" + this.getColor() + " ]";
	}
}

export default GradientStop;

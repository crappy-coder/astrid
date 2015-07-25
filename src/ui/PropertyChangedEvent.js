import Event from "./../Event";

class PropertyChangedEvent extends Event {
	constructor(type, propName, oldValue, newValue, bubbles, cancelable) {
		super(type, bubbles, cancelable);

		this.propName = propName;
		this.oldValue = oldValue;
		this.newValue = newValue;
	}

	getPropertyName() {
		return this.propName;
	}

	getOldValue() {
		return this.oldValue;
	}

	getNewValue() {
		return this.newValue;
	}
}

PropertyChangedEvent.PROPERTY_CHANGED = "propertyChanged";

export default PropertyChangedEvent;

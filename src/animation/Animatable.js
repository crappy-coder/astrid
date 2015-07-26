import EventDispatcher from "../EventDispatcher";
import PropertyOptions from "../ui/PropertyOptions";
import PropertyChangedEvent from "../ui/PropertyChangedEvent";
import Drawable from "../ui/Drawable";
import Tuple from "../Tuple";
import Pair from "../Pair";
import { AreNotEqual } from "../Engine";

/**
 * @MIXIN
 *
 * SUMMARY:
 *  Provides the features required to make an object animate, when applied to a class, any properties
 *  that you want animated must be enabled in the initializeAnimatablePropertiesCore method, those
 *	properties must also use the getPropertyValue/setPropertyValue instead of using a class variable
 *	for the property value.
 *
 *	Any object defined with this mixin is allowed to participate in animations.
 *
 * REMARKS:
 *  Your class must also be a subclass of EventDispatcher, whether directly or indirectly.
 *
 * <code>
 *		class Ball extends EventDispatcher {
 *			constructor() {
 *				super();
 *
 *				// must call this to initialize your properties
 *				this.initializeAnimatableProperties();
 *			}
 *
 *			initializeAnimatablePropertiesCore() {
 *				// enable the 'size' property
 *				this.enableAnimatableProperty("size", getSize, setSize, PropertyOptions.None);
 *			}
 *
 *			getSize() {
 *				return this.getPropertyValue("size");
 *			}
 *
 *			setSize(value) {
 *				this.setPropertyValue("size", value);
 *			}
 *		}
 *
 * 		Object.assign(Ball.prototype, Animatable);
 *	</code>
 *
 * @EVENT PropertyChangedEvent.PROPERTY_CHANGED
 *
 * SUMMARY:
 *	Dispatched when a property value has changed.
 *
 */
var Animatable = {
	initializeAnimatableProperties() {
		/**
		 * SUMMARY:
		 * 	Begins the initialization of properties that need to be animated. This MUST be called
		 *  in your classes constructor, but after the super call. This method in turn also
		 *  calls your initializeAnimatablePropertiesCore method.
		 *
		 * REMARKS:
		 *	Throws an error if your class is not a subclass of EventDispatcher.
		 *
		 * RETURNS (void):
		 *
		 */

		if (!(this instanceof EventDispatcher)) {
			throw new Error("Animatable must be added to classes that derive from EventDispatcher");
		}

		// because Animatable is not really a class, we can use isAnimatable to check if the object
		// is in fact an Animatable object
		this.isAnimatable = true;

		// do the actual animatable property initialization
		this.initializeAnimatablePropertiesCore();
	},

	initializeAnimatablePropertiesCore() {
		/**
		 * SUMMARY:
		 * 	Override to initialize any properties that you wish to be animated.
		 * 	See example above on how this method should be implemented.
		 *
		 * RETURNS (void):
		 *
		 */
	},

	getPropertyValue(propertyName) {
		/**
		 * SUMMARY:
		 *  Gets the value of a property previously set using setPropertyValue.
		 *
		 * PARAMS:
		 *  String propertyName:
		 *		The name of the property you wish to get.
		 *
		 * RETURNS (any):
		 *  The value of your property, or null if the property was never set.
		 */

		return this[propertyName + "$"];
	},

	setPropertyValue(propertyName, value) {
		/**
		 * SUMMARY:
		 *  Sets the value of a property, if the value is different from the
		 *  value that is currently stored then a PropertyChangedEvent will
		 *  be dispatched to any listeners.
		 *
		 * PARAMS:
		 *  String propertyName:
		 *		The name of the property you wish to set.
		 *
		 *  Any value:
		 *		The value of the property, this can be any type, including null.
		 *
		 * RETURNS (Boolean):
		 *  true if the property changed, otherwise false. You can use this value
		 *  to determine whether or not you need to update anything else.
		 *
		 */

		var oldValue = this.getPropertyValue(propertyName);

		if (AreNotEqual(oldValue, value)) {
			this[propertyName + "$"] = value;
			this.raisePropertyChangedEvent(propertyName, oldValue, value);

			return true;
		}

		return false;
	},

	getAnimatablePropertyTuple(propertyName) {
		// @PRIVATE

		for (var i = 0; i < this.animatableProperties.length; i++) {
			var tuple = this.animatableProperties[i];

			if (tuple.getFirst() == propertyName) {
				return tuple;
			}
		}

		return null;
	},

	getAnimatablePropertySetter(propertyName) {
		// @PRIVATE

		var tuple = this.getAnimatablePropertyTuple(propertyName);

		if (tuple != null) {
			return tuple.getThird().getSecond();
		}

		return null;
	},

	getAnimatablePropertyGetter(propertyName) {
		// @PRIVATE

		var tuple = this.getAnimatablePropertyTuple(propertyName);

		if (tuple != null) {
			return tuple.getThird().getFirst();
		}

		return null;
	},

	getAnimatablePropertyOptions(propertyName) {
		// @PRIVATE

		var tuple = this.getAnimatablePropertyTuple(propertyName);

		if (tuple != null) {
			return tuple.getSecond();
		}

		return PropertyOptions.None;
	},

	enableAnimatableProperty(propertyName, getterFunc, setterFunc, options) {
		/**
		 * SUMMARY:
		 *  Enables a property to participate in animation updates, when a property is animatable
		 *  then changes to that property will also cause a layout, measure, etc... based on the
		 *  options you've provided.
		 *
		 * PARAMS:
		 *  String propertyName:
		 *		The name of the property you wish to enable.
		 *
		 *  Function getterFunc:
		 *		The function that should be used as the getter, for example, if your property name
		 *		is size, then you might use a getSize method to get the value of the size property.
		 *
		 *  Function setterFunc:
		 *		The function that should be used as the setter, for example, if your property name
		 *		is size, then you might use a setSize method to set the value of the size property.
		 *
		 *	PropertyOptions options = PropertyOptions.None:
		 *		The option flags, a combination of PropertyOptions values. These options specify
		 *		how changes to the property value should affect other systems, such as layout,
		 *		measurement and so on.
		 *
		 * RETURNS (void):
		 *
		 */

		options = ValueOrDefault(options, PropertyOptions.None);

		if (this.animatableProperties == null) {
			this.animatableProperties = [];
		}

		this.animatableProperties.push(new Tuple(propertyName, options, new Pair(getterFunc, setterFunc)));

		// enable property changes for drawables, this way, when a
		// property changes the drawable can respect the options
		if (this instanceof Drawable) {
			this.addEventHandler(PropertyChangedEvent.PROPERTY_CHANGED, this.handleDependantObjectPropertyChangedEvent.asDelegate(this));
		}
	},

	disableAnimatableProperty(propertyName) {
		/**
		 * SUMMARY:
		 *  Disables a property that was previously enabled using enableAnimatableProperty, you
		 *  can use this method if you no longer need a property to participate in animations.
		 *
		 * PARAMS:
		 *  String propertyName:
		 *		The name of the property you wish to disable.
		 *
		 * RETURNS (void):
		 *
		 */

		for (var i = this.animatableProperties.length - 1; i >= 0; i--) {
			var tuple = this.animatableProperties[i];

			if (tuple.getFirst() == propertyName) {
				this.animatableProperties.removeAt(i);
			}
		}

		// disable property changes for drawables
		if (this instanceof Drawable) {
			this.removeEventHandler(PropertyChangedEvent.PROPERTY_CHANGED, this.handleDependantObjectPropertyChangedEvent.asDelegate(this));
		}
	},

	togglePropertyChangedHandlerRecursive(target, handler, on) {
		// @PRIVATE

		if (this.animatableProperties == null) return;

		var props = this.animatableProperties;
		var len = props.length;
		var tuple = null;
		var propValue = null;

		// check each registered property, if one is animatable then continue
		// through that property value and so on...
		//
		// NOTE : the implementor must be responsible for removing the handlers
		//        simply by passing in false as the 'on' parameter.
		//
		for (var i = 0; i < len; ++i) {
			// get the property value and check it
			tuple = this.animatableProperties[i];
			propValue = tuple.getThird().getFirst().apply(this);

			// continue through until there are no more properties
			this.togglePropertyValue(propValue, target, handler, on);
		}

		// add or remove the handler
		if (on) {
			this.addEventHandler(PropertyChangedEvent.PROPERTY_CHANGED, handler);
		}
		else {
			this.removeEventHandler(PropertyChangedEvent.PROPERTY_CHANGED, handler);
		}
	},

	togglePropertyValue(propValue, target, handler, on) {
		// @PRIVATE

		if (propValue == null || (!(propValue instanceof Array) && !propValue.isAnimatable)) return;

		// the property is an array, iterate each item
		if (propValue instanceof Array) {
			var len = propValue.length;

			for (var i = 0; i < len; ++i) {
				this.togglePropertyValue(propValue[i], target, handler, on);
			}
		}
		else {
			propValue.togglePropertyChangedHandlerRecursive(target, handler, on);
		}
	},

	raisePropertyChangedEvent(propName, oldValue, newValue) {
		// @PRIVATE

		if (this instanceof EventDispatcher) {
			this.dispatchEvent(new PropertyChangedEvent(PropertyChangedEvent.PROPERTY_CHANGED, propName, oldValue, newValue));
		}
	}
};

export default Animatable;

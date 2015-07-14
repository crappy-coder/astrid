MoAnimatable = {
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
 *  Your class must also be a subclass of MoEventDispatcher, whether directly or indirectly.
 * 
 * <code>
 *		Ball = Class.create(MoEventDispatcher, MoAnimatable {
 *			initialize : function($super) {
 *				$super();
 *
 *				// must call this to initialize your properties
 *				this.initializeAnimatableProperties();
 *			},
 *
 *			initializeAnimatablePropertiesCore : function() {
 *				// enable the 'size' property
 *				this.enableAnimatableProperty(
 *					"size", getSize, setSize, MoPropertyOptions.None);
 *			},
 *
 *			getSize : function() {
 *				return this.getPropertyValue("size");
 *			},
 *
 *			setSize : function(value) {
 *				this.setPropertyValue("size", value);
 *			}
 *		});
 *	</code>
 *
 * @EVENT MoPropertyChangedEvent.PROPERTY_CHANGED
 *
 * SUMMARY:
 *	Dispatched when a property value has changed.
 *
 */
 
	initializeAnimatableProperties : function() {
		/**
		 * SUMMARY:
		 * 	Begins the initialization of properties that need to be animated. This MUST be called
		 *  in your classes initialize method, but after the $super call. This method in turn also
		 *  calls your initializeAnimatablePropertiesCore method.
		 *
		 * REMARKS:
		 *	Throws an error if your class is not a subclass of MoEventDispatcher.
		 *
		 * RETURNS (void):
		 *
		 */
	
		if(!(this instanceof MoEventDispatcher))
			throw new Error("Animatable must be added to classes that derive from MoEventDispatcher");

		// because Animatable is not really a class, we can use isAnimatable to check if the object
		// is in fact an Animatable object
		this.isAnimatable = true;
		
		// do the actual animatable property initialization
		this.initializeAnimatablePropertiesCore();
	},

	initializeAnimatablePropertiesCore : function() {
		/**
		 * SUMMARY:
		 * 	Override to initialize any properties that you wish to be animated. See 
		 *  example above on how this method should be implemented.
		 *
		 * RETURNS (void):
		 *
		 */
	},

	getPropertyValue : function(propertyName) {
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
	
	setPropertyValue : function(propertyName, value) {
		/**
		 * SUMMARY:
		 *  Sets the value of a property, if the value is different from the
		 *  value that is currently stored then a MoPropertyChangedEvent will
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

		if(MoAreNotEqual(oldValue, value))
		{
			this[propertyName + "$"] = value;
			this.raisePropertyChangedEvent(propertyName, oldValue, value);
			
			return true;
		}
		
		return false;
	},
	
	getAnimatablePropertyTuple : function(propertyName) {
		// @PRIVATE
		
		for(var i = 0; i < this.animatableProperties.length; i++)
		{
			var tuple = this.animatableProperties[i];

			if(tuple.getFirst() == propertyName)
				return tuple;
		}

		return null;
	},

	getAnimatablePropertySetter : function(propertyName) {
		// @PRIVATE
		
		var tuple = this.getAnimatablePropertyTuple(propertyName);

		if(tuple != null)
			return tuple.getThird().getSecond();

		return null;
	},
	
	getAnimatablePropertyGetter : function(propertyName) {
		// @PRIVATE
		
		var tuple = this.getAnimatablePropertyTuple(propertyName);

		if(tuple != null)
			return tuple.getThird().getFirst();

		return null;
	},
	
	getAnimatablePropertyOptions : function(propertyName) {
		// @PRIVATE
		
		var tuple = this.getAnimatablePropertyTuple(propertyName);
		
		if(tuple != null)
			return tuple.getSecond();

		return MoPropertyOptions.None;
	},
	
	enableAnimatableProperty : function(propertyName, getterFunc, setterFunc, options) {
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
		 *	MoPropertyOptions options = MoPropertyOptions.None:
		 *		The option flags, a combination of MoPropertyOptions values. These options specify
		 *		how changes to the property value should affect other systems, such as layout,
		 *		measurement and so on.
		 *
		 * RETURNS (void):
		 *
		 */
	
		options = MoValueOrDefault(options, MoPropertyOptions.None);
		
		if(this.animatableProperties == null)
			this.animatableProperties = new Array();

		this.animatableProperties.push(new MoTuple(propertyName, options, new MoPair(getterFunc, setterFunc)));
		
		// enable property changes for drawables, this way, when a
		// property changes the drawable can respect the options
		if(this instanceof MoDrawable)
			this.addEventHandler(MoPropertyChangedEvent.PROPERTY_CHANGED, this.handleDependantObjectPropertyChangedEvent.asDelegate(this));
	},
	
	disableAnimatableProperty : function(propertyName) {
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
	
		for(var i = this.animatableProperties.length - 1; i >= 0; i--)
		{
			var tuple = this.animatableProperties[i];

			if(tuple.getFirst() == propertyName)
				this.animatableProperties.removeAt(i);
		}

		// disable property changes for drawables
		if(this instanceof MoDrawable)
			this.removeEventHandler(MoPropertyChangedEvent.PROPERTY_CHANGED, this.handleDependantObjectPropertyChangedEvent.asDelegate(this));
	},

	togglePropertyChangedHandlerRecursive : function(target, handler, on) {
		// @PRIVATE
		
		if(this.animatableProperties == null)
			return;

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
		for(var i = 0; i < len; ++i)
		{
			// get the property value and check it
			tuple = this.animatableProperties[i];
			propValue = tuple.getThird().getFirst().apply(this);

			// continue through until there are no more properties
			this.togglePropertyValue(propValue, target, handler, on);
		}

		// add or remove the handler
		if(on)
			this.addEventHandler(MoPropertyChangedEvent.PROPERTY_CHANGED, handler);
		else
			this.removeEventHandler(MoPropertyChangedEvent.PROPERTY_CHANGED, handler);
	},

	togglePropertyValue : function(propValue, target, handler, on) {
		// @PRIVATE
		
		if(propValue == null || (!(propValue instanceof Array) && !propValue.isAnimatable))
			return;

		// the property is an array, iterate each item
		if(propValue instanceof Array)
		{
			var len = propValue.length;

			for(var i = 0; i < len; ++i)
				this.togglePropertyValue(propValue[i], target, handler, on);
		}
		else
		{
			propValue.togglePropertyChangedHandlerRecursive(target, handler, on);
		}
	},

	raisePropertyChangedEvent : function(propName, oldValue, newValue) {
		// @PRIVATE
		
		if(this instanceof MoEventDispatcher)
			this.dispatchEvent(new MoPropertyChangedEvent(MoPropertyChangedEvent.PROPERTY_CHANGED, propName, oldValue, newValue));
	}
};
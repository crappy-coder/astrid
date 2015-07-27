# Animation System

astrid includes a convenient framework for animating built-in objects and making your own objects participate in animations. 
An animation is the change of some value from start to finish over a period of time. 
There are a couple ways to use animations in astrid, the first is to simply use the BasicAnimation which animates a 
property from a start value to an end value using an easing function and interpolator to do so. Another more advanced
way to build an animation is by using an animation path, AnimationPath and key frames KeyFrame. 
Keyframe animation give you more precise control over your animation but can also become quite complex.
 
The ability to animate an object requires that it be animatable, that is, implement the Animatable interface. 
Unlike classes, the Animatable module is a mixin, a collection of methods, rather than a full class. 
There are two basic requirements to create an animatable object, the first is that your object must derive from the 
EventDispatcher class, either directly or in-directly (through a subclass of another class) and then implement the 
Animatable mixin, as the following example shows:

```js
class MyAnimatable extends EventDispatcher {
        constructor: function() {
                super();
        
                // must call the Animatable.initializeAnimatableProperties to
                // initialize the properties you want animated
                this.initializeAnimatableProperties();
        },
        
        // initialize the properties you want to be animated
        initializeAnimatablePropertiesCore: function() {
                this.enableAnimatableProperty("x", this.getX, this.setX, PropertyOptions.AffectsLayout | PropertyOptions.AffectsMeasure);
                this.enableAnimatableProperty("y", this.getY, this.setY, PropertyOptions.AffectsLayout | PropertyOptions.AffectsMeasure);
        },
        
        getX: function() {
                return this.getPropertyValue("x");
        },
        
        setX: function(value) {
                this.setPropertyValue("x", value);
        },
        
        getY: function() {
                return this.getPropertyValue("y");
        },
        
        setY: function(value) {
                this.setPropertyValue("y", value);
        }
}

Object.assign(MyAnimatable.prototype, Animatable);
```

 
In the example above, the MyAnimatable has x and y properties that can be animated.
The initializeAnimatablePropertiesCore marks these properties as being animatable by providing the name, the getter,
the setter and what type of affect these properties have on the object when changed. Unless your object derives from a 
SceneDrawable the property options will have no affect, for example, when the x value changes the framework will
automatically call requestLayout and requestMeasure for you so that your drawable is updated. The other critical piece 
is the way the getters and setters for the property values are created, these must use the Animatable.getPropertyValue
and Animatable.setPropertyValue methods so that the values can be tracked, these are simply convenience methods for you
that trigger property change events and handle other various checks required by the animation system.

All animations are considered property animations, meaning you are always animating some property value.
This allows you to animate properties of any object, including objects that don't actually participate in rendering.
The astrid animations are extensible and allow you to animate properties of custom object type.

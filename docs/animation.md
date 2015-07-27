astrid's animation system allows you to run very simple to very complex animations with an easy and flexible API. 
astrid does much of the work behind-the-scenes, like managing it's own timing system, generating the key frames, 
efficient redrawing of the animated content and much more. We provide a number of animation related classes that 
enable you to focus on the effects of your game or app, instead of the underlying mechanics used to achieve those effects. 
astrid also allows you to create your own custom animations using the same underlying system as the built-in animation classes.
 
Most objects and properties related to drawables can be animated, whether those properties are simple numbers or 
complex objects. There are various parts that make up the animation system as a whole, the following is a brief 
overview of these parts.

* Animation - The primary animation classes available to use and derive from. 
* Animation Sets - Various classes that allow multiple animations to be grouped together. 
* Animation Paths and Key Frames - Creates more finely tuned animations through the use of key frames. 
* Easing Functions - Allows your animations to feel smoother and provides a certain uniqueness with each one. 
* Interpolators - Handles the interpolation of a simple value, or complex object over time. 
* Animatable Interface - Allows objects to be animated.

## Table of Contents

1. Understanding an Animation
1. Grouping Multiple Animations
1. Using Keyframe Animation
1. Easing Functions
1. Creating your Own Easing Function
1. How Interpolators Work
1. Creating a Custom Interpolator
1. Making an Object Animatable

## Understanding an Animation

In astrid, you animate objects by applying an animation to their individual properties. For example, to make a drawable 
appear to grow in size, you would animate the width and height properties. To make an object fade in or out, you would 
animate it's alpha property.
 
For a property to participate in the animation system, it must meet the following requirements:
* It must be registered as an animatable property.
* It must belong to a class that implements SIAnimatable. 
* It must be a compatible type interpolator, if astrid does not have an interpolator for your type, you can create your own. See Creating a Custom Interpolator. 

astrid already contains many objects with animatable properties, such as SceneDrawable classes, Transform classes, Brush 
classes and more. Animations don't always have to be visual, you can animate objects that are not part of the draw tree 
as long as the meet the requirements above.
 
Let's look at an example that fades a shape out:

```js
// create an ellipse shape
var shape = new ShapeEllipse("myEllipse");
shape.setWidth(50);
shape.setHeight(50);
shape.setFill(new SolidColorBrush(Color.Red));

// add the shape to a draw tree
sceneContent.add(shape);

// create a basic animation on the alpha property of shape, from 1 to 0
var fadeOutAnimation = new BasicAnimation(shape, "alpha", 1, 0);
// let the animation run for 1 second
fadeOutAnimation.setDuration(1000);
// start the animation
fadeOutAnimation.play();
```

In the above example, we create a drawable shape fill with the color red, then create an animation for that shape to 
animate it's alpha property from 1 to 0, for a duration of 1000ms (or 1 second).
 
The BasicAnimation is (as the name suggest) the most basic way to animate a property, it simply takes an object, 
the property name and the value to and from. By default, the BasicAnimation used a number interpolator, 
NumberInterpolator, to interpolate the value over time. To animate a property with an object type, like a color, we 
would instead use a color interpolator (ColorInterpolator), like:
 
```js
animation.setInterpolator(ColorInterpolator.getInstance());
```
 
_Note: In the example above we show a way to use a different interpolator for a color, to animate a color you could 
instead use the ColorAnimation, which sets the interpolator for you._
 
Interpolators allow you to animate various object types, if there isn't already a predefined interpolator for your type 
you can create your own. See Creating a Custom Interpolator.
 
Animations also include various ways to control timing. You can specify the various timing values like it's duration, 
the number of times it repeats, when it should start and even how fast the time progresses.
 
There will be times when you need to animate more than one property at a time, the BasicAnimation only allows you to 
animate a single property, to animate more than one, you can group together multiple basic animations using one of the 
grouping containers, see Grouping Multiple Animations below for more information. However, if you want to animate 
multiple properties with that is much more finely tuned, you will need to use the Animation class and setup your 
animation paths for each property you wish to animate. An animation path defines how a single property is animated by 
using keyframes and an interpolator. See Using Keyframe Animation.
 
## Grouping Multiple Animations

astrid provides other animation classes to help you organize your animations into various animation sets (or animation 
containers). Animation sets derive from the AnimationSet class and include ParallelAnimation and SequenceAnimation.
 
As the name suggests, the parallel animation allows you to run run multiple animations in parallel with each other. 
For example, suppose you want to grow a menu item when the user presses it, you can simply add two BasicAnimations to a 
ParallelAnimation that modify the width and height, as the following shows:

```js
// create an ellipse shape
var shape = new ShapeEllipse("myEllipse");
shape.setWidth(50);
shape.setHeight(50);
shape.setFill(new SolidColorBrush(swColor.Red));

// add the shape to a draw tree
sceneContent.add(shape);

// create the parallel animation
var parallelAnimation = new ParallelAnimation();
// add two basic animations for the width and height property
parallelAnimation.add(new BasicAnimation(shape, "width", shape.getWidth(), shape.getWidth() + 10));
parallelAnimation.add(new BasicAnimation(shape, "height", shape.getHeight(), shape.getHeight() + 10));
// start the animation (default 1 second duration)
parallelAnimation.play();
```
 
In the previous code example, when the parallel animation plays the shape will grow in size by 10 pixels of the current 
size. The sequence animation is used exactly the same way, except instead of running in parallel the animations will run 
in a sequence; one by one. The following shows an example of using a sequence animation to move the shape 100 pixels to 
the right and then grow by 10 pixels in height:

```js
// create an ellipse shape
var shape = new ShapeEllipse("myEllipse");
shape.setWidth(50);
shape.setHeight(50);
shape.setFill(new SolidColorBrush(swColor.Red));

// add the shape to a draw tree
sceneContent.add(shape);

// create the parallel animation
var sequenceAnimation = new SequenceAnimation();
// add two basic animations for the x and height properties
sequenceAnimation.add(new BasicAnimation(shape, "x", 0, 100));
sequenceAnimation.add(new BasicAnimation(shape, "height", shape.getHeight(), shape.getHeight() + 10));
// start the animation (default 1 second duration)
sequenceAnimation.play();
```
 
Another benefit to animation sets is the ability to animate multiple properties across multiple objects, if the object 
to animate is omitted from the constructor of an animation set you must then include it with each individual animation 
(as the examples above shows), this allows you to specify multiple objects as an animation target. Alternatively, if you 
are only going to be animating the same object, like we did above, we could have simply just passed the shape object to 
the constructor of our ParallelAnimation or SequenceAnimation classes and omitted them from the BasicAnimation.
 
If neither the parallel or sequence animation is what you need, you can create your own custom animation set by 
extending the AnimationSet class.
 
## Using Keyframe Animation
Keyframe animations allows you to animate the value of a property, just like a normal animation, it computes the value 
over time. However, instead of creating a value between two values (from and to), a keyframe animation can compute the 
value among any number of values. A keyframe animation's values are defined by using individual keyframe objects. To set 
the animations values, you create keyframe objects and add them to an animation path's list of keyframes. Then add that 
animation path to an animation, when the animation is run, it transitions between the frames you specified.
 
As mentioned above, you first must add the keyframes to what we call an animation path. The animation path allows you to 
specify the property and an optional interpolator (if not animating a number type). To animate using a keyframe 
animation, you must:
* Create an animation instance for an object and set it's duration, just like a normal animation. 
* Create an animation path for the property you wish to animate and add it to the animation. 
* For every target value, create a keyframe and set it's value and keyTime, then add it to the animation path's keyframes property. 

The following example shows animating the x property of a shape to three different positions:

```js
// create an ellipse shape
var shape = new ShapeEllipse("myEllipse");
shape.setWidth(50);
shape.setHeight(50);
shape.setFill(new SolidColorBrush(swColor.Red));

// add the shape to a draw tree
sceneContent.add(shape);

// create the parallel animation
var keyframeAnimation = new Animation(shape);
// create the animation path and add the keyframes
var animationPath = new AnimationPath("x");
animationPath.addKeyFrame(new Keyframe(0, 0));
animationPath.addKeyFrame(new Keyframe(3000, 100));
``` 

The following graphic shows what the positions of the above keyframe animation will produce at the given time:


By default, each keyframe transitions to the next linearly, however, you can set a different easing function by using 
the keyframes `setEasing` method.
 
## Easing Functions

Easing functions allow you add custom transitions to your animations using a mathematical formula. Instead of using a 
complex keyframe animation to simulate a ball bouncing, you could simulate this effect by using a BounceEase. There are 
several built-in easing functions that you can use, the following is a list of these:
* BackEase - Backtracks the motion of an animation slightly before it begins. 
* BounceEase - Creates an animation with bouncing motion. 
* CubicEase - Creates an animation that accelerates and/or decelerates using the formula f(t) = t3. 
* ElasticEase - Creates an animation that represents a sine wave decaying over time, or a spring type motion. 
* ExpoEase - Creates an animation that accelerates and/or decelerates exponentially. 
* LinearEase - Creates an animation that accelerates linearly over time. 
* PowerEase - Creates an animation that accelerates and/or decelerates using the formula f(t) = tp. 
* QuadEase - Creates an animation that accelerates and/or decelerates using the formula f(t) = t2. 
* QuartEase - Creates an animation that accelerates and/or decelerates using the formula f(t) = t4. 
* QuintEase - Creates an animation that accelerates and/or decelerates using the formula f(t) = t5. 
* SineEase - Creates an animation that accelerates and/or decelerates using a sine wave. 

Easing functions also allow you to specify either an easing mode or a custom percentage to alter how the easing function 
performs (i.e. change how the animation interpolates). The three possible easing mode values are:
* EaseIn - The entire animation spends it's time easing in. 
* EaseOut - The entire animation spends it's time easing out. 
* EaseInOut - The animation is split in half, with the first half easing in and the second half easing out. 

As mentioned above, instead of passing in a pre-defined easing mode, you could pass in a percentage value from 0 to 1.0, 
in fact the pre-defined modes actually map to a percentage value, which are EaseOut = 0.0, EaseInOut = 0.5 and EaseIn = 1.0.
 
The following shows different graphs of each easing function and mode, where f(t) represents the animations progress and t represents the time.

## Creating your Own Easing Function

Instead of using one of the built-in easing functions, you may want to provide your own custom function. To do this, you 
would simply extend the EasingFunction class, then override the easeIn and easeOut methods. The following example shows 
what the PowerEase implementation looks like:

```js
class PowerEase extends EasingFunction {
        constructor: function(easingModeOrPercent, pow) {
                super(easingModeOrPercent);
                
                this.pow = ValueOrDefault(pow, 2);
        },
        
        getPow: function() {
                return this.pow;
        },
        
        setPow: function(value) {
                this.pow = value;
        },
        easeIn: function(t) {
                if (t < 0) {
                        return 0;
                }
                
                if (t > 1) {
                        return 1;
                }
                
                return Math.pow(t, this.getPow());
        },
        
        easeOut: function(t) {
                if (t < 0) {
                        return 0;
                }
                
                if (t > 1) {
                        return 1;
                }
                
                return 1 - Math.pow(1 - t, this.getPow());
        }
}
```
 
Once implemented, you can set your easing function on an animation as a whole, or on individual keyframes.
 
## How Interpolators Work

Interpolators compute the values for animations and give animations the ability to interpolate between arbitrary values. 
These interpolators take a value between 0.0 and 1.0 that indicates the current position of the animation where 0.0 
represents the start and 1.0 represents the end of the animation. In more basic terms, an interpolator is responsible for 
computing an output value for an animation at some point in time.
 
astrid already provides three built-in interpolators:
* ColorInterpolator - Computes a value between one color object and another, using a parametric interpolation.
* NumberInterpolator - Computes a value between one number and another, using a parametric interpolation.
* VectorInterpolator - Compute a value between one vector object and another, using a parametric interpolation.
 
If one of the interpolators above is not useful to you then you can provide your custom interpolator by extending the 
base Interpolator class.

### Creating a Custom Interpolator

Custom interpolators allow you to interpolate any type of value, for example, suppose you wanted to interpolate between 
two matrices, you could create a new matrix interpolator by extending the base Interpolator class:

```js
class MatrixInterpolator extends Interpolator {
        constructor: function() { 
                super();
        },
        
        interpolate: function(fraction, startValue, endValue) {
                // if we are at the start, then just return the startValue
                if (fraction == 0) {
                        return startValue;
                }
                
                // otherwise if we are at the end, then just return the endValue
                else if (fraction == 1) {
                        return endValue;
                }
                
                // compute your matrices values using some interpolation, most likely
                // you would just reuse the NumberInterpolator for each element in the matrix
                // and return the resulting matrix.
                var result = ...;
                
                return result;
        }

        // always define an interpolator as a singleton, unless you need specific initialization 
        // values for the interpolator to function correctly
        static getInstance : function() {
                if (MyMatrixInterpolator.Instance == null) {
                        MyMatrixInterpolator.Instance = new MyMatrixInterpolator();
                }
                
                return MyMatrixInterpolator.Instance;
        }
}
```

See also: Animation System.

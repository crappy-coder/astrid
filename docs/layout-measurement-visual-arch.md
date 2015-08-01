# Layout, Measurement and Visual State Architecture

The layout architecture is an important concept within the astrid framework, not only does it handle the general UI model but it is also at the core of all rendering. Here we will go into more detail on how layout, measuring and property changes affect the visual output and performance. There are three phases that occur when performing the overall layout operation. If you have worked with frameworks like Adobe Flex or Microsoft's WPF/Silverlight, you will find this familiar.


## Property Validation

This is the first phase, this is a concept very similar to that of other UI frameworks, in that when properties on a drawable are changed it doesn't make sense to perform potentially heavy tasks each time a property is changed, but instead wait until all the tasks required for a property update can be batched up together in a single task.

When handling property validation, you will want to override the drawable's own `commitProperties` method. This is used to coordinate any updates to a drawable's properties. Generally, you will only use this with those properties that affect the visual appearance of a drawable on the screen. To tell a drawable that one or more of it's properties has changed you would make a call to `invalidateProperties`, this will schedule a `commitProperties` call during the next layout cycle.

When you define your property setters, you will determine whether or not the property is something that will need extra processing and if so, make a call to `invalidateProperties`, like in the following example:

```js
setText: function(value) {
    if (this.text == value) return;
    this.text = value;
    this.textChanged = true;
    this.invalidateProperties();
},

setTextAlignment: function(value) {
    if (this.textAlignment == value) return;
    this.textAlignment = value;
    this.textChanged = true;
    this.invalidateProperties();
},

commitProperties: function() {
    super.commitProperties();

    // check if a text property has changed
    if (this.textChanged) {
        // reset flag
        this.textChanged = false;
        
        // handle change, i.e. compute the size of the
        // text, compute the new alignment, etc...
        // request a layout, if needed (i.e. to draw the new text
        // at the new position)
        this.requestLayout();
    }
}
```

As you can see above, the setter simply calls `invalidateProperties`, which immediately returns and does not perform any additional procession on the property itself. This allows you to leave the processing of the updated value to happen in the commitProperties method.


## Measuring

This is the second phase that occurs when a drawable is unable to determine the size of itself, that is, when the size has not been explicitly set. This is useful when building various containers with different sizing characteristics.

When handling the measuring of a drawable, you will want to override the drawable's own measure method, this is used to set the default size of the drawable. astrid schedules a call to the measure method when requested by calling `requestMeasure`. If you do not implement custom measuring the system will automatically do this for you. Once requested, the measure method will be called during the next layout cycle. If the drawable has an explicitly set width and height, the framework will automatically skip this phase because the drawable already knows it's exact size and does not need to be measured.

You will want to be sure to specify the size of the drawable by calling `setMeasuredWidth` and `setMeasuredHeight` at the end of your measure.

The following example shows the basics of overriding the measure method in your custom drawable:

```js
measure: function() {
    // call super if you want to perform the parent's class measure first
    super.measure();

    // iterate all the children and figure out the max width and height
    var maxWidth = 100;
    var maxHeight = 20;

    // set the measurement properties
    this.setMeasuredWidth(maxWidth);
    this.setMeasuredHeight(maxHeight);
}
```

In the example above, the measured width and height are explicitly set to 100 and 20; respectively. In a more realistic example, you would probably iterate all the children to determine the maximum width or height.


## Layout

This is the third and final phase, this is the most important of the three. Override the drawable's layout method to perform your layout logic. The layout method should size and position the children of your drawable based on previous measurements and property changes, and draws any visual elements that the drawable uses. The parent container of a drawable is responsible for determining the size of a drawable itself.

A drawable will not appear on the screen until it's layout method is called. astrid schedules a call to the layout method when requested by calling requestLayout. Once requested, the layout method will be called during the next layout cycle.

To set the final size of a drawable in the layout method, you will want to call `setLayoutSize` instead of setting the drawable's sizing properties, such as `setWidth` and `setHeight`. To move the drawable into it's final position, you will want to call `setLayoutPosition` instead of setting the drawable's positioning properties, such as `setX` and `setY`.

As well as positioning and sizing children, you use the layout method to also draw any visual characteristics of the drawable using the drawable's graphics object, you can get access to this object by calling the `getGraphics` method.

The layout method looks like the following:

```js
layout: function(nativeWidth, nativeHeight) {
}
```

The `nativeWidth` and `nativeHeight` properties are the unscaled size of the drawable, determined by it's parent drawable container. Even if you call `setScaleX`, `setScaleY` or `setRenderTransform` the size properties passed in do not include these. Scaling and transformations occur during the actual render pass, after the layout runs. For example, a drawable with a `nativeWidth` of 50 and a `scaleX` of 2.0 will appear 100 pixels wide when rendered.

The following example shows how one might implement the layout method to draw a rectangle:

```js
layout: function(nativeWidth, nativeHeight) {
        var gfx = this.getGraphics();
        // reset the graphics
        gfx.clear();
        
        // draw a rectangle
        gfx.drawRect(0, 0, nativeWidth, nativeHeight);
        
        // fill it with a solid red color
        gfx.fill(SolidColorBrush.fromColorHex("#FF0000"));
}
```

In the example above, a red rectangle will be drawn at the same size of the drawable in the top left corner. Coordinates are relative to the drawable itself so in the example above, if the drawable's x coordinate is set to 100 pixels, the rectangle will be drawn 100 pixels from the left of its parent.


## Conclusion

There is a lot of flexibility and control with drawables. By default, when a drawable is added to another drawable and/or various built-in properties are set, the `invalidateProperties`, `requestMeasure` and `requestLayout` are all called for you, as well as, if you specify an animation property that affects the rendering, layout or measurements of a drawable. For more information on animatable properties, see Animation System.

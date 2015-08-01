# Transforms

The transformation classes help you build matrices that can be applied to various visual objects. Each transformation class produces a matrix as a result. Transforms allow you to move, rotate, scale and skew drawables and brushes. A transform maps values from one coordinate space to another by using a transformation matrix, which is a set of three rows and three columns.

For 2D operations the last column in the matrix is always 0, 0, 1, and only the first two columns need to be specified.

Even though you could create and use a Matrix2D class directly, various Transform classes are provided that allow you to transform objects without actually knowing how the underlying matrix structure is created. For example, the RotateTransform class allows you to rotate an object just by passing an angle value to it. The following shows the list of the basic transformation classes available to you.

* RotateTransform - Rotates an object by a specified angle, in degrees. 
* ScaleTransform - Scales an object for a specified amount in the x and y direction. 
* SkewTransform - Skews an object for a specified angle in the x and y direction, in degrees. 
* TranslateTransform - Moves an object for a specified amount in the x and y direction. 

If you need to create more complex transformations, there are also the following classes:

* GeneralTransform - Allows you to combine all four of the basic transformations that are applied in the following order: Scale, Skew, Rotate, Translate. 
* MatrixTransform - Gives you the ability to create a custom transformation that may not be possible through the other classes. You provide the matrix values directly. 
* TransformSet - Allows you to combine any number of other transformations, including other MoTransformSet objects, in any order, into a single transform 


## Using a Transform

Transforms can be applied to brushes and drawables. To use a transform on an object that allows transformations, you create an instance of the transform class you wish to create and set it to a transformation property. For example, to apply a rotation transform to a drawable, you could use the `setRenderTransform` method, as shown below:

```js
// create the rotation transform to transform an object 45 degrees
var transform = new RotateTransform(45);

// set the transform to some drawable
drawable.setRenderTransform(transform);
```

In the example above we rotate a drawable by 45 degrees using a render transform. Render transforms only affect the final rendering of the drawable, this is the preferred method to use when transforming a drawable. Another method of transforming a drawable is to use the drawable's specific transform properties (i.e. `setX`, `setScaleX`, `setRotation`, etc...), however, these effect the internal layout matrix, causing the drawable to request a layout pass, whereas a render transform will only request a render pass.

Brushes also allow you to specify transforms through the setTransform property, this allows you to transform the brush's content. See Brushes for more information.

Transformations are also animatable, when a transformation is applied to an object it can be animated just like any other object and the result of animating the transform will also update the object to which it is bound to.


## The Coordinate System

When an object is transformed, not only are you transforming the object itself but also the coordinate space. By default, a transform operates around the origin of the object's coordinate system, which is in the top left (0,0). Most of the transformation classes have centerX and centerY properties that specify where the transform should be centered at, the only transform that does not include these properties is the translation transform, since it would have no effect.

Because rotations are the easiest to visualize, the following images show the difference between using the default coordinate system and specifying a new one.

![Default rotation](https://sweay.fogbugz.com/default.asp?pg=pgDownload&pgType=pgWikiAttachment&ixAttachment=26&sFileName=rotation-default.png)

The above shows what a 45 degree rotation looks like when applied to a rectangular shape, as you can see, the object rotates around the top left corner of the shape. The next image shows the same rotation transform when transformed around the point 30, 30, which is the exact center point of the shape.

![Centered Rotation](https://sweay.fogbugz.com/default.asp?pg=pgDownload&pgType=pgWikiAttachment&ixAttachment=27&sFileName=rotation-centered.png)

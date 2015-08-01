## Table of Contents
* Understanding the Draw Tree
* Building a Custom Drawable
* Drawable Rendering Order
* Conclusion
 
In astrid, the base class to anything that can be drawn to the screen is the Drawable class. There are many built-in 
classes that inherit from Drawable to draw text, images, shapes and more. A drawable doesn't always have to render it's 
own content, it can also be considered a container for other drawables whose content is rendered to the screen. 
Containers provide a way to make custom layouts.

The following is the full class hierarchy of all Mochica drawables:
 
As you can see in the diagram above, everything that is rendered to the screen extends from Drawable.
Drawable itself can also be used to create and render content. For example, you can create a new Drawable, get it's 
graphics object and use the drawing API to render content to it. The Drawable includes properties and methods essential 
to displaying and controlling your rendered content on the screen, including:

* sizing (setWidth, setHeight, setPercentWidth, setPercentHeight, setMeasuredWidth, setMeasuredHeight) 
* positioning (setX, setY)
* scaling (setScaleX, setScaleY) 
* rotation (setRotation)
* opacity (setAlpha)
* visibility
 
Because the Drawable extends NamedObjectCollection it also automatically acts as a container for other drawables. 
As long as an object is a subclass of Drawable then it can be added to any other Drawable and will be rendered with it.

## Understanding the Draw Tree
Drawables by themselves provide only basic on-screen visual content. Usually you'll want to combine multiple drawables
together to make a more complex composite drawable. For example, suppose you want to display an image with a watermark
on it, when the image moves, rotates or changes in alpha you'll want the watermark to also move, rotate and change in
alpha as well. To do this, you may combine the Image and Label objects into one of the containers. Since we want it to 
be displayed above the image we want to use an absolute positioning container. For that we would use a Canvas instance.

So to group the image and label together onto a canvas, we simply add the image and label drawables as children of a
canvas container, like the following:

```js
var image = new Image("myImage");
var label = new Label("myLabel");

// set the image source
image.setSource(...);
// set the watermark text
label.setText("Watermark");

var watermarkedImage = new Canvas("myWatermarkedImage");
watermarkedImage.add(image);
watermarkedImage.add(label);
```

In the example above we add an image and a label to a canvas. You add your content in the order that you wish them to 
display (from back to front), drawables added to other drawables are ordered like layers, placing the next over the top
of the previous one.

Now that the canvas contains two children, manipulating the canvas will also manipulate the children of that canvas,
for example to move everything 100 pixels over to the right, we can just do:

```js
// move image and text 100 pixels to the right
watermarkedImage.setX(100);
```

Drawables also have their own coordinate system that starts with `0,0` at the top left corner that is always relative to
their parent drawable. The following image shows a ShapeRectangle drawn at `40px,40px` then it shows an overlay of that
same rectangle with a 45 degree rotation around the rectangles coordinate origin of `0,0`.

_Note: Rotations are always in degrees, not radians._

As shown above, the rotation happens around the default x, y position of 0,0, to change this, you can use the 
`setTransformOrigin` method. This moves the point where all transformation properties originate from. It's important to
understand how the coordinate system works. No matter how deep a drawable is nested within other drawables it always has
its own coordinate system.

There are various methods available to you for manipulating the draw tree, see NamedObjectCollection for a description
of each one.

## Building a Custom Drawable
In the previous section, we talked about how to combine multiple drawables together to make composite drawables. 
While this is fine way to do it, it doesn't allow for much reuse. Instead, using the same example we can create a custom
drawable that can be reused multiple times. To do this, we need to create our own class. We'll call it
`MyWatermarkedImage`, implement a few methods, then use it.

The following example shows how you might go about creating the MyWatermarkedImage drawable:

```js
class MyWatermarkedImage extends Drawable {
        constructor: function(name) {
                super(name);
                
                this.watermarkText = "";
                this.image = null;
                this.label = null;
        },
        
        getWatermarkText: function() {
                return this.watermarkText;
        },
        
        setWatermarkText: function(value) {
                if (this.watermarkText == value) return;
                
                // update the internal text field
                this.watermarkText = value;
                
                // update our label, because this is all we want to do
                // we just set the text here instead of during the commitProperties
                this.label.setText(this.watermarkText);
        },
        
        // override the createChildren method, this is called when the drawable gets initialized
        createChildren: function() {
        
                // create the image
                this.image = new Image("image");
                
                // set the image source
                this.image.setSource(...);
                
                // add the image to our children
                this.add(this.image);
                
                
                // create the label
                this.label = new Label("text");
                
                // set the text
                this.label.setText(this.getWatermarkText());
                
                // add the label to our children
                this.add(this.label);
        }
        
        // additionally, you can override the layout method to provide a custom layout
        // for your watermark label, like showing it at an angle from the top left to
        // the bottom left
});
```

Finally, to use our custom drawable we just create a new instance of it and add it to the main scene or some other
drawable, like so:

```js
// create 2 watermarked images
var watermarkImage1 = new MyWatermarkedImage("image1");
var watermarkImage2 = new MyWatermarkedImage("image2");

// set the text of each one
watermarkImage1.setWatermarkText("Property of Me");
watermarkImage2.setWatermarkText("Property of Me");

// set the image sources (omitted in our example for brevity)
// ...

// finally add them to some other drawable (or a scene)
someDrawable.add(watermarkImage1);
someDrawable.add(watermarkImage2);
```

Creating custom drawables is a great way to create and reuse your own custom drawable library.

## Drawable Rendering Order
The order in which visual content is rendered makes a big difference for how you provide your visual content. 
The following figure shows the order in which graphics content (submitted via the drawables' Graphics object),
the drawables' children, transformations, effects and alpha are rendered to the screen:


The rendering order includes two sets of transformations. The first is the layout transform (or layout matrix), this is
the transform that is used when you modify the position, rotation, scale and/or skew properties of the drawable 
directly. The layout transform also occurs around the transform origin of the drawable. 
The render transform is the transformation that you set using `setRenderTransform`, this allows you to build your own
custom transforms in the order and around an origin that you choose.

The layout transformation occurs either at the default `0,0` x/y coordinates or at the transform origin you specified
using the `setTransformOrigin` method. The order in which the transformation happens is:

* Scale (`setScaleX`, `setScaleY`) 
* Skew (`setSkewX`, `setSkewY`) 
* Rotate (`setRotation`) 
* Translate (`setX`, `setY`) 

## Conclusion
To conclude this article, here's a quick recap and brief overview of some of the other features provided by a drawable.

The Drawable is the core astrid object for displaying content on the screen. Its primary role is to provide support for
rendering various content. Whether you are building a game or a GUI, drawables offer the flexibility to create all kinds
of controls. The drawable object provides support for:

* Visual Content - Rendering various types of visual content to the screen. 
* Transformations - Performing various transformations, either by setX/Y, setScaleX/Y, setRotation, setSkewX/Y or more advanced transformations using `setRenderTransform`.
* Hit Testing - Determining whether or not a point is contained within the bounds of the drawable. 
* Bounding Box - Determining the bounding rectangle of a drawable, locally and globally by using `getBounds`, `getGlobalBounds`. 
* Event Handling - Dispatching events to handlers for various state changes and interactivity. 
* Layout - Allows for custom visual layouts. 
* Effects - Add multiple effects to a drawable, like drop shadows or blurs. 
* Alpha and Alpha Masks - Change the alpha of drawables or use an alpha mask to mask portions of your rendered content from being shown. 

When drawing content to a drawable, you never actually create an instance of the Graphics object but instead acquire it
from the drawable that you wish to draw to.

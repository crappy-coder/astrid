## Table of Contents
1. Introduction
1. Using a Brush
1. Solid Color
1. Linear Gradient
1. Radial Gradient
1. Image
1. Brush Transparency
1. Brush Transformations

## Introduction
Brushes provide the ability to render visual content to the screen, without them, astrid wouldn't be able to actually 
show much. Brushes allow you to paint various drawables using either a solid color, gradient, image, canvas, video or 
even other drawables. The following shows the different types of brushes available in astrid and what they might look 
like when rendered.

## Using a Brush
To use a brush, you either pass it directly to a drawables graphics API or through some drawable property, for example, 
Shape classes allow you to specify a brush as the fill for the shape and Control classes allow you to specify a brush 
as the background. The following sections show examples of how you might use each one of the brushes to fill a 
rectangular shape.

## Solid Color
The SolidColorBrush will paint the visual content using a solid color. This brush simply takes an Color that can created 
by specifying the individual color components, by a hexadecimal value or by using any of the other methods available on 
Color. The following example shows a shape being filled in with a green color using the solid color brush:

```js
var shape = new ShapeRectangle("myRect");
shape.setX(10);
shape.setY(10);
shape.setWidth(100);
shape.setHeight(100);

// fill the shape with a solid color
shape.setFill(new SolidColorBrush(Color.fromHex("#a6ce39")));
this.content.add(shape);
```

See the SolidColorBrush class for more information.

## Linear Gradient
The LinearGradientBrush will paint the visual content using a linear gradient. The linear gradient brush blends two or 
more colors across a line at some specified angle. Each color and their position is specified through the use of 
gradient stops. The following example shows a shape being filled in with a green and white color using the linear 
gradient brush:

```js
var shape = new ShapeRectangle("myRect");
shape.setX(10);
shape.setY(10);
shape.setWidth(100);
shape.setHeight(100);

// fill the shape with a linear gradient
var brush = LinearGradientBrush.fromColorsWithAngle(
        Color.fromHex("#ffffff"),
        Color.fromHex("#a6ce39"),
        45);
shape.setFill(brush);

this.content.add(shape);
```

See the LinearGradientBrush class for more information.

## Radial Gradient
The RadialGradientBrush will paint the visual content using a radial gradient. The radial gradient brush blends two or 
more colors across a circle. Each color and their position is specified through the use of gradient stops. The following 
example shows a shape being filled in with a green and white color using the radial gradient brush:

```js
var shape = new ShapeRectangle("myRect");
shape.setX(10);
shape.setY(10);
shape.setWidth(100);
shape.setHeight(100);

// fill the shape with a radial gradient
var brush = RadialGradientBrush.fromColors(
        Color.fromHex("#ffffff"),
        Color.fromHex("#a6ce39"));
shape.setFill(brush);

this.content.add(shape);
```

See the RadialGradientBrush class for more information.

## Image
The ImageBrush can be used to paint any type of image source (see Image Sources), like the content of another HTML5 
canvas element, a video or drawable. The following example shows a shape being fill in with an image of the 
Seattle Space Needle using the image brush:

```js
var shape = new ShapeRectangle("myRect");
shape.setX(10);
shape.setY(10);
shape.setWidth(100);
shape.setHeight(100);

// fill the shape with a radial gradient
var brush = ImageBrush.fromUrl("seattle.png");
shape.setFill(brush);

this.content.add(shape);
```

See the ImageBrush class for more information.

## Brush Transparency
All brushes have an opacity property that can be used to specify how transparent a brush is when rendered. 
Because some brushes also use colors and colors have an alpha component the final opacity of a brush will depend on what 
the opacity level of the brush is set to as well as the opacity (alpha) level of the color(s) for the brush. The final 
opacity of a brush will be computed by multiplying the opacity value of the brushes color with the opacity value of the 
actual brush itself.

Because drawables also support transparency the level of opacity specified on the drawable is also multiplied with that 
of the brush and colors. If you can, it's better to set the opacity on a brush instead of a drawable because the entire 
drawable will need to be alpha blended and cause extra state changes.

## Brush Transformations
Brushes also support the use of transforms that allow it's content to be translated, scaled, rotated and skewed. 
Brush transforms operate on absolute coordinates and work very similar to that of a drawable's transform, see Transforms.

# Shapes

astrid provides a number of pre-built shape classes derived from the Shape class. Because shapes are also drawables themselves, you can manipulate them just as you would with any other drawable. Shapes expose a number of other properties that affect the visual appearance of a shape, like the fill, stroke, stroke line cap, joins and thickness.

Shapes can be used within other drawables to provide various visual cues and rendered content, for example, you could use multiple ellipse shapes to simulate a characters eyes.

The following is the list of available shapes:

* ShapeEllipse - Draws an elliptical shape.
* ShapeLine - Draws a line from one point to another point.
* ShapePath - Uses a set of drawing commands to draw something very simple or very complex using a Path like syntax.
* ShapePolygon - Draws a series of connected straight lines to form a closed shaped.
* ShapePolyline - Draws a series of connected straight lines.
* ShapeRectangle - Draws a rectangular shape.

## Using a Dashed Stroke

One special feature of using shapes is the ability to dash the shapes outline (or stroke), by default, the HTML5 canvas rendering context does not support dashing, instead we do a bit of magic to the shapes path to enable you to specify a dash pattern for your stroke. Because we currently perform the dashing through software via JavaScript, it should be only be used on smaller shapes or shapes that do not regularly require rendering, otherwise performance may be degraded.

To dash a shape, you specify the type of line cap to use for each dash, which is applied to the start and end of a dash and then either specify one of the pre-defined styles in DashStyle or build your own. The following example shows an ellipse with a 2px dash applied to it:

![](https://sweay.fogbugz.com/default.asp?pg=pgDownload&pgType=pgWikiAttachment&ixAttachment=33&sFileName=dashed.png)

The following is the code used to produce the result above:

```js
var shape = new ShapeEllipse("myEllipse");
shape.setWidth(100);
shape.setHeight(100);
shape.setX(10);
shape.setY(10);
shape.setFill(new SolidColorBrush(Color.fromHex("#FFFFFF")));

// sets a 2 pixel wide stroke using a green color
shape.setStrokeThickness(2);
shape.setStroke(new SolidColorBrush(Color.fromHex("#a6ce39")));

// enables the stroke to be dashed
shape.setStrokeDashStyle(DashStyle.Dash);

this.content.add(shape);
```

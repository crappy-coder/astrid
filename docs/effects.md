## Table of Contents
* Introduction
* Creating Custom Effects
 
## Introduction
astrid provides the ability to use custom effects with drawables. Every drawable allows you to call the `setRenderEffects` method which takes an array of Effect objects, thus allowing the use of multiple effects per drawable. For example, you could apply a drop shadow and a blur. Effects simply process a set of pixels according to some pixel processing algorithm or formula. Whenever a drawable's visual content changes the effect is reapplied.

Currently, effects are processed through software using JavaScript only, because of this, effects will degrade performance, sometimes to the point that your game or app becomes unusable. Take caution when using effects. It is recommended to try and substitute an image for an effect or in someway fake it if possible. However, if you do use effects, we have made some optimizations.

When an effect is applied to a drawable that does not have bitmap caching enabled, astrid will enable it. The reason astrid needs to enable bitmap caching is so that a bitmap representation of your drawable is created. This bitmap is then sent to the effect to be processed, it also allows for faster processing, meaning if none of the content is updated but you animate a drawable with an effect, the drawable does not need to re-render itself and re-apply the effect, instead it just needs to draw the bitmap representation already previously created.

_Note: We are doing various experimental work with effects to be processed in hardware and other performance optimizations that make using effects much more practical, when it's determined that we have succeeded in making effect processing much faster we will update the contents of this article to reflect those changes._

The following shows a drop shadow effect applied to a rectangle shape with a 5 pixel wide blue stroke:

```js
var rect = new ShapeRectangle("rect");
rect.setX(20);
rect.setY(20);
rect.setWidth(200);
rect.setHeight(125);
rect.setStrokeThickness(5);
rect.setStroke(new SolidColorBrush(MoColor.Blue));

// create and set the drop shadow effects, the render effects
// takes an array as the parameter
var effects = [ new MoDropShadowEffect() ];
rect.setRenderEffects(effects);

// add rect to some content
this.content.add(rect);
```

See the Effect class for a list of built-in effects available to you.

## Creating Custom Effects
astrid allows you to build your own custom effects by creating extending Effect and implementing the `processCore` method.
This method simply takes a target drawable and the actual pixel data to be processed, the return result must be the process pixel data in a pixel array. The following example shows how one might implement a color burn effect:

```js
class MyColorBurnEffect extends Effect {
        constructor: function() {
                super();
        },

        processCore: function(target, pixelData) {
                var globalBounds = target.getGlobalBounds();
                
                var dstData = GraphicsUtil.getImageData(
                        target.getDisplaySurface().getNativeGraphicsContext(), 
                        globalBounds.x, globalBounds.y, pixelData.width, pixelData.height, true);
                        
                var src = pixelData.data;
                var dst = dstData.data;
                var len = src.length;
                var alpha = 1;

                for (var i = 0; i < len; i += 4) {
                        var sr = src[i + 0];
                        var sg = src[i + 1];
                        var sb = src[i + 2];
                        var sa = src[i + 3];
                        var dr = dst[i + 0];
                        var dg = dst[i + 1];
                        var db = dst[i + 2];
                        var da = dst[i + 3];
                        var dor, dog, dob;
                        
                        if (sr != 0) {
                                dor = Math.max(255 - (((255 - dr) << 8) / sr), 0);
                        }
                        else {
                                dor = sr;
                        }
                        
                        if (sg != 0) {
                                dog = Math.max(255 - (((255 - dg) << 8) / sg), 0);
                        }
                        else {
                                dog = sg;
                        }
                        
                        if (sb != 0) {
                                dob =  Math.max(255 - (((255 - db) << 8) / sb), 0);
                        }
                        else {
                                dob = sb;
                        }
                        
                        var a = alpha * sa / 255;
                        var ac = 1 - a;
   
                        dst[i] = (a * dor + ac * dr);
                        dst[i + 1] = (a * dog + ac * dg);
                        dst[i + 2] = (a * dob + ac * db);
                        dst[i + 3] = (sa * alpha + da * ac);
                }
                
                return dstData;
        }
});
```

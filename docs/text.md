# Text

astrid provides the ability to display text through the Label class, which extends Drawable and is one of the provided "drawables". You can also draw text yourself through a drawables graphics API. astrid doesn't use bitmap fonts to display text but instead uses the platforms native text rendering APIs to do so.

The following example shows using an Label to display the text "Hello World!" using a 38px Arial font:

``` js
var lbl = new Label("myLabel");
lbl.setX(10);
lbl.setY(10);
lbl.setFontName("Arial");
lbl.setFontSize("38");
lbl.setText("Hello World!");
lbl.setForeground(new SolidColorBrush(Color.fromHex("#a6ce39")));
this.content.add(lbl);
```

The Label class also allows you to specify various text options, like line height, alignment and trimming. See Label for more information.


## Measuring Text

Currently only basic text metrics are provided. To determine the size of some text, you create a Font object, specify the font, size, weight and/or style then call the `measuringString` method, which will return a Size object with the width and height of the text.

import Application from "../../../src/Application";
import Event from "../../../src/Event";
import Canvas from "../../../src/ui/Canvas";
import SolidColorBrush from "../../../src/brushes/SolidColorBrush";
import ShapeEllipse from "../../../src/shapes/ShapeEllipse";
import Color from "../../../src/graphics/Color";
import ColorAnimation from "../../../src/animation/ColorAnimation";
import RepeatBehavior from "../../../src/animation/RepeatBehavior";

var app = Application.create();

app.setEnableStatsGraph(true);
app.addEventHandler(Event.APPLICATION_START, onApplicationStart);

function onApplicationStart(e) {
	var surface = app.getDisplaySurfaceAt(0);
	var content = new Canvas("mainContent");
	content.setPercentWidth(100);
	content.setPercentHeight(100);
	content.setBackground(SolidColorBrush.fromColorHex("#333333"));

	surface.setChild(content);

	var shape = new ShapeEllipse("ellipse");
	shape.setX(100);
	shape.setY(100);
	shape.setWidth(200);
	shape.setHeight(200);
	shape.setStroke(new SolidColorBrush(Color.White));
	shape.setStrokeThickness(4);
	shape.setFill(new SolidColorBrush(Color.Green));

	content.add(shape);

	var animation = new ColorAnimation(shape.getFill(), "color", Color.Green, Color.Red);
	animation.setDuration(2000);
	animation.setDelay(1000);
	animation.setRepeatCount(0);
	animation.setRepeatBehavior(RepeatBehavior.Reverse);
	animation.play();
}

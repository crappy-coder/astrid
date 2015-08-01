var g_app = MoApplication.create();

g_app.setEnableStatsGraph(true);
g_app.addEventHandler(MoEvent.APPLICATION_START, onApplicationStart.d(this));

function onApplicationStart(e) {
	var surface = g_app.getDisplaySurfaceAt(0);
	var content = new MoCanvas("mainContent");
	content.setPercentWidth(100);
	content.setPercentHeight(100);
	content.setBackground(MoSolidColorBrush.fromColorHex("#333333"));
	
	surface.setChild(content);
	
	var shape = new MoShapeEllipse("ellipse");
	shape.setX(100);
	shape.setY(100);
	shape.setWidth(200);
	shape.setHeight(200);
	shape.setStroke(new MoSolidColorBrush(MoColor.White));
	shape.setStrokeThickness(4);
	shape.setFill(new MoSolidColorBrush(MoColor.Green));

	content.add(shape);

	var animation = new MoColorAnimation(shape.getFill(), "color", MoColor.Green, MoColor.Red);
	animation.setDuration(2000);
	animation.setDelay(1000);
	animation.setRepeatCount(0);
	animation.setRepeatBehavior(MoRepeatBehavior.Reverse);
	animation.play();
}
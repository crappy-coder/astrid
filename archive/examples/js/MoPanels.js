var g_app = MoApplication.create();
g_app.setEnableStatsGraph(true);
g_app.setEnableDebugVisuals(true);
g_app.addEventHandler(MoEvent.APPLICATION_START, handleApplicationStart.asDelegate(this));

function handleApplicationStart(e) {
	var surface = g_app.getDisplaySurfaceAt(0);

	var content = new MoCanvas("mainContent");
	content.setPercentWidth(100);
	content.setPercentHeight(100);
	content.setBackground(MoSolidColorBrush.fromColorHex("#333333"));

	surface.setChild(content);
	
	
	// 1. Border w/ child using margins
	var border = new MoBorder("border");
	border.setX(10);
	border.setY(10);
	border.setWidth(300);
	border.setHeight(300);
	border.setBackground(MoSolidColorBrush.white());
	border.setBorderBrush(MoSolidColorBrush.blue());
	border.setBorderThickness(3);
	
	var c = new MoShapeRectangle("r1");
	c.setWidth(100);
	c.setHeight(100);
	c.setMarginLeft(10);
	c.setMarginTop(10);
	c.setFill(MoSolidColorBrush.red());
	
	border.setChild(c);
	content.add(border);
	
	// 2. Horizontal Stack Panel with children alignments and margins
	var stack = new MoStackPanel("stack");
	stack.setX(10);
	stack.setY(320);
	stack.setOrientation(MoOrientation.Horizontal);
	stack.setBackground(MoSolidColorBrush.red());
	
	var c = new MoShapeRectangle("r1");
	c.setWidth(100);
	c.setHeight(100);
	c.setVerticalAlignment(MoVerticalAlignment.Center);
	c.setFill(MoSolidColorBrush.green());
	stack.add(c);
	
	c = new MoShapeRectangle("r2");
	c.setWidth(140);
	c.setHeight(100);
	c.setFill(MoSolidColorBrush.blue());
	c.setMarginLeft(20);
	c.setMarginBottom(10);
	stack.add(c);
	
	c = new MoShapeRectangle("r3");
	c.setWidth(100);
	c.setHeight(100);
	c.setFill(MoSolidColorBrush.green());
	stack.add(c);
	
	content.add(stack);
	
	var a = new MoBasicAnimation(stack, "x", 0, 100);
	a.setDuration(2000);
	a.setRepeatBehavior(MoRepeatBehavior.Reverse);
	a.setRepeatCount(0);
	a.play();
	
	
	// 3. Dock Panel
	var dock = new MoDockPanel("dock");
	dock.setX(350);
	dock.setBackground(MoSolidColorBrush.yellow());
	dock.setFillLastChild(false);
	dock.setWidth(600);
	dock.setHeight(500);
	
	var c = new MoShapeRectangle("r1");
	c.setWidth(100);
	c.setHeight(100);
	c.setDock(MoDock.Left);
	c.setFill(MoSolidColorBrush.green());
	dock.add(c);
	
	c = new MoShapeRectangle("r2");
	c.setWidth(100);
	c.setHeight(100);
	c.setDock(MoDock.Top);
	c.setFill(MoSolidColorBrush.blue());
	c.setMarginLeft(20);
	dock.add(c);
	
	c = new MoShapeRectangle("r3");
	c.setWidth(100);
	c.setHeight(100);
	c.setDock(MoDock.Right);
	c.setFill(MoSolidColorBrush.green());
	dock.add(c);

	content.add(dock);
	
	// 4. Wrap Panel
	var wrap = new MoWrapPanel("wrap");
	wrap.setBackground(MoSolidColorBrush.yellow());
	wrap.setX(980);
	wrap.setHorizontalGap(5);
	wrap.setVerticalGap(5);
	wrap.setItemWidth(20);
	wrap.setItemHeight(20);

	for(var i = 0; i < 12; i++)
	{
		var c = new MoShapeRectangle("r1");
		c.setWidth(20);
		c.setHeight(20);
		c.setFill(MoSolidColorBrush.green());
		wrap.add(c);
	}

	content.add(wrap);
}
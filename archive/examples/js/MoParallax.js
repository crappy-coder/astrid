var g_app = MoApplication.create();
var g_view = null;
var g_cam = null;
var g_dir = "";

g_app.setEnableStatsGraph(true);
g_app.setEnableDebugVisuals(false);
g_app.addEventHandler(MoEvent.APPLICATION_START, onApplicationStart.d(this));

function onApplicationStart(e) {
	var surface = g_app.getDisplaySurfaceAt(0);
	var content = new MoCanvas("mainContent");
	
	surface.addEventHandler(MoKeyEvent.KEY_DOWN, this.handleKeyDown.asDelegate(this));
	surface.addEventHandler(MoKeyEvent.KEY_UP, this.handleKeyUp.asDelegate(this));
	
	content.setPercentWidth(100);
	content.setPercentHeight(100);
	content.setBackground(MoSolidColorBrush.fromColorHex("#333333"));
	
	surface.setChild(content);	
	surface.focus();
	
	var layer = null;
	var img = null;
	var item = null;

	g_view = new MoCanvas("parallax");
	g_view.setPercentWidth(100);
	g_view.setPercentHeight(100);
	g_view.setClip(new MoRectangle(0, 0, 800, 480));
	g_view.setBackground(MoSolidColorBrush.black());
	
	g_cam = new MoParallaxCamera2D(g_view, 0, 0, 800, 480, 1);
	g_cam.setSpeed(2);
	g_cam.setLimits(0, 0, 1120, 480);
	g_app.addCamera(g_cam);

	content.add(g_view);
	
	// background
	layer = new MoParallaxCanvasLayer("a");
	layer.setRatio(1);
	
	img = MoImage.create("a1", "resources/bg/Layer0_0.png");
	layer.add(img);
	
	img = MoImage.create("a2", "resources/bg/Layer0_1.png");
	img.setX(800);
	layer.add(img);
	
	img = MoImage.create("a3", "resources/bg/Layer0_2.png");
	img.setX(800*2);
	layer.add(img);
	
	g_cam.add(layer, new MoVector2D(1, 1));
	
	// middle
	layer = new MoParallaxCanvasLayer("b");
	layer.setRatio(1.5);
	
	img = MoImage.create("b1", "resources/bg/Layer1_0.png");
	layer.add(img);
	
	img = MoImage.create("b2", "resources/bg/Layer1_1.png");
	img.setX(800);
	layer.add(img);
	
	img = MoImage.create("b3", "resources/bg/Layer1_2.png");
	img.setX(800*2);
	layer.add(img);
	
	g_cam.add(layer, new MoVector2D(2, 2));
	
	// foreground
	layer = new MoParallaxCanvasLayer("c");
	layer.setRatio(1.75);
	
	img = MoImage.create("c1", "resources/bg/Layer2_0.png");
	layer.add(img);
	
	img = MoImage.create("c2", "resources/bg/Layer2_1.png");
	img.setX(850);
	layer.add(img);
	
	img = MoImage.create("c3", "resources/bg/Layer2_2.png");
	img.setX(900*2);
	layer.add(img);
	
	g_cam.add(layer, new MoVector2D(3, 3));
	
	MoApplication.getInstance().addEventHandler(MoFrameEvent.ENTER, this.handleFrameTickEvent.asDelegate(this));
}

function handleFrameTickEvent(e) {
	if(g_dir == "l")
		g_cam.move(-1, 0);
	else if(g_dir == "r")
		g_cam.move(1, 0);
}

function handleKeyUp(e) {
	g_dir = "";
}

function handleKeyDown(e) {	
	switch(e.getKey())
	{
		case MoKey.Left:
			g_dir = "l";
			break;
		case MoKey.Right:
			g_dir = "r";
			break;
	}
}
var g_app = MoApplication.create();
var g_mx = 0;
var g_my = 0;

g_app.setEnableStatsGraph(true);
g_app.setEnableDebugVisuals(false);
g_app.addEventHandler(MoEvent.APPLICATION_START, onApplicationStart.d(this));

function onApplicationStart(e) {
	var surface = g_app.getDisplaySurfaceAt(0);
	var content = new MoCanvas("mainContent");
	
	content.setPercentWidth(100);
	content.setPercentHeight(100);
	content.setBackground(MoSolidColorBrush.fromColorHex("#333333"));

	surface.setChild(content);	
	surface.focus();
	
	// 1. Using a texture source
	var imageSource = new MoTextureSource("resources/skyline.png");
	var image = MoImage.create("myImage01", imageSource);
	image.setWidth(250);

	content.add(image);

	
	// 2. Using a MoImage directly
	var image = MoImage.create("myImage02", "resources/skyline.png");
	image.setAutoLoad(false);
	image.setY(175);
	image.setWidth(250);
	image.load();

	content.add(image);
	
	// 3. Using a MoImage w/ Tiling and a Source Rectangle
	var image = MoImage.create("myImage03", "resources/atlas01.png", new MoRectangle(64, 0, 64, 64), true);
	image.setX(275);
	image.setWidth(256);
	
	content.add(image);
}

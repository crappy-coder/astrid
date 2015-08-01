var g_app = MoApplication.create();
g_app.setEnableStatsGraph(true);
g_app.addEventHandler(MoEvent.APPLICATION_START, onApplicationStart.asDelegate(this));

var image = null;
var normalMapEffect = null;

function onApplicationStart(e) {
	var surface = g_app.getDisplaySurfaceAt(0);
	var content = new MoCanvas("mainContent");
	
	content.setPercentWidth(100);
	content.setPercentHeight(100);
	content.setBackground(MoSolidColorBrush.fromColorHex("#333333"));
	
	surface.setChild(content);
	
	image = MoImage.create("shade", "resources/corn_shade.jpg");
	content.addEventHandler(MoMouseEvent.MOUSE_MOVE, this.onMouseMove.asDelegate(this));
	image.setX(100);
	image.setY(100);
	
	var normalBrush = MoImageBrush.fromUrl("resources/corn_normalmap.jpg");
	normalMapEffect = new MoNormalMapEffect(normalBrush);
	image.setRenderEffects([normalMapEffect]);
	content.add(image);
}

function onMouseMove(e) {
	var target = e.getTarget();
	var fx = normalMapEffect;
	
	fx.setLightPosition(new MoVector3D(e.x - (image.getX() + (image.getWidth() / 2)), (image.getY() + (image.getHeight() / 2)) - e.y, 100));
}
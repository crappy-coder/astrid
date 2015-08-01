var g_app = MoApplication.create();
g_app.setEnableStatsGraph(true);
g_app.setEnableDebugVisuals(false);
g_app.addEventHandler(MoEvent.APPLICATION_START, handleApplicationStart.asDelegate(this));

var g_container = null;
var g_nameLabel = null;

function handleApplicationStart(e) {
	var surface = g_app.getDisplaySurfaceAt(0);
	var content = new MoCanvas("mainContent");
	content.setPercentWidth(100);
	content.setPercentHeight(100);
	content.setBackground(MoSolidColorBrush.fromColorHex("#333333"));

	surface.setChild(content);
	surface.focus();
	
	g_container = new MoStackPanel("container");
	g_container.setX(100);
	g_container.setY(50);
	g_nameLabel = new MoLabel("name");
	g_nameLabel.setFontName("Arial");
	g_nameLabel.setFontSize(22);
	g_nameLabel.setForeground(MoSolidColorBrush.white());
	g_nameLabel.setText("No Controller Detected...");
	g_container.add(g_nameLabel);
	
	content.add(g_container);
	
	MoGamepad.getInstance().addEventHandler(MoGamepadEvent.CONNECTED, onGamepadConnected.d(this));
}

function onGamepadConnected(e) {
	g_nameLabel.setText(MoGamepad.getState(e.getIndex()).getName());
}
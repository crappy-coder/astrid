var g_app = MoApplication.create();
var g_mx = 0;
var g_my = 0;

g_app.setEnableStatsGraph(true);
g_app.setEnableDebugVisuals(false);
g_app.addEventHandler(MoEvent.APPLICATION_START, handleApplicationStart.asDelegate(this));

function handleApplicationStart(e) {
	var surface = g_app.getDisplaySurfaceAt(0);
	var content = new MoCanvas("mainContent");
	
	content.setPercentWidth(100);
	content.setPercentHeight(100);
	content.setBackground(MoSolidColorBrush.fromColorHex("#333333"));

	surface.setChild(content);	
	surface.focus();
	
	// border
	var border = new MoBorder("b1");
	var borderContent = new MoCanvas("c1");
	
	borderContent.setWidth(100);
	borderContent.setHeight(100);
	borderContent.setBackground(MoSolidColorBrush.red());
	
	border.setX(100);
	border.setY(100);
	border.setWidth(500);
	border.setHeight(200);
	border.setCornerRadius(MoCornerRadius.fromUniform(10));
	border.setBorderBrush(MoSolidColorBrush.white());
	border.setChild(borderContent);
	
	content.add(border);
}

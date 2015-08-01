var g_app = MoApplication.create();
var g_sprites = [];

g_app.setEnableStatsGraph(true);
g_app.addEventHandler(MoEvent.APPLICATION_START, handleApplicationStart.asDelegate(this));

function handleApplicationStart(e) {
	var surface = g_app.getDisplaySurfaceAt(0);

	var content = new MoCanvas("mainContent");
	content.setPercentWidth(100);
	content.setPercentHeight(100);
	content.setBackground(MoSolidColorBrush.fromColorHex("#333333"));
	
	surface.setChild(content);
	loadSprites();
	
	g_app.addEventHandler(MoKeyEvent.KEY_UP, onKeyDown.d(this));
}

function onKeyDown(e) {
	var idx = 0;
	
	for(var i = 0, len = g_sprites.length; i < len; ++i)
	{
		g_sprites[i].setVisible(false);
		g_sprites[i].stop();
	}
	
	switch(e.getKey())
	{
		case MoKey.D1:
			idx = 0;
			break;
		case MoKey.D2:
			idx = 1;
			break;
		case MoKey.D3:
			idx = 2;
			break;
		case MoKey.D4:
			idx = 3;
			break;
		case MoKey.D5:
			idx = 4;
			break;
		case MoKey.D6:
			idx = 5;
			break;
	}
	
	g_sprites[idx].setVisible(true);
	g_sprites[idx].play();
}

function loadSprites() {
	var textures = [
		"resources/animations/zombie_body_1_17_attack_bite_01.xml",
		"resources/animations/zombie_body_1_17_attack_claw_v1.xml",
		"resources/animations/zombie_body_1_17_fall_back_v4.xml",
		"resources/animations/zombie_body_1_17_get_back_up_02.xml",
		"resources/animations/zombie_body_1_17_take_hit_v1.xml",
		"resources/animations/zombie_body_1_17_walk_v1_02.xml"];
	var n = 0;
	
	g_sprites.length = textures.length;
	
	for(var i = 0; i < textures.length; ++i)
	{
		var atlas = new MoTextureAtlas();
		
 		atlas.addEventHandler(MoLoadEvent.SUCCESS, function(e) {
			var a = e.getTarget();
			g_sprites[textures.indexOf(a.getUrl())] = a.getSprite("s" + i.toString(), a.animations[0].name);
			
			if(++n == textures.length)
				showSprites();
		}); 
		atlas.load(textures[i]);
		
	}
}

function showSprites() {
	var surface = g_app.getDisplaySurfaceAt(0);
	var content = surface.getChild();

	for(var i = 0; i < g_sprites.length; ++i)
	{
		if(i > 0)
			g_sprites[i].setVisible(false);
		
		content.add(g_sprites[i]);
	}
		
	g_sprites[0].play();
}
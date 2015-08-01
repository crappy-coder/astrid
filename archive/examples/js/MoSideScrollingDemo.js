var g_app = MoApplication.create();
var g_cam = null;
var g_character = null;
var g_dir = MoDirection.None;
var g_joystick = null;
var g_isFirstTimePlay = true;

g_app.setEnableStatsGraph(true);
g_app.setEnableDebugVisuals(false);
g_app.addEventHandler(MoEvent.APPLICATION_START, handleApplicationStart.asDelegate(this));

function handleApplicationStart(e) {
	var surface = g_app.getDisplaySurfaceAt(0);
	var content = new MoCanvas("mainContent");
	var playerAtlas = new MoTextureAtlas();
	
	surface.addEventHandler(MoKeyEvent.KEY_DOWN, this.handleKeyDown.asDelegate(this));
	surface.addEventHandler(MoKeyEvent.KEY_UP, this.handleKeyUp.asDelegate(this));
	
	content.setPercentWidth(100);
	content.setPercentHeight(100);
	content.setBackground(MoSolidColorBrush.fromColorHex("#333333"));

	surface.setChild(content);	
	surface.enablePhysics(true, 0.01, new MoVector2D(0, 5), false, true);
	surface.togglePhysicsDebugDraw("contacts", true);
	surface.focus();

	// create the world ground
 	ground = surface.getGroundEntity();
	ground.createBorderAt("ground-border", 0, 0, 2400, 480, 10);
	
	// camera view
	var view = new MoCanvas("view");
	view.setWidth(2400);
	view.setHeight(480);
	view.setClip(new MoRectangle(0, 0, 800, 480));
	view.setBackground(MoSolidColorBrush.fromColorHex("#FF0000"));
	
	// add the view to our content
	content.add(view);

	// create the main character
	g_character = surface.createDynamicEntity("character", {position: new PXVector2D(100, 300)});
	g_character.setEnableRotation(false);
	g_character.createBoxAt("character-shape", 0, 0, 64, 64, 4.0, 2.5, 0.1);
	
	// setup parallax camera
	g_cam = new MoParallaxCamera2D(view, 0, 0, 800, 480, 1);
	g_cam.setLimits(0, 0, 2020, 480);
	g_app.addCamera(g_cam);
	
	// background
	var layer = new MoParallaxCanvasLayer("a");
	
	var img = MoImage.create("a1", "resources/bg/Layer0_0.png");
	layer.add(img);
	
	img = MoImage.create("a2", "resources/bg/Layer0_1.png");
	img.setX(800);
	layer.add(img);
	
	img = MoImage.create("a3", "resources/bg/Layer0_2.png");
	img.setX(800*2);
	layer.add(img);
	
	g_cam.add(layer, new MoVector2D(1, 0));
	
	// middle
	layer = new MoParallaxCanvasLayer("b");
	
	img = MoImage.create("b1", "resources/bg/Layer1_0.png");
	layer.add(img);
	
	img = MoImage.create("b2", "resources/bg/Layer1_1.png");
	img.setX(800);
	layer.add(img);
	
	img = MoImage.create("b3", "resources/bg/Layer1_2.png");
	img.setX(800*2);
	layer.add(img);
	
	g_cam.add(layer, new MoVector2D(3, 0));
	
	// foreground
	layer = new MoParallaxCanvasLayer("c");
	
	img = MoImage.create("c1", "resources/bg/Layer2_0.png");
	layer.add(img);
	
	img = MoImage.create("c2", "resources/bg/Layer2_1.png");
	img.setX(850);
	layer.add(img);
	
	img = MoImage.create("c3", "resources/bg/Layer2_2.png");
	img.setX(900*2);
	layer.add(img);
	
	g_cam.add(layer, new MoVector2D(5, 0));
	
	// setup virtual joystick
	var joystickContainer = new MoCanvas("joystickContainer");
	joystickContainer.setX(0);
	joystickContainer.setY(480);
	joystickContainer.setWidth(800);
	joystickContainer.setHeight(200);
	joystickContainer.setBackground(MoSolidColorBrush.black());
	
	g_joystick = new MoJoystick("joystick", 50, 30);
	g_joystick.addEventHandler(MoEvent.CHANGE, this.handleJoystickChange.asDelegate(this));
	
	joystickContainer.add(g_joystick);
	
	content.add(joystickContainer);
	
	
	// load the character sprite so it's on top of everything
	playerAtlas.addEventHandler(MoLoadEvent.SUCCESS, function(e) {
		var sprite = playerAtlas.getSprite("characterSprite", "run");
		sprite.setTransformOrigin(new MoVector2D(32, 32));		
		
		// link our character and sprite
		g_character.link(sprite);
		
		// lock to camera
		g_cam.lock(sprite);
		
		// add sprite to view
		view.add(sprite);
		
	});
	
	playerAtlas.load("resources/player01.xml");
}

function handleJoystickChange(e) {
	var a = g_character.getDrawable().getAnimationInstance();

	if(!g_joystick.isZero() && !a.getIsRunning())
	{
		if(g_isFirstTimePlay)
		{
			
			g_character.getDrawable().play();
			g_isFirstTimePlay = false;
		}
		else
			g_character.getDrawable().resume();
	}
	
	if(g_joystick.isZero())
	{
		g_character.stop();
		g_character.getDrawable().pause();
		a.setCurrentTime(0);
	}
	else
	{
		g_character.move(g_joystick.getValue().x, 0);
		
		if(g_joystick.isPointingLeft())
			g_character.getDrawable().setScaleX(-1);
		else
			g_character.getDrawable().setScaleX(1);
	}

}

function handleKeyUp(e) {
	switch(e.getKey())
	{
		case MoKey.Up:
			g_dir = (g_dir & ~MoDirection.North);
			break;
		case MoKey.Down:
			g_dir = (g_dir & ~MoDirection.South);
			break;
		case MoKey.Left:
			g_dir = (g_dir & ~MoDirection.West);
			break;
		case MoKey.Right:
			g_dir = (g_dir & ~MoDirection.East);
			break;
	}
	
	g_character.move(g_dir);
}

function handleKeyDown(e) {	
	switch(e.getKey())
	{
		case MoKey.Up:
			g_dir = (g_dir | MoDirection.North);
			break;
		case MoKey.Down:
			g_dir = (g_dir | MoDirection.South);
			break;
		case MoKey.Left:
			g_dir = (g_dir | MoDirection.West);
			break;
		case MoKey.Right:
			g_dir = (g_dir | MoDirection.East);
			break;
		case MoKey.Space:
			g_character.jump();
			break;
	}
	
	g_character.move(g_dir);
}
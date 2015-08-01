var g_app = MoApplication.create();
var g_cam = null;
var g_shape = null;
var g_character = null;
var g_dir = MoDirection.None;
var g_maxVelocity = 2.0;
var g_stillTime = 0;
var g_joystick = null;

g_app.setEnableStatsGraph(true);
g_app.setEnableDebugVisuals(false);
g_app.addEventHandler(MoEvent.APPLICATION_START, onApplicationStart.asDelegate(this));

function onApplicationStart(e) {
	var surface = g_app.getDisplaySurfaceAt(0);
	var content = new MoCanvas("mainContent");
	
	surface.addEventHandler(MoKeyEvent.KEY_DOWN, this.handleKeyDown.asDelegate(this));
	surface.addEventHandler(MoKeyEvent.KEY_UP, this.handleKeyUp.asDelegate(this));
	
	content.setPercentWidth(100);
	content.setPercentHeight(100);
	content.setBackground(MoSolidColorBrush.fromColorHex("#333333"));

	surface.setChild(content);	
	surface.enablePhysics(true, 0.01, new MoVector2D(0, 5), true, true);
	surface.togglePhysicsDebugDraw("contacts", true);
	surface.focus();

	// create the world ground
 	ground = surface.getGroundEntity();
	ground.createBorderAt("ground-border", 0, 0, 1600, 600, 10);
	
	// camera view
	var view = new MoCanvas("view");
	view.setWidth(1600);
	view.setHeight(600);
	view.setBackground(MoSolidColorBrush.fromColorHex("#FF0000"));
	view.setClip(new MoRectangle(0, 0, 800, 600));
	
	// view shape
	var shape = new MoShapeRectangle("rect1");
	shape.setX(350);
	shape.setY(250);
	shape.setWidth(100);
	shape.setHeight(100);
	shape.setFill(new MoLinearGradientBrush.fromColorsWithAngle(MoColor.fromHex("#FFFFFF"), MoColor.fromHex("#a6ce39"), 45));
	shape.setStrokeThickness(2);
	shape.setStroke(new MoSolidColorBrush(MoColor.fromHex("#ff0000")));
	
	view.add(shape);
	
	// block 1
	var block = new MoShapeRectangle("rect1");
	block.setY(600-25);
	block.setWidth(25);
	block.setHeight(25);
	block.setFill(new MoLinearGradientBrush.fromColorsWithAngle(MoColor.fromHex("#FFFFFF"), MoColor.fromHex("#a6ce39"), 45));
	block.setStrokeThickness(2);
	block.setStroke(new MoSolidColorBrush(MoColor.fromHex("#ff0000")));
	
	view.add(block);
	
	var blockEntity = surface.createDynamicEntity("block", {position: new PXVector2D(100,100)});
	var blockLink = blockEntity.createBox("block-shape", 25, 25, 1.0, 0.5, 0.1);
	blockEntity.link(block);
	
	// add the view to our content
	content.add(view);
	
	// add the 'character' shape
	shape = new MoShapeRectangle("rect2");
	shape.setWidth(100);
	shape.setHeight(100);
	shape.setFill(new MoLinearGradientBrush.fromColorsWithAngle(MoColor.fromHex("#FFFFFF"), MoColor.fromHex("#a6ce39"), 45));
	shape.setStrokeThickness(2);
	shape.setStroke(new MoSolidColorBrush(MoColor.fromHex("#a6ce39")));
	
	view.add(shape);

	g_character = surface.createDynamicEntity("character", {position: new PXVector2D(100, 500)});
	g_character.setEnableRotation(false);
	var characterLink = g_character.createBoxAt("character-shape", 5, 5, 100, 100, 4.0, 2.5, 0.1);
	g_character.link(shape);

	// setup camera
	g_shape = shape;
	g_cam = new MoCamera2D(view, 0, 0, 800, 600, 1);
	g_cam.setLimits(0, 0, 1600, 600);
	g_cam.lock(g_shape);
	
	g_app.addCamera(g_cam);
	
	var joystickContainer = new MoCanvas("joystickContainer");
	joystickContainer.setWidth(200);
	joystickContainer.setHeight(400);
	joystickContainer.setBackground(MoSolidColorBrush.black());
	
	g_joystick = new MoJoystick("joystick", 50, 30);
	g_joystick.addEventHandler(MoEvent.CHANGE, this.handleJoystickChange.asDelegate(this));
	g_joystick.setX(100);
	g_joystick.setY(100);
	
	joystickContainer.add(g_joystick);
	
	content.add(joystickContainer);
}

function handleJoystickChange(e) {
	g_character.setAngle(g_joystick.getAngleValue());
	g_character.move(g_joystick.getValue().x, g_joystick.getValue().y);
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
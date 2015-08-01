var g_app = MoApplication.create();
var g_mx = 0;
var g_my = 0;
var g_animations = [];
var g_a = null;
var g_angle = 0;

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
	
	var container = new MoIKContainer("ikk");
	var c1 = new MoShapeRectangle("c1");
	c1.setWidth(50);
	c1.setHeight(50);
	c1.setFill(MoSolidColorBrush.blue());
	
	var c2 = new MoShapeRectangle("c2");
	c2.setWidth(50);
	c2.setHeight(50);
	c2.setFill(MoSolidColorBrush.blue());
	
	var c3 = new MoShapeRectangle("c3");
	c3.setWidth(50);
	c3.setHeight(50);
	c3.setFill(MoSolidColorBrush.blue());
	
	container.setWidth(500);
	container.setHeight(500);
	container.addBone(50, 45, c1);
	container.addBone(50, 0, c2);
	container.addBone(50, 45, c3);
	container.setX(800);
	container.setY(100);

	content.add(container);
	
/* 	var a = new MoBasicAnimation(container.getBone("c2"), "angle", 0, 360);
	a.setRepeatCount(0);
	a.setDuration(2000);
	a.setEasingFunction(new MoElasticEase(MoEasingMode.In));
	a.play();
	
	a = new MoBasicAnimation(container, "x", container.getX(), container.getX() + 300);
	a.setRepeatCount(0);
	a.setRepeatBehavior(MoRepeatBehavior.Reverse);
	a.setDuration(2000);
	a.setEasingFunction(new MoElasticEase(MoEasingMode.In));
	a.play(); */
	
	var r1 = new MoShapeRectangle("r1");
	r1.setWidth(50);
	r1.setHeight(50);
	r1.setFill(MoSolidColorBrush.green());
	content.add(r1);
	
	var r2 = new MoShapeRectangle("r2");
	r2.setWidth(100);
	r2.setHeight(50);
	r2.setFill(MoSolidColorBrush.green());
	content.add(r2);
	
	var r3 = new MoShapeRectangle("r3");
	r3.setWidth(150);
	r3.setHeight(50);
	r3.setFill(MoSolidColorBrush.green());
	content.add(r3);
	
	var r4 = new MoShapeRectangle("r4");
	r4.setWidth(50);
	r4.setHeight(50);
	r4.setFill(MoSolidColorBrush.green());
	content.add(r4);
	
	var r5 = new MoShapeRectangle("r5");
	r5.setWidth(100);
	r5.setHeight(50);
	r5.setFill(MoSolidColorBrush.green());
	content.add(r5);
	
	var r6 = new MoShapeRectangle("r6");
	r6.setWidth(150);
	r6.setHeight(50);
	r6.setFill(MoSolidColorBrush.green());
	content.add(r6);
	
	var ik1 = surface.createArmature("ik", 300, 300);
	var ik2 = surface.createArmature("ik", 800, 300);
	var visual = new MoIKDraw(ik2);
	
	ik1.add(new MoIKBone("1", 50, 45, r1));
	ik1.add(new MoIKBone("2", 100, -45, r2));
	ik1.add(new MoIKBone("3", 150, 45, r3));
	
	ik2.add(new MoIKBone("1", 50, 45, r4));
	ik2.add(new MoIKBone("2", 100, -45, r5));
	ik2.add(new MoIKBone("3", 150, 45, r6));
	
	ik1.getAt(0).setDrawablePosition(new MoVector2D(0, 25));
	ik1.getAt(1).setDrawablePosition(new MoVector2D(0, 25));
	ik1.getAt(2).setDrawablePosition(new MoVector2D(0, 25));
	
	ik2.getAt(0).setDrawablePosition(new MoVector2D(0, 25));
	ik2.getAt(1).setDrawablePosition(new MoVector2D(0, 25));
	ik2.getAt(2).setDrawablePosition(new MoVector2D(0, 25));
	
	visual.setX(800);
	visual.setY(300);
	visual.setPercentWidth(100);
	visual.setPercentHeight(100);
	
	content.add(visual);
	
	var a1 = new MoBasicAnimation(ik1.getAt(1), "angle", 0, 360);
	a1.setRepeatCount(0);
	a1.setDuration(2000);
	a1.setEasingFunction(new MoElasticEase(MoEasingMode.In));
	a1.play();
	
	surface.addEventHandler(MoMouseEvent.MOUSE_MOVE, function(e) {
		var viewportCenter = content.getCenter();
		
		g_mx = e.getX() - 800;
		g_my = e.getY() - 300;
		
		ik2.moveTo(g_mx, g_my);
		
		/** movement is: **/
		//
		//      -Y
		//       |
		//       |
		// -X ------- +X
		//       |
		//       |
		//      +Y
	});
	
	surface.addEventHandler(MoKeyEvent.KEY_DOWN, function(e) {
		switch(e.getKey())
		{
			case MoKey.A:
				
				if(g_angle == 100)
				{
					g_angle = 0;
					g_a.pause();
				}
				else
				{
					g_angle = 100;
				}

				var a = new MoAnimation(container.getBone("c2"));
				var path = new MoAnimationPath("angle");

				path.addKeyframe(new MoKeyframe(0, null));
				path.addKeyframe(new MoKeyframe(1000, g_angle));
				
				a.addAnimationPath(path);
				a.play();
				g_a = a;
				break;
		}
	});
	

	//g_animations.push(a);
}

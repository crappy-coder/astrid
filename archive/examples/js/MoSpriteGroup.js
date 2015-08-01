var g_app = MoApplication.create();
g_app.setEnableStatsGraph(true);
g_app.addEventHandler(MoEvent.APPLICATION_START, handleApplicationStart.asDelegate(this));

function handleApplicationStart(e) {
	var surface = g_app.getDisplaySurfaceAt(0);

	var content = new MoCanvas("mainContent");
	content.setPercentWidth(100);
	content.setPercentHeight(100);
	content.setBackground(MoSolidColorBrush.fromColorHex("#333333"));
	
	surface.setChild(content);
	surface.enablePhysics(true, 0.01, new MoVector2D(0, 5), true, true);
	
	// create the physics ground
 	var ground = surface.getGroundEntity();
	ground.createBorderAt("ground-border", 0, 0, 800, 600, 2);
	
	var entityA = surface.createDynamicEntity("a", {position: new MoVector2D(100, 100)});
	entityA.createBox("a", 32, 32, 1.0, 0.5, 0.1);
	
	var entityB = surface.createDynamicEntity("b", {position: new MoVector2D(100, 140)});
	entityB.createBox("b", 32, 32, 1.0, 0.5, 0.1);	
	
 		entityA.join(MoEntityJoinType.Prismatic, entityB, {
			localAxis: new PXVector2D(0, 1),
			motorSpeed : 2,
			maxMotorForce : -2.9
		});
		
 		var joint = entityA.join(MoEntityJoinType.Distance, entityB, {
			dampingRatio: 0.3,
			frequencyHz: 10,
			length: 0.5
		});
	
	var atlas = new MoTextureAtlas();
	
	atlas.addEventHandler(MoLoadEvent.SUCCESS, function(evt) {
		var group = atlas.getSpriteGroup("myGroup01", "groupA");
		var itemA = group.getSprite("a");
		var itemB = group.getSprite("b");
		
		// link entities
		//entityA.link(itemA);
		//entityB.link(itemB);
		

		
		// play walk animations
		group.play("walk");
		
		// add group to main content
		content.add(group);
	});

	atlas.load("resources/atlas01.xml");
}
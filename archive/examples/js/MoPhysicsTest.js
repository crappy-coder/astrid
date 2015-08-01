var g_app = MoApplication.create();
g_app.setEnableStatsGraph(true);
g_app.addEventHandler(MoEvent.APPLICATION_START, handleApplicationStart.asDelegate(this));

function handleApplicationStart(e) {
	var surface = g_app.getDisplaySurfaceAt(0);
	var content = new MoCanvas("mainContent");
	var ground = null;
	
	g_app.setEnableDebugVisuals(false);
	
	content.setPercentWidth(100);
	content.setPercentHeight(100);
	content.setBackground(MoSolidColorBrush.fromColorHex("#333333"));
	
	surface.setChild(content);
	surface.enablePhysics(true, 0.01, new MoVector2D(0, 10), false, true);
	
	// create the world ground
 	ground = surface.getGroundEntity();
	var groundParts = ground.createBorderAt(0, 0, 800, 600, 10);
	
	var right = groundParts[3];
	var bottom = groundParts[2];
	var bottomShape = new MoShapeRectangle("bottom");
	var rightShape = new MoShapeRectangle("right");
	
	bottomShape.setWidth(800);
	bottomShape.setHeight(10);
	bottomShape.setFill(new MoSolidColorBrush.fromColorHex("#222222"));
	
	rightShape.setWidth(10);
	rightShape.setHeight(600);
	rightShape.setFill(new MoSolidColorBrush.fromColorHex("#222222"));
	
	content.add(bottomShape);
	content.add(rightShape);
	
	bottom.link(bottomShape);
	right.link(rightShape);
	
	var shape = new MoShapeRectangle("rect");
	shape.setWidth(100);
	shape.setHeight(100);
	shape.setFill(new MoLinearGradientBrush.fromColorsWithAngle(MoColor.fromHex("#FFFFFF"), MoColor.fromHex("#a6ce39"), 45));
	shape.setStrokeThickness(2);
	shape.setStroke(new MoSolidColorBrush(MoColor.fromHex("#a6ce39")));
	
	var shapeEntity = surface.createDynamicEntity({position: new PXVector2D(1, 1)});
	shapeEntity.createBox(100, 100, 1.0, 0.5, 0.1);
	shapeEntity.link(shape);
	
	content.add(shape);
	
	
		// gear
/* 		var j1 = ground.join(MoEntityJoinType.Revolute, entityA, {
			anchor: entityA.body.GetWorldCenter(),
			lowerAngle: -0.5 * Math.PI,
			upperAngle: 0.25 * Math.PI,
			maxMotorTorque:  10,
			motorSpeed: 0
		});
		
		var j2 = ground.join(MoEntityJoinType.Prismatic, entityB, {
			anchor: entityB.body.GetWorldCenter(),
			lowerTranslation: -5.0,
			upperTranslation: 2.5,
			maxMotorForce: 1.0,
			motorSpeed: 0
		});
		
		var j = entityA.join(MoEntityJoinType.Gear, entityB, j1, j2, {
			ratio: Math.PI / 8
		}); */
		
		
		// distance
		//var j = entityA.join(MoEntityJoinType.Distance, entityB);

		// revolute
		//var j = entityA.join(MoEntityJoinType.Revolute);

		// friction
		//var j = entityA.join(MoEntityJoinType.Friction);

		// line
		/*
		var j = entityA.join(MoEntityJoinType.Line, {
			motorSpeed : 10,
			maxMotorForce : 5,
			upperTranslation : 1
		});
		*/
		
		// prismatic
/* 		var j = entityA.join(MoEntityJoinType.Prismatic, {
			motorSpeed : -10,
			maxMotorForce : 5
		}); */
		
		// pulley		
/* 		var j = entityA.join(MoEntityJoinType.Pulley, entityB, {
			groundAnchorA : new PXVector2D(1, 2),
			groundAnchorB : new PXVector2D(2, 4),
			ratio : 2,
			maxLengthA : 5,
			maxLengthB : 5
		}); */
		
		// weld
/* 		var j = entityA.join(MoEntityJoinType.Weld, entityB, {
			referenceAngle : MoMath.degreesToRadians(45)
		}); */
}
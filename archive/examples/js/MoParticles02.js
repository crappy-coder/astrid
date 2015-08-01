var g_app = MoApplication.create();

g_app.setEnableDebugVisuals(false);
g_app.setEnableStatsGraph(true);
g_app.addEventHandler(MoEvent.APPLICATION_START, handleApplicationStart.asDelegate(this));

function handleApplicationStart(e) {
	var surface = g_app.getDisplaySurfaceAt(0);
	var content = new MoCanvas("mainContent");
	
	content.setPercentWidth(100);
	content.setPercentHeight(100);
	content.setBackground(MoSolidColorBrush.fromColorHex("#333333"));
	
	surface.setChild(content);
	surface.enablePhysics(true, 0.01, new MoVector2D(0, 10), false, true);
	
	// create the world ground
 	ground = surface.getGroundEntity();
	ground.createBorderAt("ground-border", 0, 0, 800, 600, 10);
	
	var particles = createMeteor();
	particles.setWidth(1);
	particles.setHeight(1);
	particles.setX(200);
	particles.setY(40);
	
	content.add(particles);
	
	var entity = surface.createDynamicEntity("particles", {position: new PXVector2D(200, 1)});
	entity.createBoxAt("particle-box", 10, 10, 100, 100, 1.0, 0.5, 0.1);
	entity.link(particles);
}

function createMeteor() {
	var particle = new MoParticleEngine("meteor", 150);
	particle.duration = -1;
	particle.gravity.x = -200;
	particle.gravity.y = -200;
	particle.angle.x = 90;
	particle.angle.y = 360;
	particle.particleLife.x = 2;
	particle.particleLife.y = 1;
	particle.speed.x = 15;
	particle.speed.y = 5;
	particle.emissionSpeed = 0.025;
	particle.startSize.x = 60.0;
	particle.startSize.y = 10.0;
	particle.endSize.x = -1;
	particle.emissionRate = 150 / particle.particleLife.x;
	particle.startColor.r = 1;			// start color red component, float values only
	particle.startColor.g = 0;			// start color green component, float values only
	particle.startColor.b = 0;			// start color blue component, float values only
	particle.startColor.a = 1;			// start color alpha component, float values only
	particle.startColorVariance.r = 1;	// start color red component variance, float values only
	particle.startColorVariance.g = 0;	// start color green component variance, float values only
	particle.startColorVariance.b = 0;	// start color blue component variance, float values only
	particle.startColorVariance.a = 0;	// start color alpha component variance, float values only
	particle.endColor.r = 1;			// end color red component, float values only
	particle.endColor.g = 0;			// end color green component, float values only
	particle.endColor.b = 0;			// end color blue component, float values only
	particle.endColor.a = 0;		// end color alpha component, float values only
	particle.endColorVariance.r = 0;	// end color red component variance, float values only
	particle.endColorVariance.g = 0;	// end color green component variance, float values only
	particle.endColorVariance.b = 0;	// end color blue component variance, float values only
	particle.endColorVariance.a = 0;	// end color alpha component variance, float values only
	particle.additiveBlending = true;
	particle.setImageBrush(MoImageBrush.fromUrl("resources/particle_blue.png"));

	particle.setIsHitTestVisible(false);
	
	return particle;
}
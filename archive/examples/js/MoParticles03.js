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
	
	var particles = createParticles();
	particles.setWidth(1);
	particles.setHeight(1);
	particles.setX(200);
	particles.setY(500);
	
	content.add(particles);
}

function createParticles() {
	var particle = new MoParticleEngine("particles", 100);
	particle.duration = -1; 			// the duration in seconds, use -1 for infinite
	particle.gravity.x = -10;			// gravity in the x direction, negative values allowed
	particle.gravity.y = -10;			// gravity in the y direction, negative values allowed
	particle.angle.x = -90; 				// the direction of movement, in degrees
	particle.angle.y = -10; 				// the angle variance, in degrees
	particle.positionVariance.x = 20;	// position variance in the x direction
	particle.positionVariance.y = 2;	// position variance in the y direction
	particle.particleLife.x = 3;		// life of the particle
	particle.particleLife.y = 0;		// particle life variance
	particle.speed.x = 30;				// particle speed
	particle.speed.y = 2;				// particle speed variance
	particle.startSize.x = 30;		// particle starting size
	particle.startSize.y = 2;			// particle starting size variance
	particle.endSize.x = -1;			// particle ending size
	particle.endSize.y = 0;			// particle ending size variance
	particle.emissionRate = 100/3;		// the rate of emission
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
	particle.setImageBrush(MoImageBrush.fromUrl("resources/particle.png"));

	particle.setIsHitTestVisible(false);
	
	return particle;
}
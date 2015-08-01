var g_app = MoApplication.create(960, 640);
var g_surface = null;
var g_player = null;
var g_zombie = null;
var g_dir = 0;

g_app.setEnableStatsGraph(true);
g_app.addEventHandler(MoEvent.APPLICATION_START, handleApplicationStart.asDelegate(this));

function handleApplicationStart(e) {
	g_surface = g_app.getDisplaySurfaceAt(0);

	var content = new MoCanvas("mainContent");
	content.setPercentWidth(100);
	content.setPercentHeight(100);
	content.setBackground(MoSolidColorBrush.fromColorHex("#333333"));

	g_surface.addEventHandler(MoKeyEvent.KEY_DOWN, this.handleKeyDown.asDelegate(this));
	g_surface.addEventHandler(MoKeyEvent.KEY_UP, this.handleKeyUp.asDelegate(this));
	
	g_surface.setChild(content);
	g_surface.enablePhysics(true, 0.01, new MoVector2D(0, 5), true, true);
	g_surface.togglePhysicsDebugDraw("contacts", true);
	g_surface.focus();
	
	// create the physics ground
 	var ground = g_surface.getGroundEntity().createBorderAt("ground-border", 0, 0, 960, 640, 2);

	g_player = MoGameObject.create(g_surface, "player", content, HeroCharacter);

	// create the player
	//g_player = g_surface.createDynamicEntity("player", {position: new PXVector2D(100, 100)}, HeroCharacter, [content]);
	
	// create the zombie
	//g_zombie = g_surface.createDynamicEntity("zombie", {position: new PXVector2D(420, 120)}, ZombieCharacter, [content]);
}

function handleKeyUp(e) {
	switch(e.getKey())
	{
		case MoKey.Left:
		case MoKey.Right:
			g_player.stop();
			break;
		case MoKey.Space:
			g_player.shoot();
			break;
	}
}

function handleKeyDown(e) {	
	switch(e.getKey())
	{
		case MoKey.Left:
			g_player.moveLeft(1.5);
			break;
		case MoKey.Right:
			g_player.moveRight(1.5);
			break;
	}
}

HeroCharacter = Class.create(MoGameObject, {
	setup : function() {
		this.isReady = false;
		this.isPointingLeft = false;
		
		this.entity = this.surface.createDynamicEntity(name, {position: new PXVector2D(100, 100)});
		this.entity.createBoxAt(name + "-shape", 0, 0, 100, 220, 15.0, 2.0, 0.1);
		this.entity.setEnableRotation(false);
		
		this.atlas = new MoTextureAtlas();
		this.atlas.addEventHandler(MoLoadEvent.SUCCESS, this.handleAtlasLoad.asDelegate(this));
		this.atlas.load("resources/assets/hero_01_atlas.xml");

		this.currentMoveAmount = 0;
		this.idleState = new HeroIdleState();
		this.walkState = new HeroWalkState();
		this.shootState = new HeroShootState();
	},
	
	getIsMoving : function() {
		return (this.currentMoveAmount != 0);
	},
	
	getIsPointingLeft : function() {
		return this.isPointingLeft;
	},

	handleAtlasLoad : function(e) {
		this.sprite = this.atlas.getSprite(this.getName() + "-sprite", "walk");
		this.container.add(this.sprite);
		
		this.entity.link(this.sprite);
		this.isReady = true;
		this.sprite.play();
		this.halt();
	},

	moveLeft : function(amount) {
		this.sprite.setTransformOrigin(this.sprite.getCenter());
		this.sprite.setScaleX(-1);
		this.isPointingLeft = true;
		this.move(-amount);
	},

	moveRight : function(amount) {
		this.sprite.setTransformOrigin(this.sprite.getCenter());
		this.sprite.setScaleX(1);
		this.isPointingLeft = false;
		this.move(amount);
	},
	
	stop : function() {
		this.move(0);
	},

	move : function(amount) {
		this.currentMoveAmount = amount;
	},
	
	walk : function() {
		this.goToState(this.walkState);
	},

	halt : function() {
		this.goToState(this.idleState);
	},

	shoot : function() {
		this.goToState(this.shootState);
	},

	update : function($super, t) {
		$super(t);
		
		if(!this.isReady)
			return;
		
		if(this.getIsMoving())
		{
			if(this.getCurrentState() != this.walkState)
				this.goToState(this.walkState);
			else
				this.entity.moveNow(this.currentMoveAmount, 0);
		}
		else
		{
			if(this.getCurrentState() != this.idleState)
				this.goToState(this.idleState);			
		}
	}
});

HeroIdleState = Class.create(MoAIState, {
	initialize : function($super) {
		$super("idle");
	},

	enter : function($super, fromState) {
		$super(fromState);
		
		this.target.playAnimation("walk");
		this.target.stopAnimation();
	}
});

HeroWalkState = Class.create(MoAIState, {
	initialize : function($super) {
		$super("walk");
	},

	enter : function($super, fromState) {
		$super(fromState);

		this.target.playAnimation("walk");
	}
});

HeroShootState = Class.create(MoAIState, {
	initialize : function($super) {
		$super("shoot");
		
		this.projectile = null;
	},

	enter : function($super, fromState) {
		$super(fromState);

		var entity = this.target.getEntity();
		var pos = entity.getPosition();
		pos.x += (this.target.getIsPointingLeft() ? -60 : 60);
		
		this.projectile = this.target.getSurface().createDynamicEntity("projectile", {bullet:true, position:new PXVector2D(pos.x, pos.y), linearVelocity:new PXVector2D((this.target.getIsPointingLeft() ? -60 : 60), 0) });
		this.projectile.createEllipse("projectile-shape", 20, 20, 65.0, 0.5, 0.1);
		this.projectile.addEventHandler(MoCollisionEvent.START, this.handleCollisionEvent.asDelegate(this));
		
		this.target.playAnimation("shoot");
	},
	
	exit : function($super, toState) {
		if(this.target.getIsPlayingAnimation("shoot"))
			return false;

		return true;
	},

	update : function(t) {	
		if(!this.target.getIsPlayingAnimation("shoot"))
			this.target.walk();
	},
	
	handleCollisionEvent : function(e) {
		var target = e.getContactTarget().getEntity();
		
		if(target.getName() == "zombie")
		{		
			target.hit();
			target.applyImpulse(e.getContactNormal().x * 8, 0);
		}

		this.projectile.destroy();
	},
});

ZombieCharacter = Class.create(MoEntity, {
	initialize : function($super, params, type, name, descriptor, controller) {
		$super(type, name, descriptor, controller);

		this.createBoxAt(name + "-shape", 0, 0, 100, 200, 1.0, 0.5, 0.1);
		
		this.atlas = new MoTextureAtlas();
		this.atlas.addEventHandler(MoLoadEvent.SUCCESS, this.handleAtlasLoad.asDelegate(this));
		this.atlas.load("resources/assets/zombie_01_atlas.xml");
		this.spriteContainer = params[0];
		this.sprite = null;
		this.ai = g_surface.createAIEntity(ZombieCharacterAI, [this]);
		
		this.setEnableRotation(false);
	},

	handleAtlasLoad : function(e) {
		this.sprite = this.atlas.getSprite(this.getName() + "-sprite", "walk");
		this.sprite.addEventHandler(MoEvent.CHANGE, this.handleSpriteChange.asDelegate(this));
		this.spriteContainer.add(this.sprite);
		this.ai.chase();

		this.link(this.sprite);
	},
	
	handleSpriteChange : function(e) {
		
	},
	
	flipLeft : function() {
		this.sprite.setTransformOrigin(this.sprite.getCenter());
		this.sprite.setScaleX(-1);
	},
	
	flipRight : function() {
		this.sprite.setTransformOrigin(this.sprite.getCenter());
		this.sprite.setScaleX(1);	
	},

	idle : function() {
		this.ai.idle();
	},
	
	chase : function() {
		this.ai.chase();
	},
	
	hit : function() {
		this.ai.hit();
	},
	
	knockDown : function() {
		this.ai.knockDown();
	},
	
	bite : function() {
		this.sprite.play("bite");
	},
	
	slash : function() {
		this.ai.slash();
	}
});

ZombieCharacterAI = Class.create(MoAIEntity, {
	initialize : function($super, params) {
		$super(params);

		this.characterEntity = params[0];
		this.idleState = new ZombieIdleState(this.characterEntity);
		this.chaseState = new ZombieChaseState(this.characterEntity);
		this.hitState = new ZombieHitState(this.characterEntity);
		this.knockDownState = new ZombieKnockDownState(this.characterEntity);
		this.slashState = new ZombieSlashState(this.characterEntity);
	},
	
	hit : function() {
		this.goToState(this.hitState);
	},
	
	knockDown : function() {
		this.goToState(this.knockDownState);
	},

	idle : function() {
		this.goToState(this.idleState);
	},

	chase : function() {
		this.goToState(this.chaseState);
	},
	
	slash : function() {
		this.goToState(this.slashState);
	},
	
	update : function($super, t) {
		$super(t);
	}
});

ZombieState = Class.create(MoAIState, {
	initialize : function($super, name, entity) {
		$super(name);
		
		this.entity = entity;
	}
});

ZombieIdleState = Class.create(ZombieState, {
	initialize : function($super, entity) {
		$super("idle", entity);
	},
	
	enter : function($super, fromState) {
		$super(fromState);

		this.entity.sprite.play("walk");
		this.entity.sprite.stop();
	}
});

ZombieChaseState = Class.create(ZombieState, {
	initialize : function($super, entity) {
		$super("chase", entity);
	},
	
	enter : function($super, fromState) {
		$super(fromState);

		this.entity.sprite.play("walk");
	},

	update : function(t) {
		var p1 = this.entity.getPosition();
		var p2 = g_player.getPosition();
		var delta = p2.subtract(p1);

		if(delta.x < 0)
			this.entity.flipLeft();
		else
			this.entity.flipRight();
		
		if(Math.abs(delta.x) < 135)
			this.entity.slash();
		else
			this.entity.moveNow((Math.round(p2.x) > Math.round(p1.x) ? 1 : -1), 0);
	}
});

ZombieHitState = Class.create(ZombieState, {
	initialize : function($super, entity) {
		$super("hit", entity);
	},
	
	enter : function($super, fromState) {
		$super(fromState);

		this.entity.sprite.play("hit");
	},
	
	update : function($super, t) {
		$super(t);

		if(!this.entity.sprite.getIsRunning())
			this.entity.chase();
	}
});

ZombieSlashState = Class.create(ZombieState, {
	initialize : function($super, entity) {
		$super("slash", entity);
	},

	enter : function($super, fromState) {
		$super(fromState);

		this.entity.sprite.play("slash");
	},
	
	update : function($super, t) {
		$super(t);

		if(!this.entity.sprite.getIsRunning())
			this.entity.chase();
	}
});

ZombieKnockDownState = Class.create(ZombieState, {
	initialize : function($super, entity) {
		$super("knockDown", entity);
	},

	enter : function($super, fromState) {
		$super(fromState);

		this.entity.sprite.play("getup");
	},

	exit : function($super, toState) {	
		if(toState != null && toState.getName() != "chase")
			return false;

		return $super(toState);
	},

	update : function($super, t) {
		$super(t);
		
		if(!this.entity.sprite.getIsRunning())
			this.entity.chase();
	}
});
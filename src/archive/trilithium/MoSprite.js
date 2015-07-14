MoSprite = Class.create(MoCanvas, {
	initialize : function($super, name, animationName, textureAtlas) {
		$super(name);

		//this.sprite = new MoImage("image", textureAtlas.getTextureSource(), null, false);
		this.sprites = null;
		this.textureAtlas = textureAtlas;
		this.animation = null;
		this.animationSource = null;
		this.frameCount = 0;
		
		this.setAnimationName(animationName);
		//this.add(this.sprite);
	},

	initializeAnimatablePropertiesCore : function($super) {
		$super();

		this.enableAnimatableProperty("frame", this.getFrame, this.setFrame, MoPropertyOptions.AffectsLayout | MoPropertyOptions.AffectsMeasure);
	},
	
	getFrameCount : function() {
		return this.frameCount;
	},

	getFrame : function() {
		return this.getPropertyValue("frame");
	},

	setFrame : function(value, force) {
		force = MoValueOrDefault(force, false);
		
		if(this.setPropertyValue("frame", Math.round(value)) || force)
		{
			this.updateSpritesForFrame(this.getFrame()-1);
			// var spriteName = this.textureAtlas.getSpriteNameForFrame(this.animationName, this.getFrame()-1);
			// var spriteInfo = this.textureAtlas.getSpriteInfo(spriteName);

			// this.sprite.setX(spriteInfo.x);
			// this.sprite.setY(spriteInfo.y);
			// this.sprite.setSourceRect(spriteInfo.sourceRect);
		}
	},

	getAnimationInstance : function() {
		return this.animation;
	},
	
	getAnimationName : function() {
		return this.animationName;
	},
	
	setAnimationName : function(value) {
		if(MoIsNull(value))
			throw new Error("Sprite must have an animation.");

		if(this.animationName != value)
		{
			this.animationName = value;
			this.reset();
		}
	},
	
	getTextureAtlas : function() {
		return this.textureAtlas;
	},
	
	getRepeatCount : function() {
		return this.animation.getRepeatCount();
	},
	
	setRepeatCount : function(value) {
		this.animation.setRepeatCount(value);
	},
	
	getRepeatBehavior : function() {
		return this.animation.getRepeatBehavior();
	},
	
	setRepeatBehavior : function(value) {
		this.animation.setRepeatBehavior(value);
	},
	
	getDuration : function() {
		return this.animation.getDuration();
	},
	
	setDuration : function(value) {
		this.animation.setDuration(value);
	},
	
	getCurrentTime : function() {
		return this.animation.getCurrentTime();
	},
	
	getIsRunning : function() {
		return this.animation.getIsRunning();
	},

	play : function(name) {
		name = MoValueOrDefault(name, this.getAnimationName());

		if(name != this.getAnimationName())
		{
			//this.dispatchEvent(new MoEvent(MoEvent.CHANGE));
			//this.setAnimationName(name);
		}

		if(!this.animation.getIsRunning())
			this.animation.play();
	},
	
	pause : function() {
		this.animation.pause();
	},
	
	resume : function() {
		if(!this.animation.getIsRunning())
			this.animation.resume();
	},
	
	stop : function() {
		this.setFrame(1, true);
		this.animation.stop();
	},
	
	updateSpritesForFrame : function(frame) {

		this.sprites = this.animationSource.getSprites(frame);
	},

	reset : function() {
		if(this.animation != null)
			this.animation.stop();

		this.animationSource = this.textureAtlas.getAnimation(this.animationName);
		this.frameCount = this.animationSource.getFrameCount();
		
		this.setFrame(1, true);
		
		if(this.animation == null)
			this.animation = new MoBasicAnimation(this, "frame", this.getFrame(), this.getFrameCount());

		this.animation.setFromValue(this.getFrame());
		this.animation.setToValue(this.getFrameCount());
		this.animation.setEasingFunction(new MoLinearEase());
		this.animation.setDuration(this.animationSource.duration);
		this.animation.setRepeatBehavior(this.animationSource.repeatBehavior);
		this.animation.setRepeatCount(this.animationSource.repeat);
		this.animation.setDelay(this.animationSource.delay);
	},
	
	measure : function($super) {
		$super();

		if(MoIsNull(this.sprites))
			return;
		
		var sprite = null;
		var maxWidth = 0;
		var maxHeight = 0;
		
		for(var i = 0, len = this.sprites.length; i < len; ++i)
		{
			sprite = this.sprites[i];
			
			maxWidth = Math.max(maxWidth, sprite.x + sprite.width);
			maxHeight = Math.max(maxHeight, sprite.y + sprite.height);
		}
		
		this.setMeasuredWidth(maxWidth);
		this.setMeasuredHeight(maxHeight);
	},

	layout : function($super, unscaledWidth, unscaledHeight) {
		$super(unscaledWidth, unscaledHeight);
		
		if(MoIsNull(this.sprites))
			return;
		
		var sprite = null;
		var mx = new MoMatrix2D();
		var textureSource = this.textureAtlas.getTextureSource();
		var gfx = this.getGraphics();
		var tv = MoVector2D.Zero();
		var localCenter = null;
		
		gfx.beginPath();
		
		for(var i = 0, len = this.sprites.length; i < len; ++i)
		{
			sprite = this.sprites[i];
			tv.x = sprite.width * 0.5;
			tv.y = sprite.height * 0.5;
			
			mx.setIdentity();
			mx.scaleAt(sprite.scaleX, sprite.scaleY, sprite.tx, sprite.ty);
			mx.rotateAt(sprite.rotation, sprite.tx, sprite.ty);
			
			localCenter = mx.transformPoint(tv);
			
			mx.translate(sprite.x - localCenter.x, sprite.y - localCenter.y);
				
			gfx.drawImageComplex(
				textureSource, 
				sprite.sourceRect.x, 
				sprite.sourceRect.y, 
				sprite.sourceRect.width, 
				sprite.sourceRect.height, 
				0, 
				0, 
				sprite.sourceRect.width, 
				sprite.sourceRect.height,
				false, mx);
				
			gfx.beginPath();
			gfx.drawCircle(sprite.tx, sprite.ty, 4);
			gfx.fill(MoSolidColorBrush.fromColorHexWithAlpha("#00ff00", 0.5));
			
			localCenter = mx.transformPoint(tv);
			
			gfx.beginPath();
			gfx.drawCircle(localCenter.x, localCenter.y, 4);
			gfx.fill(MoSolidColorBrush.fromColorHexWithAlpha("#0000ff", 0.5));
		}
	}
});

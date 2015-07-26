MoTextureAtlasTextureRule = Class.create({
	initialize : function() {
		this.platform = null;
		this.pixelRatio = NaN;
		this.width = NaN;
		this.height = NaN;
	}
});

MoTextureAtlasTexture = Class.create({
	initialize : function(url, sw, sh) {
		this.url = url;
		this.sourceWidth = MoValueOrDefault(sw, null);
		this.sourceHeight = MoValueOrDefault(sh, null);
		this.rules = [];
	},
	
	getSourceWidth : function() {
		return this.sourceWidth;
	},
	
	getSourceHeight : function() {
		return this.sourceHeight;
	},
	
	hasPixelRatio : function(currentRatio) {
		return this.searchRules("ratio", currentRatio);
	},
	
	hasPlatform : function(currentPlatform) {
		return this.searchRules("platform", currentPlatform);
	},
	
	getClosestWidth : function(width) {
		var rule = null;
		var len = this.rules.length;
		var result = null;
		var delta = 0;
		
		for(var i = 0; i < len; ++i)
		{
			rule = this.rules[i];
			
			if(isNaN(rule.width))
				continue;
			
			delta = Math.abs(width - rule.width);
			
			if(result == null || (delta < result))
				result = delta;
		}

		return result;
	},
	
	getClosestHeight : function(height) {
		var rule = null;
		var len = this.rules.length;
		var result = null;
		var delta = 0;
		
		for(var i = 0; i < len; ++i)
		{
			rule = this.rules[i];
			
			if(isNaN(rule.height))
				continue;
			
			delta = Math.abs(height - rule.height);
			
			if(result == null || (delta < result))
				result = delta;
		}

		return result;
	},
	
	searchRules : function(propName, value) {
		var rule = null;
		var len = this.rules.length;
		var hasValue = false;
		
		for(var i = 0; i < len; ++i)
		{
			rule = this.rules[i];
			
			switch(propName)
			{
				case "ratio":
					if(isNaN(rule.pixelRatio))
						continue;

					hasValue = (rule.pixelRatio == value);
					break;
				case "platform":
					if(MoStringIsNullOrEmpty(rule.platform))
						continue;

					hasValue = (rule.platform.toLowerCase() == value.toLowerCase());
					break;
			}
			
			if(hasValue)
				return true;
		}

		return false;
	},
	
	cloneWithPlatform : function(platform) {
		var tex = new MoTextureAtlasTexture(this.url, this.sourceWidth, this.sourceHeight);
		var len = this.rules.length;
		
		for(var i = 0; i < len; ++i)
		{
			if(this.rules[i].platform == platform)
				tex.rules.push(this.rules[i]);
		}
		
		return tex;
	},
	
	cloneWithPixelRatio : function(ratio) {
		var tex = new MoTextureAtlasTexture(this.url, this.sourceWidth, this.sourceHeight);
		var len = this.rules.length;
		
		for(var i = 0; i < len; ++i)
		{
			if(this.rules[i].pixelRatio == ratio)
				tex.rules.push(this.rules[i]);
		}
		
		return tex;
	}
});

MoTextureAtlasSprite = Class.create({
	initialize : function(name) {
		this.name = name;
		this.uv = MoRectangle.Zero();
		this.rect = MoRectangle.Zero();
	}
});

MoTextureAtlasSpriteInfo = Class.create({
	initialize : function(id, name) {
		this.id = id;
		this.name = name;
		this.sourceRect = MoRectangle.Zero();
		this.x = 0;
		this.y = 0;
		this.width = 0;
		this.height = 0;
		this.rotation = 0;
		this.scaleX = 1;
		this.scaleY = 1;
		this.tx = 0;
		this.ty = 0;
		this.depth = 0;
	}
});

MoTextureAtlasAnimation = Class.create({
	initialize : function(name) {
		this.name = name;
		this.duration = 1;
		this.delay = 0;
		this.repeat = 1;
		this.repeatBehavior = MoRepeatBehavior.Loop;
		this.frames = [];
	},

	getFrameCount : function() {
		return this.frames.length;
	},
	
	getSprites : function(frameIndex) {
		if(frameIndex >= 0 && frameIndex < this.frames.length)
			return this.frames[frameIndex].sprites;

		throw new Error("Unable to find any sprites at '" + frameIndex + "'");
	}
});

MoTextureAtlasAnimationFrame = Class.create({
	initialize : function(spriteRef) {
		this.sprites = [];
	}
});

MoTextureAtlas = Class.create(MoEventDispatcher, {
	initialize : function($super) {
		$super();

		this.url = null;
		this.baseUrl = null;
		this.isReady = false;
		this.platformTexture = null;
		this.platformTextureSource = null;
		this.textures = [];
		this.sprites = [];
		this.animations = [];
		this.groups = [];
	},
	
	getUrl : function() {
		return this.url;
	},

	getBaseUrl : function() {
		return this.baseUrl;
	},
	
	setBaseUrl : function(value) {
		this.baseUrl = value;
	},
	
	getIsReady : function() {
		return this.isReady;
	},
	
	getTextureSource : function() {
		return this.platformTextureSource;
	},
	
	getSpriteRect : function(spriteName) {
		var sprite = this.lookupSprite(spriteName);
		var spriteRect = sprite.uv;
		var textureWidth = this.platformTextureSource.getWidth();
		var textureHeight = this.platformTextureSource.getHeight();

		return new MoRectangle(
			spriteRect.x * textureWidth, spriteRect.y * textureHeight, 
			spriteRect.width * textureWidth, spriteRect.height * textureHeight);
	},
	
	getSprite : function(instanceName, animationName) {
		return new MoSprite(instanceName, animationName, this);
	},

	getImage : function(instanceName, spriteName, enableTiling) {
		enableTiling = MoValueOrDefault(enableTiling, false);

		return MoImage.create(instanceName, this.platformTextureSource, this.getSpriteRect(spriteName), enableTiling);
	},
	
	getAnimation : function(animationName) {
		var len = this.animations.length;
		
		for(var i = 0; i < len; ++i)
		{
			if(this.animations[i].name.toLowerCase() == animationName.toLowerCase())
				return this.animations[i];
		}

		throw new Error("Unable to find sprite animation '" + animationName + "'");
	},
	
	getAnimationFrameCount : function(animationName) {
		var animation = this.getAnimation(animationName);

		return animation.frames.length;
	},
	
	load : function(url) {
		var request = MoCreateHttpRequestObject();
		var requestUrl = url;

		this.url = requestUrl;
		this.baseUrl = requestUrl.substring(0, requestUrl.lastIndexOf("/")+1);

		if(MoIsNull(request))
		{
			MoDebugWrite("Unable to create XMLHttpRequest object.", MoDebugLevel.Error);
			this.dispatchEvent(new MoLoadEvent(MoLoadEvent.FAILURE));

			return;
		}

		request.onreadystatechange = (function() {
			if(request.readyState == 4)
			{
				if(request.status == 200 || request.status == 304 || (request.status == 0 && requestUrl.substring(0, 4) == "file"))
					this.parse(request.responseXML);
				else
				{
					MoDebugWrite("Unable to load texture atlas from url: #{0}, reason=#{1}, responseCode=#{2}", MoDebugLevel.Error, requestUrl, request.statusText, request.status);
					this.dispatchEvent(new MoLoadEvent(MoLoadEvent.FAILURE));
				}
			}
		}).bind(this);

		request.open("GET", requestUrl, true);
		request.send(null);
	},

	parse : function(xml) {
		var doc = xml.documentElement;
		var node = null;
		var attr = null;
		var len = doc.childNodes.length;
		
		// parse textures
		this.parseNode(doc, "mo-textures", (function(n) { 
			this.parseNode(n, "mo-texture", this.parseTexture.bind(this)); 
		}).bind(this));
		
		// parse sprites
		this.parseNode(doc, "mo-sprites", (function(n) { 
			this.parseNode(n, "mo-sprite", this.parseSprite.bind(this)); 
		}).bind(this));
		
		// parse animations
		this.parseNode(doc, "mo-animations", (function(n) { 
			this.parseNode(n, "mo-animation", this.parseAnimation.bind(this)); 
		}).bind(this));
		
		this.platformTexture = this.lookupTexture();
		this.platformTextureSource = new MoTextureSource(MoUrl.combine(this.baseUrl, this.platformTexture.url), false);
		this.platformTextureSource.addEventHandler(MoSourceEvent.READY, this.textureSourceReadyHandler.asDelegate(this));
		this.platformTextureSource.load();
	},
	
	textureSourceReadyHandler : function(evt) {
		// update the animation sprites before notifying listeners
		// that we are ready, this way the data is prepared ahead of
		// time and won't need to be processed per animation frame
		var textureWidth = this.platformTextureSource.getWidth();
		var textureHeight = this.platformTextureSource.getHeight();
		
		for(var i = 0, len1 = this.animations.length; i < len1; ++i)
		{
			for(var j = 0, len2 = this.animations[i].frames.length; j < len2; ++j)
			{
				for(var k = 0, len3 = this.animations[i].frames[j].sprites.length; k < len3; ++k)
				{
					var sprite = this.animations[i].frames[j].sprites[k];
					var spriteSource = this.lookupSprite(sprite.name);
					var spriteRect = spriteSource.uv;
					
					// create the source region within the texture
					sprite.sourceRect.x = spriteRect.x * textureWidth;
					sprite.sourceRect.y = spriteRect.y * textureHeight;
					sprite.sourceRect.width = spriteRect.width * textureWidth;
					sprite.sourceRect.height = spriteRect.height * textureHeight;
					
					// calculate the actual size of the sprite
					sprite.width = (spriteSource.rect.width == 0 ? spriteRect.width : spriteSource.rect.width) * textureWidth;
					sprite.height = (spriteSource.rect.height == 0 ? spriteRect.height : spriteSource.rect.height) * textureHeight;
				}
			}
		}

		this.isReady = true;
		this.dispatchEvent(new MoLoadEvent(MoLoadEvent.SUCCESS));
	},
	
	lookupSprite : function(spriteName) {
		var len = this.sprites.length;
		var sprite = null;
		
		for(var i = 0; i < len; ++i)
		{
			sprite = this.sprites[i];
			
			if(sprite.name.toLowerCase() == spriteName.toLowerCase())
				return sprite;
		}

		throw new Error("Unable to find sprite '" + spriteName + "'");
	},
	
	lookupTexture : function() {
	
		// no textures available
		if(this.textures.length == 0)
			throw new Error("Unable to use texture atlas, no textures found.");
			
		// only one texture available, so just use it
		if(this.textures.length == 1)
			return this.textures[0];
	
		// otherwise let's try and find the right texture, textures
		// with platform specific rules trump everything else
		var possibles = this.getTexturesForPlatform(this.textures, MoGetPlatformType());
		
		// only one texture with platform found
		if(possibles.length == 1)
			return possibles[0];
					
		possibles = this.getTexturesForPixelRatio(possibles, MoScreen.getCurrent().getPixelScale());
		
		// only one texture with pixel ratio found
		if(possibles.length == 1)
			return possibles[0];
			
		possibles = this.getTexturesForSize(possibles);
		
		// regardless if a good size was found, we will always
		// have at least one value
		return possibles[0];
	},
	
	getTexturesForSize : function(list) {
		var screenWidth = MoScreen.getCurrent().getBounds().width;
		var screenHeight = MoScreen.getCurrent().getBounds().height;
		var len = list.length;
		var tex = null;
		var result = null;
		var delta = null;

		for(var i = 0; i < len; ++i)
		{
			tex = list[i];
			
			var widthDelta = tex.getClosestWidth(screenWidth);
			var heightDelta = tex.getClosestHeight(screenHeight);

			if(widthDelta == null && heightDelta == null)
				continue;
			
			var sizeDelta = (widthDelta == null ? heightDelta : widthDelta);
			
			if(delta == null || sizeDelta < delta)
			{
				result = tex;
				delta = sizeDelta;
			}
		}
		
		// no results found, fallback to original list
		if(result == null)
			return list;

		return [result];
	},
	
	getTexturesForPlatform : function(list, platform) {
		var results = [];
		var len = list.length;
		var tex = null;
		
		for(var i = 0; i < len; ++i)
		{
			tex = list[i];
			
			if(tex.hasPlatform(platform))
				results.push(tex.cloneWithPlatform(platform));
		}
		
		if(results.length == 0)
			return list;
		
		return results;
	},
	
	getTexturesForPixelRatio : function(list, pixelRatio) {
		var results = [];
		var len = list.length;
		var tex = null;
		
		for(var i = 0; i < len; ++i)
		{
			tex = list[i];
			
			if(tex.hasPixelRatio(pixelRatio))
				results.push(tex.cloneWithPixelRatio(pixelRatio));
		}

		if(results.length == 0)
			return list;
		
		return results;
	},
	
	parseNode : function(node, name, parseFunc, context) {
		var nodes = node.getElementsByTagName(name);
		
		if(MoIsNull(nodes))
			return null;
		
		for(var i = 0; i < nodes.length; i++)
			parseFunc(nodes[i], context);
	},
	
	parseTexture : function(textureNode) {
		var tex = new MoTextureAtlasTexture(
			this.getAttributeValue(textureNode, "url"),
			this.getAttributeValue(textureNode, "w", null),
			this.getAttributeValue(textureNode, "h", null));
		
		this.parseNode(textureNode, "mo-texture-rule", this.parseTextureRule.bind(this), tex);
		
		this.textures.push(tex);
	},
	
	parseTextureRule : function(ruleNode, tex) {
		var rule = new MoTextureAtlasTextureRule();
		rule.platform = this.getAttributeValue(ruleNode, "os-platform");
		rule.pixelRatio = parseInt(this.getAttributeValue(ruleNode, "pixel-ratio"), NaN);
		rule.width = parseInt(this.getAttributeValue(ruleNode, "screen-width"), NaN);
		rule.height = parseInt(this.getAttributeValue(ruleNode, "screen-height"), NaN);

		tex.rules.push(rule);
	},
	
	parseSprite : function(spriteNode) {
		var sprite = new MoTextureAtlasSprite(this.getAttributeValue(spriteNode, "name"));		
		sprite.uv = this.parseRect(this.getAttributeValue(spriteNode, "uv"));
		sprite.rect = this.parseRect(this.getAttributeValue(spriteNode, "rect", null));
		
		this.sprites.push(sprite);
	},
	
	parseAnimation : function(animationNode) {
		var animation = new MoTextureAtlasAnimation(this.getAttributeValue(animationNode, "name"));		
		animation.duration = parseFloat(this.getAttributeValue(animationNode, "duration"));
		animation.delay = parseFloat(this.getAttributeValue(animationNode, "delay", 0));
		animation.repeat = parseFloat(this.getAttributeValue(animationNode, "repeat", 1));
		animation.repeatBehavior = this.parseRepeatBehavior(this.getAttributeValue(animationNode, "repeat-type"));

		this.parseNode(animationNode, "mo-frame", this.parseAnimationFrame.bind(this), animation);

		this.animations.push(animation);
	},
	
	parseAnimationFrame : function(frameNode, animation) {
		var frame = new MoTextureAtlasAnimationFrame();
		
		this.parseNode(frameNode, "mo-sprite", this.parseAnimationSprite.bind(this), frame);
		
		animation.frames.push(frame);
	},
	
	parseAnimationSprite : function(spriteNode, animationFrame) {
		var spriteId = this.getAttributeValue(spriteNode, "id");
		var spriteName = this.getAttributeValue(spriteNode, "name");
		var sprite = new MoTextureAtlasSpriteInfo(spriteId, spriteName);

		sprite.x = parseFloat(this.getAttributeValue(spriteNode, "x", 0));
		sprite.y = parseFloat(this.getAttributeValue(spriteNode, "y", 0));
		sprite.rotation = parseFloat(this.getAttributeValue(spriteNode, "rotation", 0));
		sprite.scaleX = parseFloat(this.getAttributeValue(spriteNode, "sx", 0));
		sprite.scaleY = parseFloat(this.getAttributeValue(spriteNode, "sy", 0));
		sprite.tx = parseFloat(this.getAttributeValue(spriteNode, "tx", 0));
		sprite.ty = parseFloat(this.getAttributeValue(spriteNode, "ty", 0));
		sprite.depth = parseFloat(this.getAttributeValue(spriteNode, "depth", 0));
		
		animationFrame.sprites.push(sprite);
	},

	parseRect : function(value) {
		if(MoIsNull(value))
			return MoRectangle.Zero();
		
		return MoRectangle.parse(value);
	},
	
	parseRepeatBehavior : function(value) {
		if(value == "reverse")
			return MoRepeatBehavior.Reverse;
		
		return MoRepeatBehavior.Loop;
	},
	
	getAttributeValue : function(node, attrName, defaultValue) {
		defaultValue = MoValueOrDefault(defaultValue, null);

		if(node.attributes.length > 0)
		{
			var attr = node.attributes.getNamedItem(attrName)
			
			if(!MoIsNull(attr))
				return attr.value;
		}
		
		return defaultValue;
	}
});
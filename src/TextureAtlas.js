import {
		ValueOrDefault,
		CreateHttpRequestObject,
		DebugWrite,
		DebugLevel,
		GetPlatformType
} from "./Engine";
import Rectangle from "./Rectangle";
import RepeatBehavior from "./RepeatBehavior";
import Sprite from "./Sprite";
import Image from "./Image";
import LoadEvent from "./LoadEvent";
import TextureSource from "./TextureSource";
import Url from "./Url";
import SourceEvent from "./SourceEvent";
import Screen from "./Screen";

class TextureAtlasTextureRule {
	constructor() {
		this.platform = null;
		this.pixelRatio = NaN;
		this.width = NaN;
		this.height = NaN;
	}
}

class TextureAtlasTexture {
	constructor(url, sw, sh) {
		this.url = url;
		this.sourceWidth = ValueOrDefault(sw, null);
		this.sourceHeight = ValueOrDefault(sh, null);
		this.rules = [];
	}

	getSourceWidth() {
		return this.sourceWidth;
	}

	getSourceHeight() {
		return this.sourceHeight;
	}

	hasPixelRatio(currentRatio) {
		return this.searchRules("ratio", currentRatio);
	}

	hasPlatform(currentPlatform) {
		return this.searchRules("platform", currentPlatform);
	}

	getClosestWidth(width) {
		var rule = null;
		var len = this.rules.length;
		var result = null;
		var delta = 0;

		for (var i = 0; i < len; ++i) {
			rule = this.rules[i];

			if (isNaN(rule.width)) {
				continue;
			}

			delta = Math.abs(width - rule.width);

			if (result == null || (delta < result)) {
				result = delta;
			}
		}

		return result;
	}

	getClosestHeight(height) {
		var rule = null;
		var len = this.rules.length;
		var result = null;
		var delta = 0;

		for (var i = 0; i < len; ++i) {
			rule = this.rules[i];

			if (isNaN(rule.height)) {
				continue;
			}

			delta = Math.abs(height - rule.height);

			if (result == null || (delta < result)) {
				result = delta;
			}
		}

		return result;
	}

	searchRules(propName, value) {
		var rule = null;
		var len = this.rules.length;
		var hasValue = false;

		for (var i = 0; i < len; ++i) {
			rule = this.rules[i];

			switch (propName) {
				case "ratio":
					if (isNaN(rule.pixelRatio)) {
						continue;
					}

					hasValue = (rule.pixelRatio == value);
					break;
				case "platform":
					if (!rule.platform) {
						continue;
					}

					hasValue = (rule.platform.toLowerCase() == value.toLowerCase());
					break;
			}

			if (hasValue) {
				return true;
			}
		}

		return false;
	}

	cloneWithPlatform(platform) {
		var tex = new TextureAtlasTexture(this.url, this.sourceWidth, this.sourceHeight);
		var len = this.rules.length;

		for (var i = 0; i < len; ++i) {
			if (this.rules[i].platform == platform) {
				tex.rules.push(this.rules[i]);
			}
		}

		return tex;
	}

	cloneWithPixelRatio(ratio) {
		var tex = new TextureAtlasTexture(this.url, this.sourceWidth, this.sourceHeight);
		var len = this.rules.length;

		for (var i = 0; i < len; ++i) {
			if (this.rules[i].pixelRatio == ratio) {
				tex.rules.push(this.rules[i]);
			}
		}

		return tex;
	}
}

class TextureAtlasSprite {
	constructor(name) {
		this.name = name;
		this.uv = Rectangle.Zero();
		this.rect = Rectangle.Zero();
	}
}

class TextureAtlasSpriteInfo {
	constructor(id, name) {
		this.id = id;
		this.name = name;
		this.sourceRect = Rectangle.Zero();
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
}

class TextureAtlasAnimation {
	constructor(name) {
		this.name = name;
		this.duration = 1;
		this.delay = 0;
		this.repeat = 1;
		this.repeatBehavior = RepeatBehavior.Loop;
		this.frames = [];
	}

	getFrameCount() {
		return this.frames.length;
	}

	getSprites(frameIndex) {
		if (frameIndex >= 0 && frameIndex < this.frames.length) {
			return this.frames[frameIndex].sprites;
		}

		throw new Error("Unable to find any sprites at '" + frameIndex + "'");
	}
}

class TextureAtlasAnimationFrame {
	constructor(spriteRef) {
		this.sprites = [];
	}
}

class TextureAtlas extends EventDispatcher {
	constructor() {
		super();

		this.url = null;
		this.baseUrl = null;
		this.isReady = false;
		this.platformTexture = null;
		this.platformTextureSource = null;
		this.textures = [];
		this.sprites = [];
		this.animations = [];
		this.groups = [];
	}

	getUrl() {
		return this.url;
	}

	getBaseUrl() {
		return this.baseUrl;
	}

	setBaseUrl(value) {
		this.baseUrl = value;
	}

	getIsReady() {
		return this.isReady;
	}

	getTextureSource() {
		return this.platformTextureSource;
	}

	getSpriteRect(spriteName) {
		var sprite = this.lookupSprite(spriteName);
		var spriteRect = sprite.uv;
		var textureWidth = this.platformTextureSource.getWidth();
		var textureHeight = this.platformTextureSource.getHeight();

		return new Rectangle(
				spriteRect.x * textureWidth, spriteRect.y * textureHeight,
				spriteRect.width * textureWidth, spriteRect.height * textureHeight);
	}

	getSprite(instanceName, animationName) {
		return new Sprite(instanceName, animationName, this);
	}

	getImage(instanceName, spriteName, enableTiling) {
		enableTiling = ValueOrDefault(enableTiling, false);

		return Image.create(instanceName, this.platformTextureSource, this.getSpriteRect(spriteName), enableTiling);
	}

	getAnimation(animationName) {
		var len = this.animations.length;

		for (var i = 0; i < len; ++i) {
			if (this.animations[i].name.toLowerCase() == animationName.toLowerCase()) {
				return this.animations[i];
			}
		}

		throw new Error("Unable to find sprite animation '" + animationName + "'");
	}

	getAnimationFrameCount(animationName) {
		var animation = this.getAnimation(animationName);

		return animation.frames.length;
	}

	load(url) {
		var request = CreateHttpRequestObject();
		var requestUrl = url;

		this.url = requestUrl;
		this.baseUrl = requestUrl.substring(0, requestUrl.lastIndexOf("/") + 1);

		if (request == null) {
			DebugWrite("Unable to create XMLHttpRequest object.", DebugLevel.Error);
			this.dispatchEvent(new LoadEvent(LoadEvent.FAILURE));

			return;
		}

		request.onreadystatechange = (function () {
			if (request.readyState == 4) {
				if (request.status == 200 || request.status == 304 ||
						(request.status == 0 && requestUrl.substring(0, 4) == "file")) {
					this.parse(request.responseXML);
				}
				else {
					DebugWrite("Unable to load texture atlas from url: #{0}, reason=#{1}, responseCode=#{2}", DebugLevel.Error, requestUrl, request.statusText, request.status);
					this.dispatchEvent(new LoadEvent(LoadEvent.FAILURE));
				}
			}
		}).bind(this);

		request.open("GET", requestUrl, true);
		request.send(null);
	}

	parse(xml) {
		var doc = xml.documentElement;

		// parse textures
		this.parseNode(doc, "mo-textures", (function (n) {
			this.parseNode(n, "mo-texture", this.parseTexture.bind(this));
		}).bind(this));

		// parse sprites
		this.parseNode(doc, "mo-sprites", (function (n) {
			this.parseNode(n, "mo-sprite", this.parseSprite.bind(this));
		}).bind(this));

		// parse animations
		this.parseNode(doc, "mo-animations", (function (n) {
			this.parseNode(n, "mo-animation", this.parseAnimation.bind(this));
		}).bind(this));

		this.platformTexture = this.lookupTexture();
		this.platformTextureSource = new TextureSource(Url.combine(this.baseUrl, this.platformTexture.url), false);
		this.platformTextureSource.addEventHandler(SourceEvent.READY, this.textureSourceReadyHandler.asDelegate(this));
		this.platformTextureSource.load();
	}

	textureSourceReadyHandler(evt) {
		// update the animation sprites before notifying listeners
		// that we are ready, this way the data is prepared ahead of
		// time and won't need to be processed per animation frame
		var textureWidth = this.platformTextureSource.getWidth();
		var textureHeight = this.platformTextureSource.getHeight();

		for (var i = 0, len1 = this.animations.length; i < len1; ++i) {
			for (var j = 0, len2 = this.animations[i].frames.length; j < len2; ++j) {
				for (var k = 0, len3 = this.animations[i].frames[j].sprites.length; k < len3; ++k) {
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
					sprite.height = (spriteSource.rect.height == 0 ? spriteRect.height : spriteSource.rect.height) *
							textureHeight;
				}
			}
		}

		this.isReady = true;
		this.dispatchEvent(new LoadEvent(LoadEvent.SUCCESS));
	}

	lookupSprite(spriteName) {
		var len = this.sprites.length;
		var sprite = null;

		for (var i = 0; i < len; ++i) {
			sprite = this.sprites[i];

			if (sprite.name.toLowerCase() == spriteName.toLowerCase()) {
				return sprite;
			}
		}

		throw new Error("Unable to find sprite '" + spriteName + "'");
	}

	lookupTexture() {

		// no textures available
		if (this.textures.length == 0) {
			throw new Error("Unable to use texture atlas, no textures found.");
		}

		// only one texture available, so just use it
		if (this.textures.length == 1) {
			return this.textures[0];
		}

		// otherwise let's try and find the right texture, textures
		// with platform specific rules trump everything else
		var possibles = this.getTexturesForPlatform(this.textures, GetPlatformType());

		// only one texture with platform found
		if (possibles.length == 1) {
			return possibles[0];
		}

		possibles = this.getTexturesForPixelRatio(possibles, Screen.getCurrent().getPixelScale());

		// only one texture with pixel ratio found
		if (possibles.length == 1) {
			return possibles[0];
		}

		possibles = this.getTexturesForSize(possibles);

		// regardless if a good size was found, we will always
		// have at least one value
		return possibles[0];
	}

	getTexturesForSize(list) {
		var screenWidth = Screen.getCurrent().getBounds().width;
		var screenHeight = Screen.getCurrent().getBounds().height;
		var len = list.length;
		var tex = null;
		var result = null;
		var delta = null;

		for (var i = 0; i < len; ++i) {
			tex = list[i];

			var widthDelta = tex.getClosestWidth(screenWidth);
			var heightDelta = tex.getClosestHeight(screenHeight);

			if (widthDelta == null && heightDelta == null) {
				continue;
			}

			var sizeDelta = (widthDelta == null ? heightDelta : widthDelta);

			if (delta == null || sizeDelta < delta) {
				result = tex;
				delta = sizeDelta;
			}
		}

		// no results found, fallback to original list
		if (result == null) {
			return list;
		}

		return [result];
	}

	getTexturesForPlatform(list, platform) {
		var results = [];
		var len = list.length;
		var tex = null;

		for (var i = 0; i < len; ++i) {
			tex = list[i];

			if (tex.hasPlatform(platform)) {
				results.push(tex.cloneWithPlatform(platform));
			}
		}

		if (results.length == 0) {
			return list;
		}

		return results;
	}

	getTexturesForPixelRatio(list, pixelRatio) {
		var results = [];
		var len = list.length;
		var tex = null;

		for (var i = 0; i < len; ++i) {
			tex = list[i];

			if (tex.hasPixelRatio(pixelRatio)) {
				results.push(tex.cloneWithPixelRatio(pixelRatio));
			}
		}

		if (results.length == 0) {
			return list;
		}

		return results;
	}

	parseNode(node, name, parseFunc, context) {
		var nodes = node.getElementsByTagName(name);

		if (nodes == null) {
			return;
		}

		for (var i = 0; i < nodes.length; i++) {
			parseFunc(nodes[i], context);
		}
	}

	parseTexture(textureNode) {
		var tex = new TextureAtlasTexture(
				this.getAttributeValue(textureNode, "url"),
				this.getAttributeValue(textureNode, "w", null),
				this.getAttributeValue(textureNode, "h", null));

		this.parseNode(textureNode, "mo-texture-rule", this.parseTextureRule.bind(this), tex);

		this.textures.push(tex);
	}

	parseTextureRule(ruleNode, tex) {
		var rule = new TextureAtlasTextureRule();
		rule.platform = this.getAttributeValue(ruleNode, "os-platform");
		rule.pixelRatio = parseInt(this.getAttributeValue(ruleNode, "pixel-ratio"), NaN);
		rule.width = parseInt(this.getAttributeValue(ruleNode, "screen-width"), NaN);
		rule.height = parseInt(this.getAttributeValue(ruleNode, "screen-height"), NaN);

		tex.rules.push(rule);
	}

	parseSprite(spriteNode) {
		var sprite = new TextureAtlasSprite(this.getAttributeValue(spriteNode, "name"));
		sprite.uv = this.parseRect(this.getAttributeValue(spriteNode, "uv"));
		sprite.rect = this.parseRect(this.getAttributeValue(spriteNode, "rect", null));

		this.sprites.push(sprite);
	}

	parseAnimation(animationNode) {
		var animation = new TextureAtlasAnimation(this.getAttributeValue(animationNode, "name"));
		animation.duration = parseFloat(this.getAttributeValue(animationNode, "duration"));
		animation.delay = parseFloat(this.getAttributeValue(animationNode, "delay", 0));
		animation.repeat = parseFloat(this.getAttributeValue(animationNode, "repeat", 1));
		animation.repeatBehavior = this.parseRepeatBehavior(this.getAttributeValue(animationNode, "repeat-type"));

		this.parseNode(animationNode, "mo-frame", this.parseAnimationFrame.bind(this), animation);

		this.animations.push(animation);
	}

	parseAnimationFrame(frameNode, animation) {
		var frame = new TextureAtlasAnimationFrame();

		this.parseNode(frameNode, "mo-sprite", this.parseAnimationSprite.bind(this), frame);

		animation.frames.push(frame);
	}

	parseAnimationSprite(spriteNode, animationFrame) {
		var spriteId = this.getAttributeValue(spriteNode, "id");
		var spriteName = this.getAttributeValue(spriteNode, "name");
		var sprite = new TextureAtlasSpriteInfo(spriteId, spriteName);

		sprite.x = parseFloat(this.getAttributeValue(spriteNode, "x", 0));
		sprite.y = parseFloat(this.getAttributeValue(spriteNode, "y", 0));
		sprite.rotation = parseFloat(this.getAttributeValue(spriteNode, "rotation", 0));
		sprite.scaleX = parseFloat(this.getAttributeValue(spriteNode, "sx", 0));
		sprite.scaleY = parseFloat(this.getAttributeValue(spriteNode, "sy", 0));
		sprite.tx = parseFloat(this.getAttributeValue(spriteNode, "tx", 0));
		sprite.ty = parseFloat(this.getAttributeValue(spriteNode, "ty", 0));
		sprite.depth = parseFloat(this.getAttributeValue(spriteNode, "depth", 0));

		animationFrame.sprites.push(sprite);
	}

	parseRect(value) {
		if (value == null) {
			return Rectangle.Zero();
		}

		return Rectangle.parse(value);
	}

	parseRepeatBehavior(value) {
		if (value == "reverse") {
			return RepeatBehavior.Reverse;
		}

		return RepeatBehavior.Loop;
	}

	getAttributeValue(node, attrName, defaultValue) {
		defaultValue = ValueOrDefault(defaultValue, null);

		if (node.attributes.length > 0) {
			var attr = node.attributes.getNamedItem(attrName);

			if (attr != null) {
				return attr.value;
			}
		}

		return defaultValue;
	}
}

export default TextureAtlas;

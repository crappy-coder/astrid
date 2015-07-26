import Canvas from "./Canvas";
import { ValueOrDefault } from "../Engine";
import PropertyOptions from "./PropertyOptions";
import BasicAnimation from "../animation/BasicAnimation";
import LinearEase from "../animation/LinearEase";
import Matrix2D from "../Matrix2D";
import Vector2D from "../Vector2D";
import SolidColorBrush from "../brushes/SolidColorBrush";

class Sprite extends Canvas {
	constructor(name, animationName, textureAtlas) {
		super(name);

		this.sprites = null;
		this.textureAtlas = textureAtlas;
		this.animation = null;
		this.animationSource = null;
		this.frameCount = 0;

		this.setAnimationName(animationName);
	}

	initializeAnimatablePropertiesCore() {
		super.initializeAnimatablePropertiesCore();

		this.enableAnimatableProperty("frame", this.getFrame, this.setFrame, PropertyOptions.AffectsLayout |
				PropertyOptions.AffectsMeasure);
	}

	getFrameCount() {
		return this.frameCount;
	}

	getFrame() {
		return this.getPropertyValue("frame");
	}

	setFrame(value, force) {
		force = ValueOrDefault(force, false);

		if (this.setPropertyValue("frame", Math.round(value)) || force) {
			this.updateSpritesForFrame(this.getFrame() - 1);
		}
	}

	getAnimationInstance() {
		return this.animation;
	}

	getAnimationName() {
		return this.animationName;
	}

	setAnimationName(value) {
		if (value == null) {
			throw new Error("Sprite must have an animation.");
		}

		if (this.animationName != value) {
			this.animationName = value;
			this.reset();
		}
	}

	getTextureAtlas() {
		return this.textureAtlas;
	}

	getRepeatCount() {
		return this.animation.getRepeatCount();
	}

	setRepeatCount(value) {
		this.animation.setRepeatCount(value);
	}

	getRepeatBehavior() {
		return this.animation.getRepeatBehavior();
	}

	setRepeatBehavior(value) {
		this.animation.setRepeatBehavior(value);
	}

	getDuration() {
		return this.animation.getDuration();
	}

	setDuration(value) {
		this.animation.setDuration(value);
	}

	getCurrentTime() {
		return this.animation.getCurrentTime();
	}

	getIsRunning() {
		return this.animation.getIsRunning();
	}

	play(name) {
		name = ValueOrDefault(name, this.getAnimationName());

		if (name != this.getAnimationName()) {
			//this.dispatchEvent(new Event(Event.CHANGE));
			//this.setAnimationName(name);
		}

		if (!this.animation.getIsRunning()) {
			this.animation.play();
		}
	}

	pause() {
		this.animation.pause();
	}

	resume() {
		if (!this.animation.getIsRunning()) {
			this.animation.resume();
		}
	}

	stop() {
		this.setFrame(1, true);
		this.animation.stop();
	}

	updateSpritesForFrame(frame) {

		this.sprites = this.animationSource.getSprites(frame);
	}

	reset() {
		if (this.animation != null) {
			this.animation.stop();
		}

		this.animationSource = this.textureAtlas.getAnimation(this.animationName);
		this.frameCount = this.animationSource.getFrameCount();

		this.setFrame(1, true);

		if (this.animation == null) {
			this.animation = new BasicAnimation(this, "frame", this.getFrame(), this.getFrameCount());
		}

		this.animation.setFromValue(this.getFrame());
		this.animation.setToValue(this.getFrameCount());
		this.animation.setEasingFunction(new LinearEase());
		this.animation.setDuration(this.animationSource.duration);
		this.animation.setRepeatBehavior(this.animationSource.repeatBehavior);
		this.animation.setRepeatCount(this.animationSource.repeat);
		this.animation.setDelay(this.animationSource.delay);
	}

	measure() {
		super.measure();

		if (this.sprites == null) {
			return;
		}

		var sprite = null;
		var maxWidth = 0;
		var maxHeight = 0;

		for (var i = 0, len = this.sprites.length; i < len; ++i) {
			sprite = this.sprites[i];

			maxWidth = Math.max(maxWidth, sprite.x + sprite.width);
			maxHeight = Math.max(maxHeight, sprite.y + sprite.height);
		}

		this.setMeasuredWidth(maxWidth);
		this.setMeasuredHeight(maxHeight);
	}

	layout(unscaledWidth, unscaledHeight) {
		super.layout(unscaledWidth, unscaledHeight);

		if (this.sprites == null) {
			return;
		}

		var sprite = null;
		var mx = new Matrix2D();
		var textureSource = this.textureAtlas.getTextureSource();
		var gfx = this.getGraphics();
		var tv = Vector2D.Zero();
		var localCenter = null;

		gfx.beginPath();

		for (var i = 0, len = this.sprites.length; i < len; ++i) {
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
			gfx.fill(SolidColorBrush.fromColorHexWithAlpha("#00ff00", 0.5));

			localCenter = mx.transformPoint(tv);

			gfx.beginPath();
			gfx.drawCircle(localCenter.x, localCenter.y, 4);
			gfx.fill(SolidColorBrush.fromColorHexWithAlpha("#0000ff", 0.5));
		}
	}
}

export default Sprite;

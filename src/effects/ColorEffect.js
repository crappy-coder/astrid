import Effect from "./Effect";
import PropertyOptions from "../ui/PropertyOptions";

class ColorEffect extends Effect {
	constructor(redScale, redOffset, greenScale, greenOffset, blueScale, blueOffset, alphaScale, alphaOffset) {
		super();

		this.setRedScale(astrid.valueOrDefault(redScale, 1));
		this.setRedOffset(astrid.valueOrDefault(redOffset, 0));

		this.setGreenScale(astrid.valueOrDefault(greenScale, 1));
		this.setGreenOffset(astrid.valueOrDefault(greenOffset, 0));

		this.setBlueScale(astrid.valueOrDefault(blueScale, 1));
		this.setBlueOffset(astrid.valueOrDefault(blueOffset, 0));

		this.setAlphaScale(astrid.valueOrDefault(alphaScale, 1));
		this.setAlphaOffset(astrid.valueOrDefault(alphaOffset, 0));
	}

	initializeAnimatablePropertiesCore() {
		super.initializeAnimatablePropertiesCore();

		this.enableAnimatableProperty("redScale", this.getRedScale, this.setRedScale, PropertyOptions.AffectsRender);
		this.enableAnimatableProperty("greenScale", this.getGreenScale, this.setGreenScale, PropertyOptions.AffectsRender);
		this.enableAnimatableProperty("blueScale", this.getBlueScale, this.setBlueScale, PropertyOptions.AffectsRender);
		this.enableAnimatableProperty("alphaScale", this.getAlphaScale, this.setAlphaScale, PropertyOptions.AffectsRender);
		this.enableAnimatableProperty("redOffset", this.getRedOffset, this.setRedOffset, PropertyOptions.AffectsRender);
		this.enableAnimatableProperty("greenOffset", this.getGreenOffset, this.setGreenOffset, PropertyOptions.AffectsRender);
		this.enableAnimatableProperty("blueOffset", this.getBlueOffset, this.setBlueOffset, PropertyOptions.AffectsRender);
		this.enableAnimatableProperty("alphaOffset", this.getAlphaOffset, this.setAlphaOffset, PropertyOptions.AffectsRender);
	}

	getRedScale() {
		return this.getPropertyValue("redScale");
	}

	setRedScale(value) {
		this.setPropertyValue("redScale", value);
	}

	getGreenScale() {
		return this.getPropertyValue("greenScale");
	}

	setGreenScale(value) {
		this.setPropertyValue("greenScale", value);
	}

	getBlueScale() {
		return this.getPropertyValue("blueScale");
	}

	setBlueScale(value) {
		this.setPropertyValue("blueScale", value);
	}

	getAlphaScale() {
		return this.getPropertyValue("alphaScale");
	}

	setAlphaScale(value) {
		this.setPropertyValue("alphaScale", value);
	}

	getRedOffset() {
		return this.getPropertyValue("redOffset");
	}

	setRedOffset(value) {
		this.setPropertyValue("redOffset", value);
	}

	getGreenOffset() {
		return this.getPropertyValue("greenOffset");
	}

	setGreenOffset(value) {
		this.setPropertyValue("greenOffset", value);
	}

	getBlueOffset() {
		return this.getPropertyValue("blueOffset");
	}

	setBlueOffset(value) {
		this.setPropertyValue("blueOffset", value);
	}

	getAlphaOffset() {
		return this.getPropertyValue("alphaOffset");
	}

	setAlphaOffset(value) {
		this.setPropertyValue("alphaOffset", value);
	}

	processCore(target, pixelData) {
		var data = pixelData.data;
		var len = data.length;

		for (var i = 0; i < len; i += 4) {
			data[i] = data[i] * this.getRedScale() + this.getRedOffset();
			data[i + 1] = data[i + 1] * this.getGreenScale() + this.getGreenOffset();
			data[i + 2] = data[i + 2] * this.getBlueScale() + this.getBlueOffset();
			data[i + 3] = data[i + 3] * this.getAlphaScale() + this.getAlphaOffset();
		}

		return pixelData;
	}
}

export default ColorEffect;

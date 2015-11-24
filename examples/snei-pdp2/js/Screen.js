import Application from "../../../src/Application"
import Event from "../../../src/Event"
import ContentControl from "../../../src/ui/ContentControl"
import StackPanel from "../../../src/ui/StackPanel"
import Color from "../../../src/graphics/Color"
import HorizontalAlignment from "../../../src/ui/HorizontalAlignment"
import VerticalAlignment from "../../../src/ui/VerticalAlignment"
import SolidColorBrush from "../../../src/brushes/SolidColorBrush"
import BasicAnimation from "../../../src/animation/BasicAnimation"
import Easing from "../../../src/animation/Easing"

import Animations from "./Animations"
import ScreenType from "./ScreenType"
import ScreenEvent from "./ScreenEvent"

class Screen extends ContentControl {
	constructor(name, title, type, navigator) {
		super(name);

		this.title = title;
		this.type = type;
		this.navigator = navigator;
		this.needsProductHeader = true;
		this.showHideAnimation = null;

		this.state = {
			productCount: 0
		};

		this.setAlphaAffectsVisibility(true);
		this.setAlpha(0);
	}

	get productCount() {
		return this.state.productCount;
	}

	set productCount(value) {
		if(this.state.productCount !== value)
		{
			this.state.productCount = value;
			this.dispatchEvent(new ScreenEvent(ScreenEvent.PRODUCT_COUNT_CHANGED));
		}
	}

	show(disableAnimation) {
		this.toggleVisibility(true, disableAnimation);
	}

	hide(disableAnimation) {
		this.toggleVisibility(false, disableAnimation);
	}

	toggleVisibility(visible, disableAnimation) {
		if(!this.showHideAnimation)
		{
			this.showHideAnimation = new BasicAnimation(this, "alpha", null);
			this.showHideAnimation.setDuration(Animations.ShowHideFadeDuration);
			this.showHideAnimation.setEasingFunction(Animations.ShowHideFadeEasing);
		}

		this.showHideAnimation.stop();
		this.showHideAnimation.setToValue(visible ? 1 : 0);
		this.showHideAnimation.play();
	}

	processKeyEvent(keyEvent) {
		return false;
	}

	processGamepadButtonEvent(buttonEvent) {
		return false;
	}
}

export default Screen;
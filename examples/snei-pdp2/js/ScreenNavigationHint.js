import { ValueOrDefault } from "../../../src/Engine";
import Application from "../../../src/Application"
import Event from "../../../src/Event"
import Key from "../../../src/input/Key"
import KeyEvent from "../../../src/input/KeyEvent"
import Canvas from "../../../src/ui/Canvas"
import StackPanel from "../../../src/ui/StackPanel"
import ContentControl from "../../../src/ui/ContentControl"
import Image from "../../../src/ui/Image"
import Border from "../../../src/ui/Border"
import HorizontalAlignment from "../../../src/ui/HorizontalAlignment"
import VerticalAlignment from "../../../src/ui/VerticalAlignment"
import TextureSource from "../../../src/ui/TextureSource"
import Dock from "../../../src/ui/Dock"
import DockPanel from "../../../src/ui/DockPanel"
import Stretch from "../../../src/ui/Stretch"
import Orientation from "../../../src/ui/Orientation"
import Color from "../../../src/graphics/Color"
import ShapeRectangle from "../../../src/shapes/ShapeRectangle"
import ShapeLine from "../../../src/shapes/ShapeLine"
import Vector2D from "../../../src/Vector2D"
import SolidColorBrush from "../../../src/brushes/SolidColorBrush"
import LinearGradientBrush from "../../../src/brushes/LinearGradientBrush"
import ImageBrush from "../../../src/brushes/ImageBrush"
import VideoBrush from "../../../src/brushes/VideoBrush"
import BasicParallelAnimation from "../../../src/animation/BasicParallelAnimation"
import BasicAnimation from "../../../src/animation/BasicAnimation"
import ExpoEase from "../../../src/animation/ExpoEase"
import EasingMode from "../../../src/animation/EasingMode"
import AnimationEvent from "../../../src/animation/AnimationEvent"

import Animations from "./Animations"
import ScreenNavigationDirection from "./ScreenNavigationDirection"
import ScreenNavigationEvent from "./ScreenNavigationEvent"
import ScreenNavigationHintDirection from "./ScreenNavigationHintDirection";
import TextLabel from "./TextLabel"

class ScreenNavigationHint extends StackPanel {
	constructor(name, direction, navigator) {
		super(name);

		this.direction = direction;
		this.navigator = navigator;
		this.titleContainer = null;
		this.titleLabels = [];
		this.titleLabelIndex = 0;
		this.showHideAnimation = null;

		this.state = {
			title: "",
		};

		this.navigator.addEventHandler(ScreenNavigationEvent.NAVIGATION_BEGIN, this.onNavigationBegin.d(this));

		this.setAlphaAffectsVisibility(true);
		this.setGap(10);
	}

	get selectedScreen() {
		return this.navigator.selectedScreen;
	}

	get selectedScreenIndex() {
		return this.navigator.selectedScreenIndex;
	}

	show(disableAnimation) {
		if(this.getAlpha() < 1.0)
		{
			this.reset();
			this.toggleVisibility(true, disableAnimation);
		}
	}

	hide(disableAnimation) {
		if(this.getAlpha() > 0.0)
			this.toggleVisibility(false, disableAnimation);
	}

	toggleVisibility(visible, disableAnimation) {
		disableAnimation = ValueOrDefault(disableAnimation, false);

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

	createChildren() {
		var arrowImage = Image.create("arrow", (this.direction === ScreenNavigationHintDirection.Up ? ScreenNavigationHint.ArrowUpImageUrl : ScreenNavigationHint.ArrowDownImageUrl));
		arrowImage.setHorizontalAlignment(HorizontalAlignment.Center);
		arrowImage.setVerticalAlignment(VerticalAlignment.Center);

		if(this.direction === ScreenNavigationHintDirection.Up)
		{
			this.add(arrowImage);
			this.createTitleLabels();
		}
		else
		{
			this.createTitleLabels();
			this.add(arrowImage);
		}
	}

	createTitleLabels() {
		this.titleContainer = new Canvas("title-labels");
		this.titleContainer.setPercentWidth(100);

		for(var i = 0; i < 2; i++)
		{
			var lbl = new TextLabel("title-label-" + i, "x-small");
			lbl.setVerticalAlignment(VerticalAlignment.Center);
			lbl.setForeground(SolidColorBrush.white());
			lbl.setAlpha(0);
			lbl.addEventHandler(Event.RESIZED, this.onTitleLabelResized.d(this));

			this.titleLabels[i] = lbl;
			this.titleContainer.add(lbl);
		}

		this.add(this.titleContainer);
	}

	reset() {
		this.updateTitleLayout();

		this.state.title = "";
		this.titleLabelIndex = 0;
	}

	updateTitle(newTitle) {
		var activeLabel = this.titleLabels[this.titleLabelIndex];
		var needsUpdate = (activeLabel.getText() === newTitle);

		activeLabel.setText(newTitle);

		this.titleLabelIndex ^= 1;
		this.state.title = newTitle;

		// we only update the layout when the active label and title have not changed
		// since this will not trigger a resize event and if they have changed it will
		// trigger a resize event which will perform the layout update so we do not
		// want to do this twice
		if(needsUpdate)
			this.updateTitleLayout();
	}

	updateTitleLayout() {
		var lastLabel = this.titleLabels[this.titleLabelIndex];
		var lastLabelWidth = lastLabel.getExactOrMeasuredWidth();
		var lastLabelHeight = lastLabel.getExactOrMeasuredHeight();
		var activeLabel = this.titleLabels[this.titleLabelIndex ^ 1];
		var activeLabelWidth = activeLabel.getExactOrMeasuredWidth();
		var activeLabelHeight = activeLabel.getExactOrMeasuredHeight() || lastLabelHeight;
		var maxWidth = this.getWidth();

		this.titleContainer.setHeight(activeLabelHeight);

		// update the non-active label
		lastLabel.setX((maxWidth - lastLabelWidth) * 0.5);

		// update the active label
		activeLabel.setX((maxWidth - activeLabelWidth) * 0.5);
	}

	updateTitleRotation(direction, animate) {
		var lastLabel = this.titleLabels[this.titleLabelIndex];
		var lastLabelHeight = lastLabel.getExactOrMeasuredHeight();
		var lastLabelFromY = 0;
		var lastLabelToY = 0;
		var activeLabel = this.titleLabels[this.titleLabelIndex ^ 1];
		var activeLabelHeight = activeLabel.getExactOrMeasuredHeight() || lastLabelHeight;
		var activeLabelFromY = 0;
		var activeLabelToY = 0;

		switch(direction)
		{
			case ScreenNavigationDirection.Up:
				lastLabelFromY = 0;
				lastLabelToY = lastLabelHeight + 20;

				activeLabelFromY = -(activeLabelHeight + 20);
				activeLabelToY = 0;
				break;
			case ScreenNavigationDirection.Down:
				lastLabelFromY = 0;
				lastLabelToY = -(lastLabelHeight + 20);

				activeLabelFromY = activeLabelHeight + 20;
				activeLabelToY = 0;
				break;
		}

		if(!animate)
		{
			lastLabel.setAlpha(0);
			lastLabel.setY(lastLabelToY);

			activeLabel.setAlpha(1);
			activeLabel.setY(activeLabelToY);
		}
		else
		{
			var lastLabelAnimation = new BasicParallelAnimation(lastLabel, ["alpha", "y"]);
			var activeLabelAnimation = new BasicParallelAnimation(activeLabel, ["alpha", "y"]);

			// update the non-active label
			lastLabel.setY(lastLabelFromY);
			lastLabelAnimation.setDuration(Animations.ScreenNavigationTitleRotateDuration);
			lastLabelAnimation.setEasingFunction(Animations.ScreenNavigationTitleRotateEasing);
			lastLabelAnimation.setToValues([0, lastLabelToY]);
			lastLabelAnimation.play();

			// update the active label
			activeLabel.setY(activeLabelFromY);
			activeLabelAnimation.setDuration(Animations.ScreenNavigationTitleRotateDuration);
			activeLabelAnimation.setEasingFunction(Animations.ScreenNavigationTitleRotateEasing);
			activeLabelAnimation.setToValues([1, activeLabelToY]);
			activeLabelAnimation.play();
		}
	}

	onTitleLabelResized(event) {
		this.updateTitleLayout();
	}

	onNavigationBegin(event) {
		var screenIndex = (this.direction === ScreenNavigationHintDirection.Up ? this.selectedScreenIndex-1 : this.selectedScreenIndex+1);

		if((screenIndex < 0 || screenIndex >= this.navigator.screenCount) || (this.direction === ScreenNavigationHintDirection.Up && this.selectedScreen.needsProductHeader))
		{
			this.hide();
			return;
		}

		this.show();
		this.updateTitle(this.navigator.getScreenTitle(screenIndex));
		this.updateTitleRotation(event.direction, true);
	}
}

ScreenNavigationHint.ArrowUpImageUrl = "images/nav-arrow-up.png";
ScreenNavigationHint.ArrowDownImageUrl = "images/nav-arrow-down.png";

export default ScreenNavigationHint;
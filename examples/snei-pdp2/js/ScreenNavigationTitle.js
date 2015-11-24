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
import TextLabel from "./TextLabel"
import NumberBadge from "./NumberBadge"

class ScreenNavigationTitle extends Canvas {
	constructor(name, navigator) {
		super(name);

		this.navigator = navigator;
		this.leftLine = null;
		this.rightLine = null;
		this.titles = [];
		this.titleIndex = 0;
		this.showHideAnimation = null;

		this.state = {
			title: ""
		};

		this.navigator.addEventHandler(ScreenNavigationEvent.NAVIGATION_BEGIN, this.onNavigationBegin.d(this));

		this.setAlphaAffectsVisibility(true);
		this.setAlpha(0);
	}

	get selectedScreen() {
		return this.navigator.selectedScreen;
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
		var maxWidth = Application.getInstance().getSize().width;

		this.leftLine = new ShapeLine("left-line");
		this.leftLine.setX1(0);
		this.leftLine.setX2(maxWidth * 0.5);
		this.leftLine.setY1(0.5);
		this.leftLine.setY2(0.5);
		this.leftLine.setStroke(SolidColorBrush.fromColorHexWithAlpha("#ffffff", 0.2));
		this.leftLine.setStrokeThickness(1);
		this.add(this.leftLine);

		this.rightLine = new ShapeLine("right-line");
		this.rightLine.setX1(maxWidth * 0.5);
		this.rightLine.setX2(maxWidth);
		this.rightLine.setY1(0.5);
		this.rightLine.setY2(0.5);
		this.rightLine.setStroke(SolidColorBrush.fromColorHexWithAlpha("#ffffff", 0.2));
		this.rightLine.setStrokeThickness(1);
		this.add(this.rightLine);

		this.createTitleLabels();
	}

	createTitleLabels() {
		for(var i = 0; i < 2; i++)
		{
			var panel = new StackPanel("title-panel-" + i);
			panel.setOrientation(Orientation.Horizontal);
			panel.setGap(20);
			panel.setAlpha(0);
			panel.addEventHandler(Event.RESIZED, this.onTitleLabelResized.d(this));

			var lbl = new TextLabel("title-label", "x-small");
			lbl.setVerticalAlignment(VerticalAlignment.Center);
			lbl.setForeground(SolidColorBrush.white());
			panel.add(lbl);

			var badge = new NumberBadge("title-badge");
			badge.value = 0;
			badge.setVisible(false);
			badge.setIsLayoutVisible(false);
			badge.setVerticalAlignment(VerticalAlignment.Center);
			panel.add(badge);

			this.titles[i] = panel;
			this.add(panel);
		}
	}

	reset() {
		this.updateTitleLayout(false);

		this.state.title = "";
		this.titleIndex = 0;
	}

	updateTitle(newTitle, newProductCount) {
		var activeLabel = this.titles[this.titleIndex].getAt(0);
		var activeBadge = this.titles[this.titleIndex].getAt(1);
		var needsUpdate = (activeLabel.getText() === newTitle);

		activeLabel.setText(newTitle);
		activeBadge.value = newProductCount;
		activeBadge.setVisible(newProductCount !== 0);
		activeBadge.setIsLayoutVisible(newProductCount !== 0);

		this.titleIndex ^= 1;
		this.state.title = newTitle;

		// we only update the layout when the active label and title have not changed
		// since this will not trigger a resize event and if they have changed it will
		// trigger a resize event which will perform the layout update so we do not
		// want to do this twice
		if(needsUpdate)
			this.updateTitleLayout(true);
	}

	updateTitleLayout(animate) {
		animate = ValueOrDefault(animate, true);

		var lastPanel = this.titles[this.titleIndex];
		var lastPanelWidth = lastPanel.getExactOrMeasuredWidth();
		var activePanel = this.titles[this.titleIndex ^ 1];
		var activePanelWidth = activePanel.getExactOrMeasuredWidth();
		var maxWidth = Application.getInstance().getSize().width;
		var lineWidth = Math.floor((maxWidth - (activePanelWidth + (ScreenNavigationTitle.TitleMargin * 2))) * 0.5);
		var lineY = activePanel.getExactOrMeasuredHeight() * 0.5;

		// adjust the left and right lines to take up remaining space
		this.leftLine.setY(lineY);
		this.leftLine.setX1(0);

		this.rightLine.setY(lineY);
		this.rightLine.setX2(maxWidth);

		if(!animate)
		{
			this.leftLine.setX2((maxWidth * 0.5) - 200);
			this.rightLine.setX1(maxWidth - ((maxWidth * 0.5) - 200));
		}
		else
		{
			var lineAnimation = new BasicAnimation(this.leftLine, "x2", null, lineWidth);
			lineAnimation.setDuration(Animations.ScreenNavigationTitleLineDuration);
			lineAnimation.setEasingFunction(Animations.ScreenNavigationTitleLineEasing);
			lineAnimation.play();

			lineAnimation = new BasicAnimation(this.rightLine, "x1", null, maxWidth - lineWidth);
			lineAnimation.setDuration(Animations.ScreenNavigationTitleLineDuration);
			lineAnimation.setEasingFunction(Animations.ScreenNavigationTitleLineEasing);
			lineAnimation.play();
		}

		// update the non-active label
		lastPanel.setX((maxWidth - lastPanelWidth) * 0.5);

		// update the active label
		activePanel.setX((maxWidth - activePanelWidth) * 0.5);
	}

	updateTitleRotation(direction, animate) {
		var lastPanel = this.titles[this.titleIndex];
		var lastPanelHeight = lastPanel.getExactOrMeasuredHeight();
		var lastPanelFromY = 0;
		var lastPanelToY = 0;
		var activePanel = this.titles[this.titleIndex ^ 1];
		var activePanelHeight = activePanel.getExactOrMeasuredHeight() || lastPanelHeight;
		var activePanelFromY = 0;
		var activePanelToY = 0;

		switch(direction)
		{
			case ScreenNavigationDirection.Up:
				lastPanelFromY = 0;
				lastPanelToY = lastPanelHeight + 20;

				activePanelFromY = -(activePanelHeight + 20);
				activePanelToY = 0;
				break;
			case ScreenNavigationDirection.Down:
				lastPanelFromY = 0;
				lastPanelToY = -(lastPanelHeight + 20);

				activePanelFromY = activePanelHeight + 20;
				activePanelToY = 0;
				break;
		}

		if(!animate)
		{
			lastPanel.setAlpha(0);
			lastPanel.setY(lastPanelToY);

			activePanel.setAlpha(1);
			activePanel.setY(activePanelToY);
		}
		else
		{
			var lastPanelAnimation = new BasicParallelAnimation(lastPanel, ["alpha", "y"]);
			var activePanelAnimation = new BasicParallelAnimation(activePanel, ["alpha", "y"]);

			// update the non-active label
			lastPanel.setY(lastPanelFromY);
			lastPanelAnimation.setDuration(Animations.ScreenNavigationTitleRotateDuration);
			lastPanelAnimation.setEasingFunction(Animations.ScreenNavigationTitleRotateEasing);
			lastPanelAnimation.setToValues([0, lastPanelToY]);
			lastPanelAnimation.play();

			// update the active label
			activePanel.setY(activePanelFromY);
			activePanelAnimation.setDuration(Animations.ScreenNavigationTitleRotateDuration);
			activePanelAnimation.setEasingFunction(Animations.ScreenNavigationTitleRotateEasing);
			activePanelAnimation.setToValues([1, activePanelToY]);
			activePanelAnimation.play();
		}
	}

	onTitleLabelResized(event) {
		this.updateTitleLayout(true);
	}

	onNavigationBegin(event) {
		var animate = (this.state.title.length !== 0);

		if(!this.selectedScreen.needsProductHeader)
			return;

		this.updateTitle(this.selectedScreen.title, this.selectedScreen.productCount);
		this.updateTitleRotation(event.direction, animate);
	}
}

ScreenNavigationTitle.TitleMargin = 20;

export default ScreenNavigationTitle;
import Application from "../../../src/Application"
import Event from "../../../src/Event"
import Canvas from "../../../src/ui/Canvas"
import StackPanel from "../../../src/ui/StackPanel"
import ContentControl from "../../../src/ui/ContentControl"
import CornerRadius from "../../../src/ui/CornerRadius"
import Border from "../../../src/ui/Border"
import Image from "../../../src/ui/Image"
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
import BasicAnimation from "../../../src/animation/BasicAnimation"
import ExpoEase from "../../../src/animation/ExpoEase"
import EasingMode from "../../../src/animation/EasingMode"
import AnimationEvent from "../../../src/animation/AnimationEvent"

import Animations from "./Animations"
import ButtonType from "./ButtonType"

class Button extends Canvas {
	constructor(name) {
		super(name);

		this.contentContainer = null;
		this.contentBorder = null;
		this.focusRing = null;
		this.focusAnimation = null;

		this.state = {
			buttonType: ButtonType.Light,
			buttonTypeChanged: false
		};

		this.setHeight(70);
		this.setIsNavigationFocusEnabled(true);
		this.addEventHandler(Event.FOCUS_IN, this.onFocusIn.d(this));
		this.addEventHandler(Event.FOCUS_OUT, this.onFocusOut.d(this));
	}

	get buttonType() {
		return this.state.buttonType;
	}

	set buttonType(value) {
		if(this.state.buttonType !== value)
		{
			this.state.buttonType = value;
			this.state.buttonTypeChanged = true;

			this.invalidateProperties();
		}
	}

	get content() {
		return this.contentContainer.getChild();
	}

	set content(value) {
		this.contentContainer.setChild(value);
	}

	createChildren() {
		this.contentBorder = new Border("container");
		this.contentBorder.setVerticalAlignment(VerticalAlignment.Center);
		this.contentBorder.setPercentHeight(100);
		this.add(this.contentBorder);

		this.contentContainer = new ContentControl("content");
		this.contentContainer.setMargin(0, 32);
		this.contentContainer.setVerticalAlignment(VerticalAlignment.Center);
		this.contentBorder.setChild(this.contentContainer);

		this.focusRing = new ShapeRectangle("focus");
		this.focusRing.setStroke(SolidColorBrush.white());
		this.focusRing.setStrokeThickness(3);
		this.focusRing.setAlpha(0);
		this.focusRing.setPercentWidth(100);
		this.focusRing.setPercentHeight(100);
		this.add(this.focusRing);

		this.updateStyle();
	}

	commitProperties() {
		super.commitProperties();

		if(this.state.buttonTypeChanged)
		{
			this.state.buttonTypeChanged = false;
			this.updateStyle();
		}
	}

	updateStyle() {
		this.contentBorder.setBorderThickness(1);

		if(this.buttonType === ButtonType.Light)
		{
			this.contentBorder.setBackground(SolidColorBrush.fromColorHexWithAlpha("#ffffff", 0.05));
			this.contentBorder.setBorderBrush(SolidColorBrush.fromColorHexWithAlpha("#ffffff", 0.4));
		}
		else
		{
			this.contentBorder.setBackground(SolidColorBrush.fromColorHexWithAlpha("#000000", 0.05));
			this.contentBorder.setBorderBrush(SolidColorBrush.fromColorHexWithAlpha("#ffffff", 0.4));
		}
	}

	toggleFocus(focusOn) {
		if(!this.focusAnimation)
		{
			this.focusAnimation = new BasicAnimation(this.focusRing, "alpha", null);
			this.focusAnimation.setDuration(Animations.ButtonFocusDuration);
			this.focusAnimation.setEasingFunction(Animations.ButtonFocusEasing);
		}

		this.focusAnimation.end();
		this.focusAnimation.setToValue(focusOn ? 1 : 0);
		this.focusAnimation.play();
	}

	onFocusIn(event) {
		this.toggleFocus(true);
	}

	onFocusOut(event) {
		this.toggleFocus(false);
	}
}

export default Button;
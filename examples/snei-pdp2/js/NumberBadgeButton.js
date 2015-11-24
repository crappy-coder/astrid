import Application from "../../../src/Application"
import Event from "../../../src/Event"
import Key from "../../../src/input/Key"
import KeyEvent from "../../../src/input/KeyEvent"
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
import NumberBadge from "./NumberBadge"
import Button from "./Button"
import ButtonType from "./ButtonType"
import TextLabel from "./TextLabel"

class NumberBadgeButton extends Button {
	constructor(name) {
		super(name);

		this.textLabel = null;
		this.badge = null;

		this.state = {
			text: "",
			textChanged: false,
			value: 0,
			valueChanged: false
		};
	}

	get text() {
		return this.state.text;
	}

	set text(value) {
		if(this.state.text !== value)
		{
			this.state.text = value;
			this.state.textChanged = true;

			this.invalidateProperties();
			this.requestLayout();
		}
	}

	get value() {
		return this.state.value;
	}

	set value(value) {
		if(this.state.value !== value)
		{
			this.state.value = value;
			this.state.valueChanged = true;

			this.invalidateProperties();
			this.requestLayout();
		}
	}

	createChildren() {
		super.createChildren();

		var panel = new StackPanel("panel");
		panel.setOrientation(Orientation.Horizontal);
		panel.setGap(20);

		this.textLabel = new TextLabel("text-label", "x-small");
		this.textLabel.setVerticalAlignment(VerticalAlignment.Center);
		this.textLabel.setForeground(SolidColorBrush.white());
		panel.add(this.textLabel);

		this.badge = new NumberBadge("badge");
		this.badge.value = this.value;
		panel.add(this.badge);

		this.content = panel;
	}

	commitProperties() {
		super.commitProperties();

		if(this.state.textChanged)
		{
			this.state.textChanged = false;
			this.textLabel.setText(this.text);
		}

		if(this.state.valueChanged)
		{
			this.state.valueChanged = false;
			this.badge.value = this.value;
		}
	}
}

export default NumberBadgeButton;
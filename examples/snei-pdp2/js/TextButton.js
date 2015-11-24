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
import Button from "./Button"
import ButtonType from "./ButtonType"
import TextLabel from "./TextLabel"

class TextButton extends Button {
	constructor(name) {
		super(name);

		this.lbl = null;

		this.state = {
			text: "",
			textChanged: false
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

	get textLabel() {
		return this.lbl;
	}

	createChildren() {
		super.createChildren();

		this.lbl = new TextLabel("lbl", "x-small");
		this.lbl.setVerticalAlignment(VerticalAlignment.Center);
		this.lbl.setForeground(SolidColorBrush.white());

		this.content = this.lbl;
	}

	commitProperties() {
		super.commitProperties();

		if(this.state.textChanged)
		{
			this.state.textChanged = false;
			this.lbl.setText(this.text);
		}
	}
}

export default TextButton;
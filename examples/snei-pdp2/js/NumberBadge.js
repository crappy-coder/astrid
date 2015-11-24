import Application from "../../../src/Application"
import Event from "../../../src/Event"
import Key from "../../../src/input/Key"
import KeyEvent from "../../../src/input/KeyEvent"
import Canvas from "../../../src/ui/Canvas"
import StackPanel from "../../../src/ui/StackPanel"
import ContentControl from "../../../src/ui/ContentControl"
import CornerRadius from "../../../src/ui/CornerRadius"
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
import BasicAnimation from "../../../src/animation/BasicAnimation"
import ExpoEase from "../../../src/animation/ExpoEase"
import EasingMode from "../../../src/animation/EasingMode"
import AnimationEvent from "../../../src/animation/AnimationEvent"
import TextLabel from "./TextLabel"

class NumberBadge extends Border {
	constructor(name) {
		super(name);

		this.valueLabel = null;

		this.state = {
			value: 0,
			valueChanged: false
		}

		this.setCornerRadius(CornerRadius.fromUniform(6));
		this.setBackground(SolidColorBrush.fromColorHexWithAlpha("#ffffff", 0.10));
		this.setHeight(28);
	}

	get value() {
		return this.state.value;
	}

	set value(value) {
		if(this.state.value !== value)
		{
			this.state.value = value || 0;
			this.state.valueChanged = true;

			this.invalidateProperties();
		}
	}

	createChildren() {
		this.valueLabel = new TextLabel("value-label", "tiny");
		this.valueLabel.setVerticalAlignment(VerticalAlignment.Center);
		this.valueLabel.setHorizontalAlignment(HorizontalAlignment.Center);
		this.valueLabel.setMargin(0, 20);
		this.valueLabel.setForeground(SolidColorBrush.white());
		this.setChild(this.valueLabel);
	}

	commitProperties() {
		super.commitProperties();

		if(this.state.valueChanged)
		{
			this.state.valueChanged = false;
			this.valueLabel.setText(this.value.toString());
		}
	}
}

export default NumberBadge;
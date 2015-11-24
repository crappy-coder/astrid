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
import MetadataBadgeType from "./MetadataBadgeType"
import TextLabel from "./TextLabel"

class MetadataBadge extends Border {
	constructor(name, type) {
		super(name);

		this.titleLabel = null;

		this.state = {
			type: null,
			title: "",
			titleChanged: false
		}

		this.setCornerRadius(CornerRadius.fromUniform(4));
		this.setBorderThickness(2);

		this.type = type;
	}

	get type() {
		return this.state.type;
	}

	set type(value) {
		if(this.state.type !== value)
		{
			this.state.type = value;
			this.setBorderBrush(SolidColorBrush.fromColor(MetadataBadge.BorderColors[this.state.type]));
		}
	}

	get title() {
		return this.state.title;
	}

	set title(value) {
		if(this.state.title !== value)
		{
			this.state.title = value;
			this.state.titleChanged = true;

			this.invalidateProperties();
		}
	}

	createChildren() {
		this.titleLabel = new TextLabel("title-label", "tiny");
		this.titleLabel.setVerticalAlignment(VerticalAlignment.Center);
		this.titleLabel.setHorizontalAlignment(HorizontalAlignment.Center);
		this.titleLabel.setMargin(0, 20);
		this.titleLabel.setForeground(SolidColorBrush.white());
		this.setChild(this.titleLabel);
	}

	commitProperties() {
		super.commitProperties();

		if(this.state.titleChanged)
		{
			this.state.titleChanged = false;
			this.titleLabel.setText(this.title);
		}
	}

	static get BorderColors() {
		if(!MetadataBadge.BorderColorValues)
		{
			MetadataBadge.BorderColorValues = [];
			MetadataBadge.BorderColorValues[MetadataBadgeType.Normal] = Color.fromHexWithAlpha("#ffffff", 0.4);
			MetadataBadge.BorderColorValues[MetadataBadgeType.Sale] = Color.fromHexWithAlpha("#44aced", 0.7);
			MetadataBadge.BorderColorValues[MetadataBadgeType.PSPlus] = Color.fromHexWithAlpha("#ffcc00", 0.7);
		}

		return MetadataBadge.BorderColorValues;
	}
}

MetadataBadge.BorderColorValues = null;

export default MetadataBadge;
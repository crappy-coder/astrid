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

class PriceButton extends Button {
	constructor(name) {
		super(name);

		this.textLabel = null;
		this.priceLabel = null;

		this.state = {
			text: "",
			textChanged: false,
			price: 0,
			priceChanged: false
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

	get price() {
		return this.state.price;
	}

	set price(value) {
		if(this.state.price !== value)
		{
			this.state.price = value;
			this.state.priceChanged = true;

			this.invalidateProperties();
			this.requestLayout();
		}
	}

	createChildren() {
		super.createChildren();

		var panel = new StackPanel("panel");
		panel.setOrientation(Orientation.Horizontal);
		panel.setGap(40);

		this.textLabel = new TextLabel("text-label", "x-small");
		this.textLabel.setVerticalAlignment(VerticalAlignment.Center);
		this.textLabel.setForeground(SolidColorBrush.white());
		panel.add(this.textLabel);

		this.priceLabel = new TextLabel("price-label", "x-small-medium");
		this.priceLabel.setVerticalAlignment(VerticalAlignment.Center);
		this.priceLabel.setForeground(SolidColorBrush.white());
		panel.add(this.priceLabel);

		this.content = panel;
	}

	commitProperties() {
		super.commitProperties();

		if(this.state.textChanged)
		{
			this.state.textChanged = false;

			this.textLabel.setText(this.text);
		}

		if(this.state.priceChanged)
		{
			this.state.priceChanged = false;
			this.priceLabel.setText(this.formatPrice());
		}
	}

	formatPrice() {
		var n = this.price;
		var s = n < 0 ? "-" : "";
		var i = parseInt(n = Math.abs(+n || 0).toFixed(2)) + "";
		var j = (j = i.length) > 3 ? j % 3 : 0;

		return "$" + s + (j ? i.substr(0, j) + "," : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + ",") + "." + Math.abs(n - i).toFixed(2).slice(2);
	}
}

export default PriceButton;
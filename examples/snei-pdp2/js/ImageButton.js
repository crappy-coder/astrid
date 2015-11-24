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

class ImageButton extends Button {
	constructor(name) {
		super(name);

		this.container = null;
		this.image = null;
		this.focusedImage = null;

		this.state = {
			imageUrl: "",
			imageUrlChanged: false,
			focusedImageUrl: "",
			focusedImageUrlChanged: false
		};
	}

	get imageUrl() {
		return this.state.imageUrl;
	}

	set imageUrl(value) {
		if(this.state.imageUrl !== value)
		{
			this.state.imageUrl = value;
			this.state.imageUrlChanged = true;

			this.invalidateProperties();
			this.requestLayout();
		}
	}

	get focusedImageUrl() {
		return this.state.focusedImageUrl;
	}

	set focusedImageUrl(value) {
		if(this.state.focusedImageUrl !== value)
		{
			this.state.focusedImageUrl = value;
			this.state.focusedImageUrlChanged = true;

			this.invalidateProperties();
			this.requestLayout();
		}
	}

	createChildren() {
		super.createChildren();

		this.container = new Canvas("container");
		this.container.setVerticalAlignment(VerticalAlignment.Center);
		this.container.setHorizontalAlignment(HorizontalAlignment.Center);

		this.image = new Image("image");
		this.container.add(this.image);

		this.focusedImage = new Image("focused-image");
		this.focusedImage.setVisible(false);
		this.container.add(this.focusedImage);

		this.contentContainer.setMargin(0, 20);
		this.content = this.container;
	}

	commitProperties() {
		super.commitProperties();

		if(this.state.imageUrlChanged)
		{
			this.state.imageUrlChanged = false;
			this.image.setSource(TextureSource.fromFile(this.imageUrl));
		}

		if(this.state.focusedImageUrlChanged)
		{
			this.state.focusedImageUrlChanged = false;
			this.focusedImage.setSource(TextureSource.fromFile(this.focusedImageUrl));
		}
	}
}

export default ImageButton;
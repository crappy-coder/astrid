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
import MetadataBadgeType from "./MetadataBadgeType"

class StarRatings extends StackPanel {
	constructor(name) {
		super(name);

		this.state = {
			ratingValue: 0,
			ratingValueChanged: false
		}

		this.setOrientation(Orientation.Horizontal);
		this.setGap(4);
	}

	get ratingValue() {
		return this.state.ratingValue;
	}

	set ratingValue(value) {
		if(this.state.ratingValue !== value)
		{
			this.state.ratingValue = value;
			this.state.ratingValueChanged = true;

			this.invalidateProperties();
			this.requestLayout();
			this.requestMeasure();
		}
	}

	createChildren() {
		for(var i = 0; i < 5; i++)
		{
			var starUrl = (i < this.ratingValue ? "images/star-rating-full.png" : "images/star-rating-none.png");
			var star = Image.create("star-" + i, starUrl);
			star.setWidth(27);
			star.setHeight(25);

			this.add(star);
		}
	}

	commitProperties() {
		super.commitProperties();

		if(this.state.ratingValueChanged)
		{
			this.state.ratingValueChanged = false;

			for(var i = 0; i < 5; i++)
			{
				var starUrl = (i < this.ratingValue ? "images/star-rating-full.png" : "images/star-rating-none.png");
				var star = this.getAt(i);

				star.setSource(TextureSource.fromFile(starUrl));
			}
		}
	}
}

export default StarRatings;
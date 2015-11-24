import Application from "../../../src/Application"
import Event from "../../../src/Event"
import Canvas from "../../../src/ui/Canvas"
import StackPanel from "../../../src/ui/StackPanel"
import ContentControl from "../../../src/ui/ContentControl"
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
import Screen from "./Screen"
import ScreenType from "./ScreenType"
import TextLabel from "./TextLabel"
import BaseListScreen from "./BaseListScreen"
import ProductList from "./ProductList"
import ProductListInfoPanel from "./ProductListInfoPanel"
import MockProducts from "./MockProducts"
import MockProductType from "./MockProductType"
import ListEvent from "./ListEvent"

class BundleScreen extends BaseListScreen {
	constructor(name, navigator) {
		super(name, "Bundles", ScreenType.Bundle, navigator);
	}

	loadData() {
		this.data = MockProducts.Bundles;
	}
}

export default BundleScreen;
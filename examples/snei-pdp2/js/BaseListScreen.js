import Application from "../../../src/Application"
import Event from "../../../src/Event"
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
import BasicAnimation from "../../../src/animation/BasicAnimation"
import ExpoEase from "../../../src/animation/ExpoEase"
import EasingMode from "../../../src/animation/EasingMode"
import AnimationEvent from "../../../src/animation/AnimationEvent"
import NavigationMode from "../../../src/input/NavigationMode"
import NavigationEvent from "../../../src/input/NavigationEvent"
import NavigationDirection from "../../../src/input/NavigationDirection"

import Animations from "./Animations"
import Screen from "./Screen"
import ScreenType from "./ScreenType"
import TextLabel from "./TextLabel"
import ProductList from "./ProductList"
import ProductListInfoPanel from "./ProductListInfoPanel"
import MockProducts from "./MockProducts"
import MockProductType from "./MockProductType"
import ListEvent from "./ListEvent"

class BaseListScreen extends Screen {
	constructor(name, title, type, navigator) {
		super(name, title, type, navigator);

		this.content = null;
		this.productList = null;
		this.productListInfoPanels = [];

		this.state.data = null;
		this.state.dataChanged = false;

		this.addEventHandler(Event.FOCUS_IN, this.onFocusIn.d(this));
	}

	get data() {
		return this.state.data;
	}

	set data(value) {
		this.state.data = value;
		this.state.dataChanged = true;
		this.productCount = (value ? value.length : 0);

		this.invalidateProperties();
	}

	createChildren() {
		super.createChildren();

		this.content = new Canvas("content");
		this.setChild(this.content);

		this.createProductList();
		this.createProductListInfoPanels();

		this.loadData();
	}

	commitProperties() {
		super.commitProperties();

		if(this.state.dataChanged)
		{
			this.state.dataChanged = false;
			this.productList.dataItems = this.data;
			this.productList.selectedItemIndex = 0;
		}
	}

	loadData() { /* override */ }

	createProductList() {
		this.productList = new ProductList("product-list");
		this.productList.setX(140);
		this.productList.setY(245);
		this.productList.addEventHandler(ListEvent.SELECTED_INDEX_CHANGED, this.onProductListSelectedIndexChanged.d(this));
		this.content.add(this.productList);
	}

	createProductListInfoPanels() {
		for(var i = 0; i < 2; i++)
		{
			var infoPanel = new ProductListInfoPanel("product-info-panel-" + i);
			infoPanel.setX(840);
			infoPanel.setY(620);
			infoPanel.hide(true);

			this.productListInfoPanels[i] = infoPanel;
			this.content.add(infoPanel);
		}
	}

	onProductListSelectedIndexChanged(event) {
		void(event);

		var productIndex = this.productList.selectedItemIndex
		var infoIndexA = (productIndex % 2);
		var infoIndexB = (infoIndexA ^ 1);

		this.productListInfoPanels[infoIndexA].dataItem = this.productList.selectedItem;
		this.productListInfoPanels[infoIndexA].show();
		this.productListInfoPanels[infoIndexB].hide();
	}

	onFocusIn(event) {
		this.productList.focus();
	}
}

export default BaseListScreen;
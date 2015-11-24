import Application from "../../../src/Application"
import Event from "../../../src/Event"
import Key from "../../../src/input/Key"
import KeyEvent from "../../../src/input/KeyEvent"
import Size from "../../../src/Size"
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
import ParallelAnimation from "../../../src/animation/ParallelAnimation"
import BasicAnimation from "../../../src/animation/BasicAnimation"
import BasicParallelAnimation from "../../../src/animation/BasicParallelAnimation"
import ExpoEase from "../../../src/animation/ExpoEase"
import EasingMode from "../../../src/animation/EasingMode"
import AnimationEvent from "../../../src/animation/AnimationEvent"
import GamepadButtons from "../../../src/input/GamepadButtons"
import GamepadButtonEvent from "../../../src/input/GamepadButtonEvent"

import Animations from "./Animations"
import TextLabel from "./TextLabel"
import ListEvent from "./ListEvent"

class ProductList extends Canvas {
	constructor(name) {
		super(name);

		this.list = null;

		this.state = {
			selectedItemIndex: -1,
			selectedItemIndexChanged: false,
			dataItems: [],
			dataItemsChanged: false
		};

		this.addEventHandler(KeyEvent.KEY_DOWN, this.onKeyDown.d(this));
		this.addEventHandler(GamepadButtonEvent.DOWN, this.onGamepadButtonDown.d(this));
		this.addEventHandler(Event.FOCUS_IN, this.onFocusIn.d(this));
		this.addEventHandler(Event.FOCUS_OUT, this.onFocusOut.d(this));
	}

	get dataItems() {
		return this.state.dataItems;
	}

	set dataItems(value) {
		this.state.dataItems = value || [];
		this.state.dataItemsChanged = true;

		this.invalidateProperties();
		this.requestLayout();
	}

	get selectedItem() {
		if(this.state.selectedItemIndex >= 0 && this.state.selectedItemIndex < this.dataItems.length)
			return this.dataItems[this.state.selectedItemIndex];

		return null;
	}

	get selectedItemIndex() {
		return this.state.selectedItemIndex;
	}

	set selectedItemIndex(value) {
		this.scrollTo(value);
	}

	createChildren() {
		this.list = new Canvas("list");

		this.add(this.list);
	}

	commitProperties() {
		super.commitProperties();

		if(this.state.dataItemsChanged)
		{
			this.state.dataItemsChanged = false;
			this.generateItems();
		}
	}

	generateItems() {
		var itemX = 0;

		this.list.setX(0);
		this.list.clear();

		for(var i = 0; i < this.state.dataItems.length; ++i)
		{
			var item = this.createListItem(i);
			itemX = this.arrangeItem(item, i, itemX, false);

			this.list.add(item);
		}
	}

	arrangeItems(animate) {
		var itemX = 0;

		for(var i = 0; i < this.list.getCount(); ++i)
		{
			itemX = this.arrangeItem(this.list.getAt(i), i, itemX, animate);
		}
	}

	arrangeItem(item, itemIndex, lastItemX, animate) {
		var itemFocusIndicator = item.getAt(1);
		var itemSelected = (itemIndex === this.selectedItemIndex && this.getIsFocused());
		var itemSize = ProductList.ItemSize[itemSelected ? "Focused" : "Normal"];
		var itemX = lastItemX;
		var itemY = 0;

		if(itemSelected)
			itemX += ProductList.ItemSpacing;

		if(!animate)
		{
			itemFocusIndicator.setX(-ProductList.ItemSpacing / (itemSelected ? 1 : 2));
			itemFocusIndicator.setY(-ProductList.ItemSpacing / (itemSelected ? 1 : 2));
			itemFocusIndicator.setWidth(itemSize.width + ((ProductList.ItemSpacing / (itemSelected ? 1 : 2)) * 2));
			itemFocusIndicator.setHeight(itemSize.height + ((ProductList.ItemSpacing / (itemSelected ? 1 : 2)) * 2));

			item.setX(itemX);
			item.setY(itemY);
			item.setWidth(itemSize.width);
			item.setHeight(itemSize.height);
		}
		else
		{
			// animate item
			var values = [itemX, itemY, itemSize.width, itemSize.height];
			var animation = new BasicParallelAnimation(item, ["x", "y", "width", "height"], null, values);
			animation.setDuration(Animations.MediaListNavigationDuration);
			animation.setEasingFunction(Animations.MediaListNavigationEasing);
			animation.play();

			// animate focus indicator
			values = [
			-ProductList.ItemSpacing / (itemSelected ? 1 : 2),
			-ProductList.ItemSpacing / (itemSelected ? 1 : 2),
			itemSize.width + ((ProductList.ItemSpacing / (itemSelected ? 1 : 2)) * 2),
			itemSize.height + ((ProductList.ItemSpacing / (itemSelected ? 1 : 2)) * 2)];

			animation = new BasicParallelAnimation(itemFocusIndicator, ["x", "y", "width", "height"], null, values);
			animation.setDuration(Animations.MediaListNavigationDuration);
			animation.setEasingFunction(Animations.MediaListNavigationEasing);
			animation.play();

			animation = new BasicAnimation(itemFocusIndicator, "alpha", null, itemSelected ? 1 : 0);
			animation.setDuration(Animations.MediaListNavigationFocusDuration);
			animation.setEasingFunction(Animations.MediaListNavigationFocusEasing);
			animation.play();
		}

		itemX += itemSize.width + ProductList.ItemSpacing * (itemSelected ? 2 : 1);

		return itemX;
	}

	scrollLeft() {
		this.selectedItemIndex--;
	}

	scrollRight() {
		this.selectedItemIndex++;
	}

	scrollFirst() {
		this.selectedItemIndex = 0;
	}

	scrollLast() {
		this.selectedItemIndex = this.dataItems.length-1;
	}

	scrollTo(itemIndex) {
		if(this.selectedItemIndex === itemIndex)
			return;

		if(itemIndex < 0 || itemIndex >= this.dataItems.length)
			return;

		var lastItemIndex = this.selectedItemIndex;

		this.state.selectedItemIndex = itemIndex;
		this.state.selectedItemIndexChanged = true;

		this.dispatchEvent(new ListEvent(ListEvent.SELECTED_INDEX_CHANGED, lastItemIndex, itemIndex));

		this.invalidateProperties();
		this.requestLayout();

		this.scrollImpl(lastItemIndex);
	}

	scrollImpl(fromIndex) {
		if(!this.list)
			return;

		var listItemFrom = (fromIndex !== -1 ? this.list.getAt(fromIndex) : null);
		var listItemTo = this.list.getAt(this.selectedItemIndex);
		var scrollX = Math.min(0, -(this.selectedItemIndex * (ProductList.ItemSize.Normal.width + ProductList.ItemSpacing)) - ProductList.ItemSpacing);
		var scrollAnimation = new BasicAnimation(this.list, "x", null, scrollX);

		this.arrangeItems(true);

		scrollAnimation.setDuration(Animations.ProductListNavigationDuration);
		scrollAnimation.setEasingFunction(Animations.ProductListNavigationEasing);
		scrollAnimation.play();
	}

	createListItem(dataItemIndex) {
		var dataItem = this.state.dataItems[dataItemIndex];
		var dataItemIsSelected = (dataItemIndex === this.selectedItemIndex);

		var listItem = new Canvas("item-" + dataItemIndex);
		listItem.setWidth(ProductList.ItemSize[dataItemIsSelected ? "Focused" : "Normal"].width);
		listItem.setHeight(ProductList.ItemSize[dataItemIsSelected ? "Focused" : "Normal"].height);

		var listItemImage = Image.create("image", dataItem.imageUrl);
		listItemImage.setKeepAspectRatio(false);
		listItemImage.setPercentWidth(100);
		listItemImage.setPercentHeight(100);
		listItem.add(listItemImage);

		var focusIndicator = new ShapeRectangle("item-focus-indicator");
		focusIndicator.setX(-ProductList.ItemSpacing / (dataItemIsSelected ? 1 : 2));
		focusIndicator.setY(-ProductList.ItemSpacing / (dataItemIsSelected ? 1 : 2));
		focusIndicator.setWidth(ProductList.ItemSize[dataItemIsSelected ? "Focused" : "Normal"].width + ((ProductList.ItemSpacing / (dataItemIsSelected ? 1 : 2)) * 2));
		focusIndicator.setHeight(ProductList.ItemSize[dataItemIsSelected ? "Focused" : "Normal"].height + ((ProductList.ItemSpacing  / (dataItemIsSelected ? 1 : 2)) * 2));
		focusIndicator.setAlpha(0);
		focusIndicator.setAlphaAffectsVisibility(true);
		focusIndicator.setStroke(SolidColorBrush.white());
		focusIndicator.setStrokeThickness(3);
		listItem.add(focusIndicator);

		return listItem;
	}

	onFocusIn(event) {
		this.arrangeItems(true);
	}

	onFocusOut(event) {
		this.arrangeItems(true);
	}

	onKeyDown(event) {
		switch(event.getKey())
		{
			case Key.Left:
				this.selectedItemIndex--;
				break;
			case Key.Right:
				this.selectedItemIndex++;
				break;
			case Key.Enter:
				break;
		}
	}

	onGamepadButtonDown(event) {
		switch(event.getButton())
		{
			case GamepadButtons.DPadLeft:
			case GamepadButtons.LeftStickLeft:
				this.selectedItemIndex--;
				break;
			case GamepadButtons.DPadRight:
			case GamepadButtons.LeftStickRight:
				this.selectedItemIndex++;
				break;
			case GamepadButtons.A:
				break;
		}
	}
}

ProductList.ItemSpacing = 10;

ProductList.ItemSize = {
	"Normal": new Size(290, 290),
	"Focused": new Size(640, 640)
};

export default ProductList;
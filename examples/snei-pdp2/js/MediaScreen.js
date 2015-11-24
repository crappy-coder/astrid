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
import ScaleTransform from "../../../src/transforms/ScaleTransform"
import ShapeRectangle from "../../../src/shapes/ShapeRectangle"
import ShapeLine from "../../../src/shapes/ShapeLine"
import Vector2D from "../../../src/Vector2D"
import SolidColorBrush from "../../../src/brushes/SolidColorBrush"
import LinearGradientBrush from "../../../src/brushes/LinearGradientBrush"
import ImageBrush from "../../../src/brushes/ImageBrush"
import VideoBrush from "../../../src/brushes/VideoBrush"
import BasicAnimation from "../../../src/animation/BasicAnimation"
import ColorAnimation from "../../../src/animation/ColorAnimation"
import BasicParallelAnimation from "../../../src/animation/BasicParallelAnimation"
import ExpoEase from "../../../src/animation/ExpoEase"
import EasingMode from "../../../src/animation/EasingMode"
import AnimationEvent from "../../../src/animation/AnimationEvent"
import NavigationMode from "../../../src/input/NavigationMode"
import NavigationEvent from "../../../src/input/NavigationEvent"
import NavigationDirection from "../../../src/input/NavigationDirection"
import GamepadButtons from "../../../src/input/GamepadButtons"
import GamepadButtonEvent from "../../../src/input/GamepadButtonEvent"

import Animations from "./Animations"
import Screen from "./Screen"
import ScreenType from "./ScreenType"
import TextLabel from "./TextLabel"
import MediaList from "./MediaList"
import ListEvent from "./ListEvent"

class MediaScreen extends Screen {
	constructor(name, navigator) {
		super(name, "Media", ScreenType.Media, navigator);

		this.needsProductHeader = false;

		this.contentContainer = null;
		this.backgroundContainer = null;
		this.contentPanel = null;
		this.navigationPanel = null;
		this.navigationLeft = null;
		this.navigationRight = null;
		this.tabPanel = null;
		this.tabContent = [];
		this.listContainer = null;

		this.isFullscreen = false;
		this.state.selectedTabIndex = 0;
		this.state.selectedTabIndexChanged = false;

		this.setPercentHeight(100);
		this.addEventHandler(Event.FOCUS_IN, this.onFocusIn.d(this));
	}

	get selectedTabIndex() {
		return this.state.selectedTabIndex;
	}

	set selectedTabIndex(value) {
		if(this.state.selectedTabIndex !== value)
		{
			if(value < 0 || value >= this.tabPanel.getCount())
				return;

			this.state.selectedTabIndex = value;
			this.state.selectedTabIndexChanged = true;

			this.invalidateProperties();
		}
	}

	createChildren() {
		super.createChildren();

		this.contentContainer = new Canvas("container");
		this.contentContainer.setPercentWidth(100);
		this.contentContainer.setPercentHeight(100);
		this.setChild(this.contentContainer);

		this.backgroundContainer = new Canvas("background");
		this.backgroundContainer.setPercentWidth(100);
		this.backgroundContainer.setPercentHeight(100);
		this.backgroundContainer.setAlphaAffectsVisibility(true);
		this.backgroundContainer.setAlpha(0);
		this.backgroundContainer.setRenderTransform(new ScaleTransform(1, 1));
		this.contentContainer.add(this.backgroundContainer);

		var navigationContainer = new ContentControl("navigation-panel-container");
		navigationContainer.setPercentWidth(100);
		navigationContainer.setPercentHeight(100);
		this.contentContainer.add(navigationContainer);

		this.navigationPanel = new DockPanel("navigation-panel");
		this.navigationPanel.setFillLastChild(false);
		this.navigationPanel.setPercentWidth(100);
		this.navigationPanel.setVerticalAlignment(VerticalAlignment.Center);
		this.navigationPanel.setMargin(0, 96);
		this.navigationPanel.setAlpha(0);
		navigationContainer.setChild(this.navigationPanel);

		this.navigationLeft = Image.create("nav-arrow-left", "images/media-nav-arrow-left.png");
		this.navigationLeft.setDock(Dock.Left);
		this.navigationPanel.add(this.navigationLeft);

		this.navigationRight = Image.create("nav-arrow-right", "images/media-nav-arrow-right.png");
		this.navigationRight.setDock(Dock.Right);
		this.navigationPanel.add(this.navigationRight);

		var contentContainer = new ContentControl("content-container");
		contentContainer.setPercentWidth(100);
		contentContainer.setPercentHeight(100);
		this.contentContainer.add(contentContainer);

		this.contentPanel = new StackPanel("content-panel");
		this.contentPanel.setMargin(120, 140);
		this.contentPanel.setPercentWidth(100);
		this.contentPanel.setVerticalAlignment(VerticalAlignment.Bottom);
		this.contentPanel.setGap(55);
		this.contentPanel.setRenderTransform(new ScaleTransform(1, 1));
		this.contentPanel.setIsNavigationZone(true);
		this.contentPanel.setNavigationMode(NavigationMode.Normal);
		contentContainer.setChild(this.contentPanel);

		this.createTabPanel();
		this.createListContainer();
		this.createVideoList();
		this.createImageList();
	}

	commitProperties() {
		super.commitProperties();

		if(this.state.selectedTabIndexChanged)
		{
			this.state.selectedTabIndexChanged = false;
			this.updateTabSelection();
		}
	}

	processKeyEvent(keyEvent) {
		if(keyEvent.getKey() === Key.Down)
		{
			for(var i = 0; i < this.tabContent.length; i++)
			{
				if(this.tabContent[i].getIsFocused())
				{
					this.toggleFullscreen(false);
					return false;
				}
			}
		}
		else if(keyEvent.getKey() === Key.Back)
		{
			this.toggleFullscreen(false);
		}

		return true;
	}

	processGamepadButtonEvent(buttonEvent) {
		if(buttonEvent.getButton() === GamepadButtons.DPadDown || buttonEvent.getButton() === GamepadButtons.LeftStickDown)
		{
			for(var i = 0; i < this.tabContent.length; i++)
			{
				if(this.tabContent[i].getIsFocused())
				{
					this.toggleFullscreen(false);
					return false;
				}
			}
		}
		else if(buttonEvent.getButton() === GamepadButtons.B)
		{
			this.toggleFullscreen(false);
		}

		return true;
	}

	createTabPanel() {
		var tabs = ["Videos", "Screenshots"];

		this.tabPanel = new StackPanel("tab-panel");
		this.tabPanel.setPercentWidth(100);
		this.tabPanel.setOrientation(Orientation.Horizontal);
		this.tabPanel.setGap(40);
		this.tabPanel.setIsNavigationFocusEnabled(true);
		this.tabPanel.addEventHandler(Event.FOCUS_IN, this.onTabPanelFocusIn.d(this));
		this.tabPanel.addEventHandler(KeyEvent.KEY_DOWN, this.onTabPanelKeyDown.d(this));
		this.tabPanel.addEventHandler(GamepadButtonEvent.DOWN, this.onTabPanelGamepadButtonDown.d(this));
		this.contentPanel.add(this.tabPanel);

		for(var i = 0; i < tabs.length; ++i)
		{
			var label = new TextLabel("tab-title-" + tabs[i].toLowerCase(), "x-small");
			label.setVerticalAlignment(VerticalAlignment.Bottom);
			label.setForeground(SolidColorBrush.fromColorHexWithAlpha("#ffffff", 0.7));
			label.setText(tabs[i]);

			this.tabPanel.add(label);
		}
	}

	createListContainer() {
		this.listContainer = new Canvas("list-container");
		this.listContainer.setPercentWidth(100);
		this.listContainer.setHeight(290);
		this.contentPanel.add(this.listContainer);
	}

	createVideoList() {
		var list = new MediaList("video-list", true);
		list.dataItems = MediaScreen.MockMedia.Videos;
		list.setVisible(true);
		list.setIsNavigationFocusEnabled(true);
		list.selectedItemIndex = 0;
		list.addEventHandler(Event.FOCUS_IN, this.onListFocusIn.d(this));
		list.addEventHandler(ListEvent.SELECTED, this.onVideoListItemSelected.d(this));
		list.addEventHandler(ListEvent.SELECTED_INDEX_CHANGED, this.onVideoListItemSelectedIndexChanged.d(this));
		this.listContainer.add(list);
		this.tabContent[0] = list;
	}

	createImageList() {
		var list = new MediaList("images-list", false);
		list.dataItems = MediaScreen.MockMedia.Screenshots;
		list.setVisible(false);
		list.setIsNavigationFocusEnabled(true);
		list.selectedItemIndex = 0;
		list.addEventHandler(Event.FOCUS_IN, this.onListFocusIn.d(this));
		list.addEventHandler(ListEvent.SELECTED, this.onImageListItemSelected.d(this));
		list.addEventHandler(ListEvent.SELECTED_INDEX_CHANGED, this.onImageListItemSelectedIndexChanged.d(this));
		this.listContainer.add(list);
		this.tabContent[1] = list;
	}

	updateTabSelection() {
		for(var i = 0; i < this.tabPanel.getCount(); i++)
		{
			var label = this.tabPanel.getAt(i);

			if(i === this.selectedTabIndex)
			{
				label.setForeground(SolidColorBrush.white());
				label.setFontSize(30);

				this.tabContent[i].setVisible(true);
			}
			else
			{
				label.setForeground(SolidColorBrush.fromColorHexWithAlpha("#ffffff", 0.7));
				label.setFontSize(26);

				this.tabContent[i].setVisible(false);
			}
		}
	}

	updateBackgroundImage(dataItem) {
		var lastImage = this.backgroundContainer.getAt(0);
		var image = Image.create("background-image", dataItem.url);

		this.backgroundContainer.add(image);

		if(lastImage)
		{
			var animation = new BasicAnimation(lastImage, "alpha", null, 0);
			animation.setDuration(Animations.MediaListBackgroundTransitionDuration);
			animation.setEasingFunction(Animations.MediaListBackgroundTransitionEasing);
			animation.addEventHandler(AnimationEvent.COMPLETE, this.onLastBackgroundImageAnimationComplete.d(this));
			animation.play();

			animation = new BasicAnimation(image, "alpha", 0, 1);
			animation.setDuration(Animations.MediaListBackgroundTransitionDuration);
			animation.setEasingFunction(Animations.MediaListBackgroundTransitionEasing);
			animation.play();
		}
	}

	onLastBackgroundImageAnimationComplete(event) {
		this.backgroundContainer.removeAt(0);
	}

	updateNavigation(list) {
		var animation = new BasicAnimation(this.navigationLeft, "alpha", null, list.selectedItemIndex === 0 ? 0 : 1);
		animation.setDuration(Animations.MediaListToggleFullscreenDuration);
		animation.setEasingFunction(Animations.MediaListToggleFullscreenEasing);
		animation.play();

		var animation = new BasicAnimation(this.navigationRight, "alpha", null, list.selectedItemIndex === list.dataItemCount-1 ? 0 : 1);
		animation.setDuration(Animations.MediaListToggleFullscreenDuration);
		animation.setEasingFunction(Animations.MediaListToggleFullscreenEasing);
		animation.play();
	}

	toggleFullscreen(fullscreen) {
		if(fullscreen && this.isFullscreen)
			return;

		this.isFullscreen = fullscreen;
		this.tabPanel.setIsNavigationFocusEnabled(!this.isFullscreen);
		this.navigator.toggleNavigationHints(!this.isFullscreen);

		var animation = new BasicAnimation(this.backgroundContainer, "alpha", null, fullscreen ? 1 : 0);
		animation.setDuration(Animations.MediaListToggleFullscreenDuration);
		animation.setEasingFunction(Animations.MediaListToggleFullscreenEasing);
		animation.addEventHandler(AnimationEvent.COMPLETE, this.onBackgroundAnimationComplete.d(this));
		animation.play();

		animation = new BasicAnimation(this.navigationPanel, "alpha", null, fullscreen ? 1 : 0);
		animation.setDuration(Animations.MediaListToggleFullscreenDuration);
		animation.setEasingFunction(Animations.MediaListToggleFullscreenEasing);
		animation.play();

		var center = this.getCenter();
		var xform = this.contentPanel.getRenderTransform();

		xform.setCenterX(center.x);
		xform.setCenterY(center.y);

		animation = new BasicParallelAnimation(this.contentPanel, ["alpha", "scaleX", "scaleY"], null, [fullscreen ? 0 : 1, fullscreen ? 0.85 : 1, fullscreen ? 0.85 : 1]);
		animation.setDuration(Animations.MediaListToggleFullscreenDuration);
		animation.setEasingFunction(Animations.MediaListToggleFullscreenEasing);
		animation.play();

		if(fullscreen)
		{
			center = this.backgroundContainer.getCenter();
			xform = this.backgroundContainer.getRenderTransform();
			xform.setCenterX(center.x);
			xform.setCenterY(center.y);

			animation = new BasicParallelAnimation(xform, ["scaleX", "scaleY"], [1.15, 1.15], [1, 1]);
			animation.setDuration(Animations.MediaListFullscreenBackgroundDuration);
			animation.setEasingFunction(Animations.MediaListFullscreenBackgroundEasing);
			animation.play();
		}
	}

	onBackgroundAnimationComplete(event) {
		if(!this.isFullscreen)
			this.backgroundContainer.clear();
	}

	onTabPanelFocusIn(event) {
		this.updateTabSelection();
	}

	onTabPanelKeyDown(event) {
		switch(event.getKey())
		{
			case Key.Left:
				this.selectedTabIndex--;
				break;
			case Key.Right:
				this.selectedTabIndex++;
				break;
			case Key.Enter:
				this.tabContent[this.selectedTabIndex].focus();
				break;
		}
	}

	onTabPanelGamepadButtonDown(event) {
		switch(event.getButton())
		{
			case GamepadButtons.DPadLeft:
			case GamepadButtons.LeftStickLeft:
				this.selectedTabIndex--;
				break;
			case GamepadButtons.DPadRight:
			case GamepadButtons.LeftStickRight:
				this.selectedTabIndex++;
				break;
			case GamepadButtons.A:
				this.tabContent[this.selectedTabIndex].focus();
				break;
		}
	}

	onListFocusIn(event) {
		var tab = this.tabPanel.getAt(this.selectedTabIndex);
		tab.setFontSize(26);
	}

	onVideoListItemSelected(event) {

	}

	onVideoListItemSelectedIndexChanged(event) {

	}

	onImageListItemSelected(event) {
		var list = event.getTarget();

		this.updateBackgroundImage(list.selectedItem);
		this.updateNavigation(list);
		this.toggleFullscreen(true);
	}

	onImageListItemSelectedIndexChanged(event) {
		var list = event.getTarget();

		this.updateBackgroundImage(list.selectedItem);
		this.updateNavigation(list);
	}

	onFocusIn(event) {
		this.updateTabSelection();
		this.tabContent[this.selectedTabIndex].focus();
	}
}

MediaScreen.MockMedia = {
	"Screenshots": [
		{ url: "images/mock/media/screenshots/screenshot-01.jpg", thumbUrl: "images/mock/media/screenshots/screenshot-01-thumbnail.jpg" },
		{ url: "images/mock/media/screenshots/screenshot-02.jpg", thumbUrl: "images/mock/media/screenshots/screenshot-02-thumbnail.jpg" },
		{ url: "images/mock/media/screenshots/screenshot-03.jpg", thumbUrl: "images/mock/media/screenshots/screenshot-03-thumbnail.jpg" },
		{ url: "images/mock/media/screenshots/screenshot-04.jpg", thumbUrl: "images/mock/media/screenshots/screenshot-04-thumbnail.jpg" },
		{ url: "images/mock/media/screenshots/screenshot-05.jpg", thumbUrl: "images/mock/media/screenshots/screenshot-05-thumbnail.jpg" },
		{ url: "images/mock/media/screenshots/screenshot-06.jpg", thumbUrl: "images/mock/media/screenshots/screenshot-06-thumbnail.jpg" }
	],
	"Videos": [
		{ url: "", thumbUrl: "images/mock/media/videos/video-thumbnail-01.jpg" },
		{ url: "", thumbUrl: "images/mock/media/videos/video-thumbnail-02.jpg" },
		{ url: "", thumbUrl: "images/mock/media/videos/video-thumbnail-03.jpg" },
		{ url: "", thumbUrl: "images/mock/media/videos/video-thumbnail-04.jpg" },
		{ url: "", thumbUrl: "images/mock/media/videos/video-thumbnail-05.jpg" },
		{ url: "", thumbUrl: "images/mock/media/videos/video-thumbnail-06.jpg" },
		{ url: "", thumbUrl: "images/mock/media/videos/video-thumbnail-07.jpg" },
		{ url: "", thumbUrl: "images/mock/media/videos/video-thumbnail-08.jpg" }
	]
};

export default MediaScreen;
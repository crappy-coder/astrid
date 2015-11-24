import Application from "../../../src/Application"
import Event from "../../../src/Event"
import Key from "../../../src/input/Key"
import KeyEvent from "../../../src/input/KeyEvent"
import GamepadButtons from "../../../src/input/GamepadButtons"
import GamepadButtonEvent from "../../../src/input/GamepadButtonEvent"
import Canvas from "../../../src/ui/Canvas"
import StackPanel from "../../../src/ui/StackPanel"
import ContentControl from "../../../src/ui/ContentControl"
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
import Vector2D from "../../../src/Vector2D"
import SolidColorBrush from "../../../src/brushes/SolidColorBrush"
import LinearGradientBrush from "../../../src/brushes/LinearGradientBrush"
import ImageBrush from "../../../src/brushes/ImageBrush"
import VideoBrush from "../../../src/brushes/VideoBrush"
import BasicAnimation from "../../../src/animation/BasicAnimation"
import Easing from "../../../src/animation/Easing"
import AnimationEvent from "../../../src/animation/AnimationEvent"
import BoxBlurEffect from "../../../src/effects/BoxBlurEffect"
import ShapeLine from "../../../src/shapes/ShapeLine"

import Animations from "./Animations"
import ScreenType from "./ScreenType"
import MediaScreen from "./MediaScreen"
import CoverScreen from "./CoverScreen"
import DetailScreen from "./DetailScreen"
import BundleScreen from "./BundleScreen"
import AddOnScreen from "./AddOnScreen"
import RelatedScreen from "./RelatedScreen"
import SummaryHeader from "./SummaryHeader"
import TextLabel from "./TextLabel"
import ScreenEvent from "./ScreenEvent"
import ScreenNavigationDirection from "./ScreenNavigationDirection"
import ScreenNavigationEvent from "./ScreenNavigationEvent"
import ScreenNavigationHint from "./ScreenNavigationHint"
import ScreenNavigationHintDirection from "./ScreenNavigationHintDirection";
import ScreenNavigationTitle from "./ScreenNavigationTitle"

class ScreenNavigator extends Canvas {
	constructor(name) {
		super(name);

		this.defaultScreenIndex = 1; // default to cover screen

		this.navigationContent = null;
		this.navigationHintsPanel = null;
		this.navigationHintTop = null;
		this.navigationHintBottom = null;
		this.navigationTitle = null;
		this.navigationAnimation = null;
		this.backgroundContainer = null;
		this.backgroundImage = null;
		this.backgroundImageBlurred = null;
		this.backgroundImageAnimation = null;
		this.backgroundVideo = null;
		this.gradientsPanel = null;
		this.gradientTop = null;
		this.gradientBottom = null;
		this.productHeader = null;
		this.productHeaderContainer = null;
		this.productHeaderAnimation = null;
		this.screenPanel = null;
		this.screens = [
			new MediaScreen("media-screen", this),
			new CoverScreen("cover-screen", this),
			new DetailScreen("detail-screen", this),
			new BundleScreen("bundle-screen", this),
			new AddOnScreen("addon-screen", this),
			new RelatedScreen("related-screen", this)
		];

		this.state = {
			selectedScreenIndex: -1,
			selectedScreenIndexChanged: false,
			backgroundImageUrl: null,
			backgroundImageUrlChanged: false,
			backgroundVideoUrl: null,
			backgroundVideoUrlChanged: false
		};

		this.addEventHandler(KeyEvent.KEY_DOWN, this.onKeyDown.d(this));
		this.addEventHandler(GamepadButtonEvent.DOWN, this.onGamepadButtonDown.d(this));
		this.addEventHandler(Event.CREATED, this.onCreated.d(this));
	}

	get screenCount() {
		return this.screens.length;
	}

	get selectedScreen() {
		if(this.state.selectedScreenIndex >= 0 && this.state.selectedScreenIndex < this.screens.length)
			return this.screens[this.state.selectedScreenIndex];

		return null;
	}

	get selectedScreenIndex() {
		return this.state.selectedScreenIndex;
	}

	set selectedScreenIndex(value) {
		this.navigateTo(value);
	}

	get backgroundImageUrl() {
		return this.state.backgroundImageUrl;
	}

	set backgroundImageUrl(value) {
		if(this.state.backgroundImageUrl !== value)
		{
			this.state.backgroundImageUrl = value;
			this.state.backgroundImageUrlChanged = true;

			this.invalidateProperties();
			this.requestLayout();
		}
	}

	get backgroundVideoUrl() {
		return this.state.backgroundVideoUrl;
	}

	set backgroundVideoUrl(value) {
		if(this.state.backgroundVideoUrl !== value)
		{
			this.state.backgroundVideoUrl = value;
			this.state.backgroundVideoUrlChanged = true;

			this.invalidateProperties();
			this.requestLayout();
		}
	}

	navigateTo(screenIndex, disableAnimation) {
		if(this.selectedScreenIndex === screenIndex)
			return;

		if(screenIndex < 0 || screenIndex >= this.screenCount)
			return;

		var lastScreen = this.selectedScreen;

		this.state.selectedScreenIndex = screenIndex;
		this.state.selectedScreenIndexChanged = true;

		this.invalidateProperties();
		this.requestLayout();

		this.navigateImpl(lastScreen, this.selectedScreen, disableAnimation);
	}

	navigateUp(disableAnimation) {
		this.navigateTo(this.selectedScreenIndex-1, disableAnimation);
	}

	navigateDown(disableAnimation) {
		this.navigateTo(this.selectedScreenIndex+1, disableAnimation);
	}

	navigateImpl(fromScreen, toScreen, disableAnimation) {
		var screen = toScreen;
		var screenY = -(screen.getExactOrMeasuredHeight() * this.selectedScreenIndex);
		var direction = (this.screenPanel.getY() > screenY ? ScreenNavigationDirection.Down : ScreenNavigationDirection.Up);

		this.toggleProductHeader(disableAnimation);

		if(fromScreen !== null)
			fromScreen.hide(disableAnimation);

		toScreen.show(disableAnimation);

		if(disableAnimation)
		{
			this.screenPanel.setY(screenY);
			this.selectedScreen.focus();
		}
		else
		{
			var delta = Math.abs(this.screenPanel.getY() - screenY);
			var duration = (screen.getExactOrMeasuredHeight() / delta) * Animations.ScreenNavigationDuration;

			if(!this.navigationAnimation)
			{
				this.navigationAnimation = new BasicAnimation(this.screenPanel, "y", this.screenPanel.getY(), screenY);
				this.navigationAnimation.setEasingFunction(Animations.ScreenNavigationEasing);
				this.navigationAnimation.addEventHandler(AnimationEvent.COMPLETE, this.onNavigationAnimationComplete.d(this));
			}

			this.navigationAnimation.end();
			this.navigationAnimation.setDuration(duration);
			this.navigationAnimation.setFromValue(this.screenPanel.getY());
			this.navigationAnimation.setToValue(screenY);
			this.navigationAnimation.play();
		}

		this.dispatchEvent(new ScreenNavigationEvent(ScreenNavigationEvent.NAVIGATION_BEGIN, direction));

		var backgroundAlpha = (this.selectedScreenIndex === this.defaultScreenIndex ? 1 : 0);

		if(this.backgroundImage.getAlpha() !== backgroundAlpha)
		{
			if(!this.backgroundImageAnimation)
			{
				this.backgroundImageAnimation = new BasicAnimation(this.backgroundImage, "alpha", null);
				this.backgroundImageAnimation.setDuration(Animations.BackgroundImageDuration);
				this.backgroundImageAnimation.setEasingFunction(Animations.BackgroundImageEasing);
			}

			this.backgroundImageAnimation.end();
			this.backgroundImageAnimation.setToValue(backgroundAlpha);
			this.backgroundImageAnimation.play();
		}
	}

	toggleProductHeader(disableAnimation) {
		var screen = this.selectedScreen;
		var offsetY = (screen.needsProductHeader ? 0 : -this.productHeader.getExactOrMeasuredHeight());

		if(screen.needsProductHeader)
		{
			this.productHeader.show(disableAnimation);
			this.navigationTitle.show(disableAnimation);
		}
		else
		{
			this.productHeader.hide(disableAnimation);
			this.navigationTitle.hide(disableAnimation);
		}

		if(disableAnimation)
			this.productHeaderContainer.setY(offsetY);
		else
		{
			if(!this.productHeaderAnimation)
			{
				this.productHeaderAnimation = new BasicAnimation(this.productHeaderContainer, "y", null);
				this.productHeaderAnimation.setDuration(Animations.ScreenNavigationDuration);
				this.productHeaderAnimation.setEasingFunction(Animations.ScreenNavigationEasing);
			}

			this.productHeaderAnimation.stop();
			this.productHeaderAnimation.setToValue(offsetY);
			this.productHeaderAnimation.play();
		}
	}

	getScreenTitle(index) {
		if(index >= 0 && index < this.screenCount)
			return this.screens[index].title;

		return "";
	}

	createChildren() {
		var screenHeight = this.getExactOrMeasuredHeight();
		var screenY = 0;

		// create container to hold background image or video controls
		this.createBackgroundContainer();

		// create the gradients
		this.createGradients();

		// add the screens
		this.screenPanel = new StackPanel("screen-panel");
		this.screenPanel.setPercentWidth(100);
		this.add(this.screenPanel);

		for(var i = 0; i < this.screens.length; ++i)
		{
			var screen = this.screens[i];
			screen.setPercentWidth(100);
			screen.setHeight(screenHeight);
			this.screenPanel.add(screen);

			screenY += screenHeight;
		}

		// create the product summary header
		this.createSummaryHeader();

		// create the navigation controls
		this.createNavigationControls();
	}

	createBackgroundContainer() {
		this.backgroundContainer = new Canvas("background-container");
		this.backgroundContainer.setPercentWidth(100);
		this.backgroundContainer.setPercentHeight(100);
		this.add(this.backgroundContainer);

		this.backgroundImageBlurred = new Image("background-image-blurred");
		this.backgroundImageBlurred.setVisible(false);
		this.backgroundImageBlurred.setRenderEffects([new BoxBlurEffect(6, 6)]);
		this.backgroundContainer.add(this.backgroundImageBlurred);

		this.backgroundImage = new Image("background-image");
		this.backgroundImage.setPercentWidth(100);
		this.backgroundImage.setPercentHeight(100);
		this.backgroundImage.setVisible(false);
		this.backgroundContainer.add(this.backgroundImage);

		// TODO: create background video control
	}

	createGradients() {
		this.gradientsPanel = new DockPanel("gradients-panel");
		this.gradientsPanel.setFillLastChild(false);
		this.gradientsPanel.setPercentWidth(100);
		this.gradientsPanel.setPercentHeight(100);
		this.add(this.gradientsPanel);

		var brush = LinearGradientBrush.fromColorsWithAngle(Color.transparent(), Color.black(), 90);
		brush.setOpacity(0.3);

		this.gradientTop = new ShapeRectangle("gradient-top");
		this.gradientTop.setFill(brush);
		this.gradientTop.setPercentWidth(100);
		this.gradientTop.setHeight(320);
		this.gradientTop.setDock(Dock.Top);
		this.gradientsPanel.add(this.gradientTop);

		brush = LinearGradientBrush.fromColorsWithAngle(Color.black(), Color.transparent(), 90);
		brush.setOpacity(0.8);

		this.gradientBottom = new ShapeRectangle("gradient-bottom");
		this.gradientBottom.setFill(brush);
		this.gradientBottom.setPercentWidth(100);
		this.gradientBottom.setHeight(600);
		this.gradientBottom.setDock(Dock.Bottom);
		this.gradientsPanel.add(this.gradientBottom);
	}

	createSummaryHeader() {
		this.productHeader = new SummaryHeader("product-header");
		this.productHeader.setMargin(0, 140);

		this.productHeaderContainer = new ContentControl("product-header-container");
		this.productHeaderContainer.setChild(this.productHeader);
		this.add(this.productHeaderContainer);
	}

	createNavigationControls() {
		this.navigationContent = new ContentControl("navigation-content");
		this.navigationContent.setPercentWidth(100);
		this.navigationContent.setPercentHeight(100);
		this.add(this.navigationContent);

		// dock panel to hold the top and bottom navigation hints
		this.navigationHintsPanel = new DockPanel("navigation-hints-panel");
		this.navigationHintsPanel.setFillLastChild(false);
		this.navigationHintsPanel.setPercentWidth(100);
		this.navigationHintsPanel.setPercentHeight(100);
		this.navigationHintsPanel.setMargin(68, 96);
		this.navigationContent.setChild(this.navigationHintsPanel);

		// top navigation hint
		this.navigationHintTop = new ScreenNavigationHint("navigation-hint-top", ScreenNavigationHintDirection.Up, this);
		this.navigationHintTop.setDock(Dock.Top);
		this.navigationHintTop.setPercentWidth(100);
		this.navigationHintsPanel.add(this.navigationHintTop);

		// bottom navigation hint
		this.navigationHintBottom = new ScreenNavigationHint("navigation-hint-bottom", ScreenNavigationHintDirection.Down, this);
		this.navigationHintBottom.setDock(Dock.Bottom);
		this.navigationHintBottom.setPercentWidth(100);
		this.navigationHintsPanel.add(this.navigationHintBottom);

		// title to display when showing product header
		this.navigationTitle = new ScreenNavigationTitle("title", this);
		this.navigationTitle.setPercentWidth(100);
		this.navigationTitle.setY(154);

		this.add(this.navigationTitle);
	}

	commitProperties() {
		super.commitProperties();

		if(this.state.backgroundImageUrlChanged)
		{
			this.state.backgroundImageUrlChanged = false;
			this.updateBackgroundImage();
		}
	}

	updateBackgroundImage() {
		this.backgroundImage.setSource(TextureSource.fromFile(this.backgroundImageUrl));
		this.backgroundImageBlurred.setSource(TextureSource.fromFile(this.backgroundImageUrl));
		this.backgroundImage.setVisible(true);
		this.backgroundImageBlurred.setVisible(true);
	}

	toggleNavigationHints(hintsOn) {
		var animation = new BasicAnimation(this.navigationHintsPanel, "alpha", null, hintsOn ? 1 : 0);
		animation.setDuration(Animations.ShowHideFadeDuration);
		animation.setEasingFunction(Animations.ShowHideFadeEasing);
		animation.play();
	}

	onCreated(event) {
		void(event);

		// navigate to the default screen
		this.navigateTo(this.defaultScreenIndex, true);
	}

	onKeyDown(event) {
		if(this.selectedScreen.processKeyEvent(event))
			return;

		switch(event.getKey())
		{
			case Key.Down:
				this.navigateDown();
				break;
			case Key.Up:
				this.navigateUp();
				break;
		}
	}

	onGamepadButtonDown(event) {
		if(this.selectedScreen.processGamepadButtonEvent(event))
			return;

		switch(event.getButton())
		{
			case GamepadButtons.DPadDown:
			case GamepadButtons.LeftStickDown:
				this.navigateDown();
				break;
			case GamepadButtons.DPadUp:
			case GamepadButtons.LeftStickUp:
				this.navigateUp();
				break;
		}
	}

	onNavigationAnimationComplete(event) {
		void(event);

		var direction = (this.navigationAnimation.getFromValue() > this.navigationAnimation.getToValue() ? ScreenNavigationDirection.Down : ScreenNavigationDirection.Up);

		this.selectedScreen.focus();
		this.dispatchEvent(new ScreenNavigationEvent(ScreenNavigationEvent.NAVIGATION_END, direction));
	}
}

export default ScreenNavigator;
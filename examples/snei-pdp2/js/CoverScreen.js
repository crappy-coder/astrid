import Application from "../../../src/Application"
import Event from "../../../src/Event"
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

import Screen from "./Screen"
import ScreenType from "./ScreenType"
import MetadataBadge from "./MetadataBadge"
import MetadataBadgeType from "./MetadataBadgeType"
import StarRatings from "./StarRatings"
import ButtonType from "./ButtonType"
import PriceButton from "./PriceButton"
import TextButton from "./TextButton"
import NumberBadgeButton from "./NumberBadgeButton"
import ImageButton from "./ImageButton"
import TextLabel from "./TextLabel"

class CoverScreen extends Screen {
	constructor(name, navigator) {
		super(name, "Overview", ScreenType.Cover, navigator);

		this.needsProductHeader = false;

		this.contentPanel = null;
		this.topPanel = null;
		this.metadataPanel = null;
		this.buttonsPanel = null;
		this.bottomPanel = null;
		this.titleLabel = null;

		this.addEventHandler(Event.FOCUS_IN, this.onFocusIn.d(this));
	}

	createChildren() {
		this.contentPanel = new StackPanel("content-panel");
		this.contentPanel.setMargin(54, 140);
		this.contentPanel.setPercentWidth(100);
		this.contentPanel.setVerticalAlignment(VerticalAlignment.Bottom);
		this.contentPanel.setGap(50);
		this.setChild(this.contentPanel);

		this.topPanel = new StackPanel("top-panel");
		this.topPanel.setPercentWidth(100);
		this.topPanel.setGap(14);
		this.contentPanel.add(this.topPanel);

		this.createTitle();
		this.createMetadata();
		this.createButtons();
		this.createBottomLockup();
	}

	createTitle() {
		this.titleLabel = new TextLabel("title-label", "x-large");
		this.titleLabel.setForeground(SolidColorBrush.white());
		this.titleLabel.setText("Star Wars Battlefront");
		this.topPanel.add(this.titleLabel);
	}

	createMetadata() {
		this.metadataPanel = new StackPanel("metadata-panel");
		this.metadataPanel.setOrientation(Orientation.Horizontal);
		this.metadataPanel.setGap(20);
		this.topPanel.add(this.metadataPanel);

		this.createBadges();
		this.createReleaseDateLabel();
		this.createRatings();
	}

	createBadges() {
		var badgePanel = new StackPanel("badge-panel");
		badgePanel.setVerticalAlignment(VerticalAlignment.Center);
		badgePanel.setOrientation(Orientation.Horizontal);
		badgePanel.setGap(10);

		var badge = new MetadataBadge("preorder-badge", MetadataBadgeType.Sale);
		badge.title = "PRE-ORDER";
		badgePanel.add(badge);

		badge = new MetadataBadge("full-game-badge", MetadataBadgeType.Normal);
		badge.title = "FULL GAME";
		badgePanel.add(badge);

		badge = new MetadataBadge("sale-discount-badge", MetadataBadgeType.PSPlus);
		badge.title = "SAVE 60%";
		badgePanel.add(badge);

		this.metadataPanel.add(badgePanel);
	}

	createReleaseDateLabel() {
		var lbl = new TextLabel("release-date-label", "xx-small");
		lbl.setVerticalAlignment(VerticalAlignment.Center);
		lbl.setForeground(SolidColorBrush.fromColorHexWithAlpha("#ffffff", 0.7));
		lbl.setText("Coming Jan 25, 2015");

		this.metadataPanel.add(lbl);
	}

	createRatings() {
		var ratings = new StarRatings("ratings");
		ratings.ratingValue = 4;
		this.metadataPanel.add(ratings);

		var lbl = new TextLabel("ratings-label", "xx-small");
		lbl.setVerticalAlignment(VerticalAlignment.Center);
		lbl.setForeground(SolidColorBrush.fromColorHexWithAlpha("#ffffff", 0.7));
		lbl.setText("1025 Ratings");

		this.metadataPanel.add(lbl);
	}

	createButtons() {
		this.buttonsPanel = new DockPanel("buttons-panel");
		this.buttonsPanel.setPercentWidth(100);
		this.buttonsPanel.setFillLastChild(false);
		this.buttonsPanel.setIsNavigationZone(true);

		var leftButtons = new StackPanel("left-buttons");
		leftButtons.setDock(Dock.Left);
		leftButtons.setOrientation(Orientation.Horizontal);
		leftButtons.setGap(10);

		var btn = new PriceButton("pre-order-button");
		btn.text = "Pre-Order";
		btn.price = 59.99;
		leftButtons.add(btn);

		btn = new PriceButton("ps-plus-members-button");
		btn.text = "PS Plus Members Pay";
		btn.price = 45.99;
		leftButtons.add(btn);

		this.buttonsPanel.add(leftButtons);

		var rightButtons = new StackPanel("right-buttons");
		rightButtons.setDock(Dock.Right);
		rightButtons.setOrientation(Orientation.Horizontal);
		rightButtons.setGap(10);

		btn = new NumberBadgeButton("bundles-button");
		btn.buttonType = ButtonType.Dark;
		btn.text = "Bundles";
		btn.value = 2;
		rightButtons.add(btn);

		btn = new ImageButton("like-button");
		btn.buttonType = ButtonType.Dark;
		btn.imageUrl = "images/icon-thumbs-up.png";
		rightButtons.add(btn);

		this.buttonsPanel.add(rightButtons);

		this.contentPanel.add(this.buttonsPanel);
	}

	createBottomLockup() {
		this.bottomPanel = new StackPanel("bottom-panel");
		this.bottomPanel.setPercentWidth(100);
		this.bottomPanel.setGap(28);
		this.contentPanel.add(this.bottomPanel);

		var line = new Canvas("line");
		line.setPercentWidth(100);
		line.setHeight(1);
		line.setBackground(SolidColorBrush.fromColorRGBA(255, 255, 255, 0.4));
		this.bottomPanel.add(line);

		var infoPanel = new DockPanel("info-panel");
		infoPanel.setPercentWidth(100);
		infoPanel.setFillLastChild(false);
		this.bottomPanel.add(infoPanel);

		var leftPanel = new StackPanel("left-panel");
		leftPanel.setOrientation(Orientation.Horizontal);
		leftPanel.setDock(Dock.Left);
		leftPanel.setGap(20);
		infoPanel.add(leftPanel);

		var rightPanel = new StackPanel("right-panel");
		rightPanel.setOrientation(Orientation.Horizontal);
		rightPanel.setDock(Dock.Right);
		rightPanel.setGap(40);
		infoPanel.add(rightPanel);

		var esrbImage = Image.create("esrb", "images/mock/esrb.jpg");
		leftPanel.add(esrbImage);

		var esrbTextLines = ["Mild Language", "Animated Blood", "Online Interactions", "Not Rated by the ESRB"];
		var esrbTextPanel = new StackPanel("esrb-text-panel");
		esrbTextPanel.setVerticalAlignment(VerticalAlignment.Center);

		for(var i = 0; i < esrbTextLines.length; i++)
		{
			var lbl = new TextLabel("line-" + i, "x-tiny");
			lbl.setForeground(SolidColorBrush.fromColorHexWithAlpha("#ffffff", 0.7));
			lbl.setText(esrbTextLines[i]);
			esrbTextPanel.add(lbl);
		}

		leftPanel.add(esrbTextPanel);

		var infoIcons = [
			{iconUrl: "images/icon-network-player.png", text: "Network Players 2-40"},
			{iconUrl: "images/icon-person.png", text: "1 Player"},
			{iconUrl: "images/icon-storage.png", text: "36.6GB"}];

		for(var i = 0; i < infoIcons.length; i++)
		{
			var infoIcon = infoIcons[i];
			var infoIconPanel = new StackPanel("info-icon-panel-" + i.toString());
			infoIconPanel.setGap(20);

			var iconImage = Image.create("info-icon-" + i, infoIcon.iconUrl);
			iconImage.setHorizontalAlignment(HorizontalAlignment.Center);
			infoIconPanel.add(iconImage);

			var iconLabel = new TextLabel("icon-label-" + i, "xx-small");
			iconLabel.setForeground(SolidColorBrush.white());
			iconLabel.setText(infoIcon.text);
			infoIconPanel.add(iconLabel);

			rightPanel.add(infoIconPanel);
		}
	}

	onFocusIn(event) {
		this.buttonsPanel.focus();
	}
}

export default CoverScreen;
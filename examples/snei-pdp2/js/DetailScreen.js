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
import SummaryHeader from "./SummaryHeader"
import TextLabel from "./TextLabel"

class DetailScreen extends Screen {
	constructor(name, navigator) {
		super(name, "Game Details", ScreenType.Detail, navigator);

		this.contentPanel = null;
		this.leftContent = null;
		this.rightContent = null;
		this.bottomPanel = null;

		this.addEventHandler(Event.FOCUS_IN, this.onFocusIn.d(this));
	}

	createChildren() {
		this.contentPanel = new StackPanel("content-panel");
		this.contentPanel.setMargin(0, 140);
		this.contentPanel.setMarginBottom(170);
		this.contentPanel.setPercentWidth(100);
		this.contentPanel.setVerticalAlignment(VerticalAlignment.Bottom);
		this.setChild(this.contentPanel);

		this.bottomPanel = new StackPanel("bottom-panel");
		this.bottomPanel.setOrientation(Orientation.Horizontal);
		this.bottomPanel.setPercentWidth(100);
		this.bottomPanel.setGap(80);
		this.contentPanel.add(this.bottomPanel);

		this.createLeftContent();
		this.createRightContent();
	}

	createLeftContent() {
		this.leftContent = new Border("left-content");
		this.leftContent.setWidth(990);
		this.leftContent.setHeight(670);
		this.leftContent.setBackground(SolidColorBrush.fromColorHexWithAlpha("#000000", 0.5));
		this.leftContent.setClipChildren(true);
		this.leftContent.setIsNavigationZone(true);
		this.leftContent.setIsNavigationFocusEnabled(true);
		this.leftContent.setBorderThickness(2);
		this.leftContent.setBorderBrush(SolidColorBrush.fromColorHexWithAlpha("#ffffff", 0.7));
		this.leftContent.addEventHandler(Event.FOCUS_IN, this.onTextContentFocusIn.d(this));
		this.leftContent.addEventHandler(Event.FOCUS_OUT, this.onTextContentFocusOut.d(this));
		this.bottomPanel.add(this.leftContent);

		var textContentContainer = new Border("text-content-container");
		textContentContainer.setPercentWidth(100);
		textContentContainer.setMarginTop(60);
		textContentContainer.setMarginLeft(100);
		textContentContainer.setMarginRight(100);
		this.leftContent.setChild(textContentContainer);

		var textContentPanel = new StackPanel("text-content-panel");
		textContentPanel.setPercentWidth(100);
		textContentPanel.setHeight(610);
		textContentPanel.setGap(40);
		textContentContainer.setChild(textContentPanel);

		var metadataPanel = new StackPanel("metadata-panel");
		metadataPanel.setOrientation(Orientation.Horizontal);
		metadataPanel.setGap(20);
		textContentPanel.add(metadataPanel);

		var releaseDateLabel = new TextLabel("release-date-label", "xx-small");
		releaseDateLabel.setVerticalAlignment(VerticalAlignment.Center);
		releaseDateLabel.setForeground(SolidColorBrush.fromColorHexWithAlpha("#ffffff", 0.7));
		releaseDateLabel.setText("Coming Jan 25, 2015");

		metadataPanel.add(releaseDateLabel);

		var ratings = new StarRatings("ratings");
		ratings.ratingValue = 4;
		metadataPanel.add(ratings);

		var ratingsLabel = new TextLabel("ratings-label", "xx-small");
		ratingsLabel.setVerticalAlignment(VerticalAlignment.Center);
		ratingsLabel.setForeground(SolidColorBrush.fromColorHexWithAlpha("#ffffff", 0.7));
		ratingsLabel.setText("1025 Ratings");

		metadataPanel.add(ratingsLabel);

		var line = new ShapeLine("line");
		line.setX1(0);
		line.setX2(790);
		line.setY1(0);
		line.setY2(0);
		line.setStroke(SolidColorBrush.fromColorRGBA(255, 255, 255, 0.4));
		line.setStrokeThickness(1);
		textContentPanel.add(line);

		var saleLabel = new TextLabel("sale-label", "x-small");
		saleLabel.setForeground(SolidColorBrush.fromColorHex("#00aaff"));
		saleLabel.setText("Sale valid from 07/24/2015 - 08/24/2015");
		textContentPanel.add(saleLabel);

		var descriptionLabel = new TextLabel("description-label", "x-small");
		descriptionLabel.setMaxWidth(790);
		descriptionLabel.setWordWrap(true);
		descriptionLabel.setForeground(SolidColorBrush.white());
		descriptionLabel.setText(DetailScreen.MockDescriptionText);
		textContentPanel.add(descriptionLabel);

		var alphaBrush = LinearGradientBrush.fromColorsWithAngle(Color.transparent(), Color.black(), 90);
		alphaBrush.getColorStop(1).setOffset(0.2);
		textContentPanel.setAlphaMask(alphaBrush);
	}

	createRightContent() {
		var icons = [
			{ iconUrl: "images/icon-online.png", text: "Online Play Optional" },
			{ iconUrl: "images/icon-size.png", text: "36.6GB Required" },
			{ iconUrl: "images/icon-players.png", text: "1-2 Players" },
			{ iconUrl: "images/icon-network.png", text: "2-40 Network Players" },
			{ iconUrl: "images/icon-controller.png", text: "DUALSHOCK Controller" },
			{ iconUrl: "images/icon-remote.png", text: "Remote Play Optional" },
			{ iconUrl: "images/icon-mic.png", text: "Microphone Required" },
			{ iconUrl: "images/icon-psmove.png", text: "PlayStation Move Required" },
			{ iconUrl: "images/icon-display.png", text: "1080p Video Output" },
			{ iconUrl: "images/icon-psplus.png", text: "PS+ Member Rewards" }
		];

		this.rightContent = new DockPanel("right-content");
		this.rightContent.setPercentWidth(100);
		this.rightContent.setFillLastChild(false);
		this.rightContent.setHeight(670);
		this.bottomPanel.add(this.rightContent);

		var iconPairPanel = null;
		var iconPairCount = 0;
		var iconListPanel = new StackPanel("icon-list-panel");
		iconListPanel.setGap(25);
		iconListPanel.setDock(Dock.Top);
		this.rightContent.add(iconListPanel);

		iconListPanel.add(new Canvas("spacer"));

		for(var i = 0; i < icons.length; i++)
		{
			var icon = icons[i];

			if((i % 2) === 0)
			{
				if(i > 0)
				{
					var line = new ShapeLine("line-" + iconPairCount);
					line.setX1(0);
					line.setX2(570);
					line.setY1(0);
					line.setY2(0);
					line.setStroke(SolidColorBrush.fromColorHexWithAlpha("#ffffff", 0.2));
					line.setStrokeThickness(1);
					iconListPanel.add(line);
				}

				iconPairPanel = new StackPanel("icon-pair-panel-" + iconPairCount);
				iconPairPanel.setOrientation(Orientation.Horizontal);
				iconPairPanel.setGap(30);
				iconListPanel.add(iconPairPanel);

				iconPairCount++;
			}

			var iconPanel = new StackPanel("icon-panel");
			iconPanel.setWidth(240);
			iconPanel.setOrientation(Orientation.Horizontal);
			iconPanel.setGap(30);

			var iconImage = Image.create("icon-image", icon.iconUrl);
			iconImage.setVerticalAlignment(VerticalAlignment.Center);
			iconImage.setAlpha(0.7);
			iconPanel.add(iconImage);

			var iconLabel = new TextLabel("ratings-label", "xx-small");
			iconLabel.setMaxWidth(190);
			iconLabel.setWordWrap(true);
			iconLabel.setVerticalAlignment(VerticalAlignment.Center);
			iconLabel.setForeground(SolidColorBrush.white());
			iconLabel.setText(icon.text);
			iconPanel.add(iconLabel);

			iconPairPanel.add(iconPanel);
		}

		var esrbPanel = new StackPanel("esrb-panel");
		esrbPanel.setOrientation(Orientation.Horizontal);
		esrbPanel.setGap(20);
		esrbPanel.setDock(Dock.Bottom);
		this.rightContent.add(esrbPanel);

		var esrbImage = Image.create("esrb", "images/mock/esrb.jpg");
		esrbPanel.add(esrbImage);

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

		esrbPanel.add(esrbTextPanel);
	}

	onTextContentFocusIn(event) {
		this.leftContent.setBorderBrush(SolidColorBrush.fromColorHexWithAlpha("#ffffff", 0.7));
	}

	onTextContentFocusOut(event) {
		this.leftContent.setBorderBrush(null);
	}

	onFocusIn(event) {
		this.leftContent.focus();
	}
}

DetailScreen.MockDescriptionText = "Immerse yourself in the original Star Wars trilogy, become the hero or villain of each battle, and fight for the fate of the galaxy.\r\n\
\r\n\
Feeling the ominous thud of an AT-AT stomping down on the frozen tundra of Hoth. Rebel forces firing blasters as Imperial speeder bikes zip through the lush forests of Endor. Intense dogfights between squadrons of X-wings and TIE fighters filling the skies. Immerse yourself in the epic Star Wars battles you've always dreamed of and create new heroic moments of your own in Star Wars Battlefront. Wage epic multiplayer battles on Hoth, Endor, Tatooine and the previously unexplored planet, Sullust. Fire blasters, drive speederbikes, snowspeeders and command AT-ATs. Fight as the galaxy's most memorable heroes and villains, like Darth Vader and Boba Fett. Interact with some of the most beloved characters from the original trilogy. Pilot X-wings, TIE fighters, the Millennium Falcon and more of your favorite vehicles in exhilarating aerial combat. Find out which squadrons will rule the skies.\r\n\
\r\n\
Seamlessly swap between 1st person and 3rd person perspectives. Partner up with a friend in online multiplayer, share unlocks and have each other's backs on the battlefront. Fight for the Empire or the Rebellion offline, solo or with a friend, in carefully crafted missions.\r\n\
\r\n\
�   The most immersive gameplay\r\n\
�   Ground-based combat on a galactic scale\r\n\
�   Play as iconic Star Wars characters\r\n\
�   Engage in epic Star Wars dog fights\r\n\
�   For jedis and padawans alike\r\n\
\r\n\
In addition to Survival, Star Wars Battlefront will feature a variety of exciting Mission modes including Battles, Hero Battles and Trials. Stay tuned for more info coming in the months ahead.\r\n\
\r\n\
Use of PSN and SEN account are subject to the Terms of Service and User Agreement and applicable privacy policy (see terms at sonyentertainmentnetwork.com/terms-of-service & sonyentertainmentnetwork.com/privacy-policy). *Online multiplayer also requires a PlayStation�Plus subscription.\r\n\
\r\n\
Software subject to license (us.playstation.com/softwarelicense). Online activity subject to Terms of Services and User Agreement (www.playstationnetwork.com/terms-of-service). One-time license fee for play on account�s designated primary PS4� system and other PS4� systems when signed in with that account.\r\n\
\r\n\
STAR WARS � & � 2015 Lucasfilm Ltd. All rights reserved. Underlying technology and game design � EA. All rights reserved."

export default DetailScreen;
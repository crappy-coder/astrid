import { ValueOrDefault } from "../../../src/Engine";
import StackPanel from "../../../src/ui/StackPanel"
import Image from "../../../src/ui/Image"
import HorizontalAlignment from "../../../src/ui/HorizontalAlignment"
import VerticalAlignment from "../../../src/ui/VerticalAlignment"
import Orientation from "../../../src/ui/Orientation"
import SolidColorBrush from "../../../src/brushes/SolidColorBrush"
import BasicAnimation from "../../../src/animation/BasicAnimation"
import Easing from "../../../src/animation/Easing"

import Animations from "./Animations"
import MetadataBadge from "./MetadataBadge"
import MetadataBadgeType from "./MetadataBadgeType"
import TextLabel from "./TextLabel"

class SummaryHeader extends StackPanel {
	constructor(name) {
		super(name);

		this.showHideAnimation = null;

		this.setOrientation(Orientation.Horizontal);
		this.setHeight(170);
		this.setGap(20);
		this.setAlphaAffectsVisibility(true);
		this.setAlpha(0);
	}

	show(disableAnimation) {
		this.toggleVisibility(true, disableAnimation);
	}

	hide(disableAnimation) {
		this.toggleVisibility(false, disableAnimation);
	}

	toggleVisibility(visible, disableAnimation) {
		disableAnimation = ValueOrDefault(disableAnimation, false);

		if(!this.showHideAnimation)
		{
			this.showHideAnimation = new BasicAnimation(this, "alpha", null);
			this.showHideAnimation.setDuration(Animations.ShowHideFadeDuration);
			this.showHideAnimation.setEasingFunction(Animations.ShowHideFadeEasing);
		}

		this.showHideAnimation.stop();
		this.showHideAnimation.setToValue(visible ? 1 : 0);
		this.showHideAnimation.play();
	}

	createChildren() {
		// add product thumbnail image
		var thumbImage = Image.create("product-thumbnail-image", "images/mock/product-thumbnail-small.jpg");
		thumbImage.setVerticalAlignment(VerticalAlignment.Center);
		this.add(thumbImage);

		// add panel to hold the product information
		var infoPanel = new StackPanel("info-panel");
		infoPanel.setVerticalAlignment(VerticalAlignment.Center);
		infoPanel.setGap(5);
		this.add(infoPanel);

		// add title
		var titleLabel = new TextLabel("title-label", "small");
		titleLabel.setForeground(SolidColorBrush.white());
		titleLabel.setText("Star Wars Battlefront");
		infoPanel.add(titleLabel);

		// add panel to hold price and badges
		var metadataPanel = new StackPanel("metadata-panel");
		metadataPanel.setOrientation(Orientation.Horizontal);
		metadataPanel.setGap(10);
		infoPanel.add(metadataPanel);

		// add price
		var priceLabel = new TextLabel("price-label", "xx-small-medium");
		priceLabel.setForeground(SolidColorBrush.white());
		priceLabel.setText("$59.99");
		metadataPanel.add(priceLabel);

		// add badges
		var badge = new MetadataBadge("preorder-badge", MetadataBadgeType.Sale);
		badge.title = "PRE-ORDER";
		metadataPanel.add(badge);

		badge = new MetadataBadge("full-game-badge", MetadataBadgeType.Normal);
		badge.title = "FULL GAME";
		metadataPanel.add(badge);
	}
}

export default SummaryHeader;
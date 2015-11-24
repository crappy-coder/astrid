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
import TextTrimming from "../../../src/text/TextTrimming"
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
import TextLabel from "./TextLabel"
import MetadataBadge from "./MetadataBadge";
import MetadataBadgeType from "./MetadataBadgeType";
import StarRatings from "./StarRatings"
import MockProductType from "./MockProductType"

class ProductListInfoPanel extends StackPanel {
	constructor(name) {
		super(name);

		this.titleLabel = null;
		this.priceLabel = null;
		this.releaseDateLabel = null;
		this.badgesPanel = null;
		this.ratingsPanel = null;
		this.downloadSizePanel = null;
		this.descriptionLabel = null;
		this.showHideAnimation = null;

		this.state = {
			dataItem: [],
			dataItemChanged: false
		};

		this.setAlphaAffectsVisibility(true);
		this.setAlpha(0);
		this.setGap(20);
	}

	get dataItem() {
		return this.state.dataItem;
	}

	set dataItem(value) {
		this.state.dataItem = value;
		this.state.dataItemChanged = true;

		this.invalidateProperties();
		this.requestLayout();
	}

	show(disableAnimation) {
		this.toggleVisibility(true, disableAnimation);
	}

	hide(disableAnimation) {
		this.toggleVisibility(false, disableAnimation);
	}

	toggleVisibility(visible, disableAnimation) {
		if(!this.showHideAnimation)
		{
			this.showHideAnimation = new BasicAnimation(this, "alpha", null);
			this.showHideAnimation.setDuration(Animations.ProductListItemInfoFadeDuration);
			this.showHideAnimation.setEasingFunction(Animations.ProductListItemInfoFadeEasing);
		}

		this.showHideAnimation.stop();
		this.showHideAnimation.setToValue(visible ? 1 : 0);
		this.showHideAnimation.play();
	}

	createChildren() {
		this.createTopPanel();
		this.createDescriptionLabel();
	}

	createTopPanel() {
		var topPanel = new StackPanel("top-panel");
		topPanel.setGap(8);
		topPanel.add(this.createTitleLabel());
		topPanel.add(this.createMetadataPanel());

		this.add(topPanel);
	}

	createDescriptionLabel() {
		this.descriptionLabel = new TextLabel("title-label", "x-small");
		this.descriptionLabel.setMaxWidth(840);
		this.descriptionLabel.setWordWrap(true);
		this.descriptionLabel.setHeight(160);
		this.descriptionLabel.setTextTrimming(TextTrimming.Word);
		this.descriptionLabel.setForeground(SolidColorBrush.white());

		this.add(this.descriptionLabel);
	}

	createTitleLabel() {
		this.titleLabel = new TextLabel("title-label", "large");
		this.titleLabel.setForeground(SolidColorBrush.white());

		return this.titleLabel;
	}

	createMetadataPanel() {
		var metadataPanel = new StackPanel("metadata-panel");
		metadataPanel.setOrientation(Orientation.Horizontal);
		metadataPanel.setGap(12);

		metadataPanel.add(this.createPriceLabel());
		metadataPanel.add(this.createBadgesPanel());
		metadataPanel.add(this.createReleaseDateLabel());
		metadataPanel.add(this.createRatingsPanel());
		metadataPanel.add(this.createDownloadSizePanel());

		return metadataPanel;
	}

	createPriceLabel() {
		this.priceLabel = new TextLabel("price-label", "x-small-medium");
		this.priceLabel.setVerticalAlignment(VerticalAlignment.Center);
		this.priceLabel.setForeground(SolidColorBrush.white());

		return this.priceLabel;
	}

	createBadgesPanel() {
		this.badgesPanel = new StackPanel("badges-panel");
		this.badgesPanel.setVerticalAlignment(VerticalAlignment.Center);
		this.badgesPanel.setOrientation(Orientation.Horizontal);
		this.badgesPanel.setGap(10);
		this.badgesPanel.add(new MetadataBadge("badge", MetadataBadgeType.Normal));

		return this.badgesPanel;
	}

	createReleaseDateLabel() {
		this.releaseDateLabel = new TextLabel("release-date-label", "x-small");
		this.releaseDateLabel.setVerticalAlignment(VerticalAlignment.Center);
		this.releaseDateLabel.setForeground(SolidColorBrush.fromColorHexWithAlpha("#ffffff", 0.7));

		return this.releaseDateLabel;
	}

	createRatingsPanel() {
		this.ratingsPanel = new StackPanel("ratings-panel");
		this.ratingsPanel.setOrientation(Orientation.Horizontal);
		this.ratingsPanel.setGap(10);

		var ratings = new StarRatings("ratings");
		ratings.ratingValue = 0;
		this.ratingsPanel.add(ratings);

		var lbl = new TextLabel("ratings-label", "x-small");
		lbl.setVerticalAlignment(VerticalAlignment.Center);
		lbl.setForeground(SolidColorBrush.fromColorHexWithAlpha("#ffffff", 0.7));
		lbl.setText("0 Ratings");
		this.ratingsPanel.add(lbl);

		return this.ratingsPanel;
	}

	createDownloadSizePanel() {
		this.downloadSizePanel = new StackPanel("download-size-panel");
		this.downloadSizePanel.setOrientation(Orientation.Horizontal);
		this.downloadSizePanel.setGap(20);

		var sep = new ShapeLine("sep");
		sep.setX1(0);
		sep.setY1(0);
		sep.setX2(0);
		sep.setY2(25);
		sep.setWidth(1);
		sep.setHeight(25);
		sep.setStroke(SolidColorBrush.fromColorHexWithAlpha("#ffffff", 0.7));
		sep.setStrokeThickness(1);
		sep.setVerticalAlignment(VerticalAlignment.Center);

		this.downloadSizePanel.add(sep);

		var lbl = new TextLabel("download-size-label", "x-small");
		lbl.setVerticalAlignment(VerticalAlignment.Center);
		lbl.setForeground(SolidColorBrush.fromColorHexWithAlpha("#ffffff", 0.7));
		lbl.setText("0MB Required");
		this.downloadSizePanel.add(lbl);

		return this.downloadSizePanel;
	}

	commitProperties() {
		super.commitProperties();

		if(this.state.dataItemChanged)
		{
			this.state.dataItemChanged = false;

			if(this.dataItem !== null)
			{
				this.titleLabel.setText(this.dataItem.title);
				this.priceLabel.setText(this.formatPrice(this.dataItem.price));
				this.releaseDateLabel.setText("Nov 17, 2015");
				this.descriptionLabel.setText(this.dataItem.description);

				this.updateRatings();
				this.updateDownloadSize();
				this.updateBadges();
			}
		}
	}

	updateRatings() {
		if(!this.dataItem.ratings)
		{
			this.ratingsPanel.setVisible(false);
			this.ratingsPanel.setIsLayoutVisible(false);
			return;
		}

		this.ratingsPanel.setVisible(true);
		this.ratingsPanel.setIsLayoutVisible(true);
		this.ratingsPanel.getAt(0).ratingValue = this.dataItem.ratings.stars;
		this.ratingsPanel.getAt(1).setText(this.dataItem.ratings.count + " Ratings");
	}

	updateDownloadSize() {
		this.downloadSizePanel.setVisible(this.dataItem.size !== 0);
		this.downloadSizePanel.setIsLayoutVisible(this.dataItem.size !== 0);
		this.downloadSizePanel.getAt(1).setText(this.formatBytes(this.dataItem.size) + " Required");
	}

	updateBadges() {
		var title = "";

		switch(this.dataItem.type)
		{
			case MockProductType.AddOn:
				title = "ADD-ON";
				break;
			case MockProductType.Bundle:
				title = "BUNDLE";
				break;
			case MockProductType.Game:
				title = "FULL GAME";
				break;
		}

		this.badgesPanel.getAt(0).title = title;
	}

	onFocusIn(event) {
		this.productList.focus();
	}

	formatPrice(value) {
		var n = value;
		var s = n < 0 ? "-" : "";
		var i = parseInt(n = Math.abs(+n || 0).toFixed(2)) + "";
		var j = (j = i.length) > 3 ? j % 3 : 0;

		return "$" + s + (j ? i.substr(0, j) + "," : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + ",") + "." + Math.abs(n - i).toFixed(2).slice(2);
	}

	formatBytes(bytes) {
		var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
		if (bytes == 0) return '0 Byte';
		var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));

		return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
	}
}

export default ProductListInfoPanel;
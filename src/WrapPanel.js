import Panel from "./Panel";

class WrapPanel extends Panel {
	constructor(name) {
		super(name);

		this.itemWidth = NaN;
		this.itemHeight = NaN;
		this.horizontalGap = 0;
		this.verticalGap = 0;
		this.orientation = Orientation.Horizontal;
		this.actualItemWidth = NaN;
		this.actualItemHeight = NaN;
	}

	getOrientation() {
		return this.orientation;
	}

	setOrientation(value) {
		if (this.orientation != value) {
			this.orientation = value;

			this.requestMeasure();
			this.requestLayout();
		}
	}

	getHorizontalGap() {
		return this.horizontalGap;
	}

	setHorizontalGap(value) {
		if (this.horizontalGap != value) {
			this.horizontalGap = value;

			this.requestMeasure();
			this.requestLayout();
		}
	}

	getVerticalGap() {
		return this.verticalGap;
	}

	setVerticalGap(value) {
		if (this.verticalGap != value) {
			this.verticalGap = value;

			this.requestMeasure();
			this.requestLayout();
		}
	}

	getItemWidth() {
		return this.itemWidth;
	}

	setItemWidth(value) {
		if (this.itemWidth != value) {
			this.itemWidth = value;
			this.requestMeasure();
		}
	}

	getItemHeight() {
		return this.itemHeight;
	}

	setItemHeight(value) {
		if (this.itemHeight != value) {
			this.itemHeight = value;
			this.requestMeasure();
		}
	}

	measure() {
		super.measure();

		// calculate the actual size of an item
		this.calculateActualItemSize();

		// measure at least to the actual item size
		var measuredWidth = this.actualItemWidth;
		var measuredHeight = this.actualItemHeight;
		var childCount = this.getCount();

		for (var i = 0, len = this.getCount(); i < len; ++i) {
			if (!this.getAt(i).getIsLayoutVisible()) {
				childCount--;
			}
		}

		if (childCount > 0) {
			var minor;
			var major = NaN;

			if (this.orientation == Orientation.Horizontal) {
				var exactWidth = this.getExactWidth();

				if (!isNaN(exactWidth)) {
					major = Math.floor((exactWidth + this.horizontalGap) / (this.actualItemWidth + this.horizontalGap));
				}
			}
			else {
				var exactHeight = this.getExactHeight();

				if (!isNaN(exactHeight)) {
					major = Math.floor((exactHeight + this.verticalGap) / (this.actualItemHeight + this.verticalGap));
				}
			}

			// we don't have an exact dimension so
			// use the square root of our child count
			if (isNaN(major)) {
				major = Math.ceil(Math.sqrt(childCount));
			}

			// make sure we have at least one item
			if (major < 1) {
				major = 1;
			}

			minor = Math.ceil(childCount / major);

			var xAxis = (this.orientation == Orientation.Horizontal ? major : minor);
			var yAxis = (this.orientation == Orientation.Horizontal ? minor : major);

			measuredWidth = xAxis * this.actualItemWidth + ((xAxis - 1) * this.horizontalGap);
			measuredHeight = yAxis * this.actualItemHeight + ((yAxis - 1) * this.verticalGap);
		}

		this.setMeasuredWidth(measuredWidth);
		this.setMeasuredHeight(measuredHeight);
	}

	layout(unscaledWidth, unscaledHeight) {
		super.layout(unscaledWidth, unscaledHeight);

		if (isNaN(this.actualItemWidth) || isNaN(this.actualItemHeight)) {
			this.calculateActualItemSize();
		}

		var xPos = 0;
		var xOffset = 0;
		var yPos = 0;
		var yOffset = 0;
		var child = null;
		var i, len;

		if (this.orientation == Orientation.Horizontal) {
			var xEnd = Math.ceil(unscaledWidth);

			for (i = 0, len = this.getCount(); i < len; ++i) {
				child = this.getAt(i);

				if (!child.getIsLayoutVisible()) {
					continue;
				}

				if ((xPos + this.actualItemWidth) > xEnd && xPos != 0) {
					xPos = 0;
					yPos += this.actualItemHeight + this.verticalGap;
				}

				this.updateChildSize(child);

				xOffset = Math.floor((this.actualItemWidth - child.getWidth()) * child.getHorizontalAlignment());
				yOffset = Math.floor((this.actualItemHeight - child.getHeight()) * child.getVerticalAlignment());

				child.setLayoutPosition(xPos + xOffset, yPos + yOffset);

				xPos += (this.actualItemWidth + this.horizontalGap);
			}
		}
		else {
			var yEnd = Math.ceil(unscaledHeight);

			for (i = 0, len = this.getCount(); i < len; ++i) {
				child = this.getAt(i);

				if (!child.getIsLayoutVisible()) {
					continue;
				}

				if ((yPos + this.actualItemHeight) > yEnd && yPos != 0) {
					xPos += this.actualItemWidth + this.horizontalGap;
					yPos = 0;
				}

				this.updateChildSize(child);

				xOffset = Math.floor((this.actualItemWidth - child.getWidth()) * child.getHorizontalAlignment());
				yOffset = Math.floor((this.actualItemHeight - child.getHeight()) * child.getVerticalAlignment());

				child.setLayoutPosition(xPos + xOffset, yPos + yOffset);

				yPos += (this.actualItemHeight + this.verticalGap);
			}
		}

		this.actualItemWidth = NaN;
		this.actualItemHeight = NaN;
	}

	updateChildSize(child) {
		var childWidth = child.getExactOrMeasuredWidth();
		var childExactWidth = child.getExactWidth();
		var childHeight = child.getExactOrMeasuredHeight();
		var childExactHeight = child.getExactHeight();

		if (isNaN(childExactWidth)) {
			childExactWidth = 0;
		}

		if (isNaN(childExactHeight)) {
			childExactHeight = 0;
		}

		if (!isNaN(child.getPercentWidth())) {
			childWidth = Math.min(this.actualItemWidth, this.actualItemWidth * (child.getPercentWidth() / 100));
		}
		else {
			if (childWidth > this.actualItemWidth) {
				childWidth = (childExactWidth > this.actualItemWidth ? childExactWidth : this.actualItemWidth);
			}
		}

		if (!isNaN(child.getPercentHeight())) {
			childHeight = Math.min(this.actualItemHeight, this.actualItemHeight * (child.getPercentHeight() / 100));
		}
		else {
			if (childHeight > this.actualItemHeight) {
				childHeight = (childExactHeight > this.actualItemHeight ? childExactHeight : this.actualItemHeight);
			}
		}

		child.setActualSize(childWidth, childHeight);
	}

	calculateActualItemSize() {
		var hasWidth = !isNaN(this.itemWidth);
		var hasHeight = !isNaN(this.itemHeight);

		// use the explicit item size
		if (hasWidth && hasHeight) {
			this.actualItemWidth = this.itemWidth;
			this.actualItemHeight = this.itemHeight;

			return;
		}

		// compute the max child size
		var maxWidth = 0;
		var maxHeight = 0;
		var child = null;

		for (var i = 0, len = this.getCount(); i < len; ++i) {
			child = this.getAt(i);

			if (!child.getIsLayoutVisible()) {
				continue;
			}

			maxWidth = Math.max(maxWidth, child.getExactOrMeasuredWidth());
			maxHeight = Math.max(maxHeight, child.getExactOrMeasuredHeight());
		}

		// use the explicit size (if one was set) otherwise use the max size
		this.actualItemWidth = (hasWidth ? this.itemWidth : maxWidth);
		this.actualItemHeight = (hasHeight ? this.itemHeight : maxHeight);
	}
}

export default WrapPanel;

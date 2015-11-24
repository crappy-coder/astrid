import Control from "./Control";

class ContentControl extends Control {
	constructor(name) {
		super(name);
	}

	getChild() {
		if (this.getCount() > 0) {
			return this.getAt(0);
		}

		return null;
	}

	setChild(value) {
		this.clear();
		this.add(value);

		this.requestMeasure();
		this.requestParentMeasureAndLayout();
		this.invalidateProperties();
	}

	getHasChild() {
		return (this.getCount() > 0);
	}

	measure() {
		super.measure();

		var thickness = this.getBorderThickness() * 2;
		var child = this.getChild();

		if (child != null && child.getIsLayoutVisible()) {
			var childMargin = child.getMargin();

			this.setMeasuredWidth(child.getExactOrMeasuredWidth() + childMargin.getLeft() + childMargin.getRight() + thickness);
			this.setMeasuredHeight(child.getExactOrMeasuredHeight() + childMargin.getTop() + childMargin.getBottom() + thickness);
		}
		else {
			this.setMeasuredWidth(thickness);
			this.setMeasuredHeight(thickness);
		}
	}

	layout(unscaledWidth, unscaledHeight) {
		var child = this.getChild();

		if (child != null && child.getIsLayoutVisible()) {
			super.layout(unscaledWidth, unscaledHeight);

			// contract the total size down to fit the border
			unscaledWidth -= (this.getBorderThickness() * 2);
			unscaledHeight -= (this.getBorderThickness() * 2);

			// compute initial child extents
			var childMargin = child.getMargin();
			var childX = child.getX() + childMargin.getLeft();
			var childY = child.getY() + childMargin.getTop();
			var childWidth = child.getExactOrMeasuredWidth();
			var childHeight = child.getExactOrMeasuredHeight();
			var childRightEdge = 0;
			var childBottomEdge = 0;

			// if child is using percentage based sizing, then compute
			// the actual size based on our actual size
			if (!isNaN(child.getPercentWidth())) {
				childWidth = unscaledWidth * (child.getPercentWidth() / 100);
				childRightEdge = childX + childWidth + childMargin.getRight();

				// if the position of the child plus the width extends
				// beyond the right edge, then we shrink it so it fits
				// up against the right edge.
				if (childRightEdge > unscaledWidth) {
					childWidth = unscaledWidth - (childX + childMargin.getRight());
				}
			}

			if (!isNaN(child.getPercentHeight())) {
				childHeight = unscaledHeight * (child.getPercentHeight() / 100);
				childBottomEdge = childY + childHeight + childMargin.getBottom();

				// if the position of the child plus the height extends
				// beyond the bottom edge, then we shrink it so it fits
				// up against the bottom edge.				
				if (childBottomEdge > unscaledHeight) {
					childHeight = unscaledHeight - (childY + childMargin.getBottom());
				}
			}

			// recompute the far right and bottom edges incase our original sizes
			// have changed from calculating the percentages
			childRightEdge = childX + childWidth + childMargin.getRight();
			childBottomEdge = childY + childHeight + childMargin.getBottom();

			// align the child according to it's alignment rules and adjust for
			// our border thickness
			childX += ((unscaledWidth - childRightEdge) * child.getHorizontalAlignment()) + this.getBorderThickness();
			childY += ((unscaledHeight - childBottomEdge) * child.getVerticalAlignment()) + this.getBorderThickness();

			// finalize the layout and size of our child
			child.setLayoutPosition(childX, childY);
			child.setActualSize(Math.max(0, childWidth), Math.max(0, childHeight));
		}
	}
}

export default ContentControl;

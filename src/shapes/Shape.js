import Drawable from "./../Drawable";
import PenLineCap from "./../PenLineCap";
import PenLineJoin from "./../PenLineJoin";
import DashStyle from "./../DashStyle";
import Rectangle from "./../Rectangle";
import { AreNotEqual } from "./../Engine";
import Pen from "./../Pen";

class Shape extends Drawable {
	constructor(name) {
		super(name);

		/** Brush **/
		this.fill = null;

		/** Brush **/
		this.stroke = null;

		/** Number **/
		this.strokeThickness = 0;

		/** PenLineCap **/
		this.strokeLineCap = PenLineCap.Flat;

		/** PenLineJoin **/
		this.strokeLineJoin = PenLineJoin.Miter;

		/** Number **/
		this.strokeMiterLimit = 10;

		/** PenLineCap **/
		this.strokeDashCap = PenLineCap.Flat;

		/** DashStyle **/
		this.strokeDashStyle = DashStyle.Solid;

		this.penCache = null;
		this.strokeMetrics = new Rectangle();
	}

	getFill() {
		return this.fill;
	}

	setFill(value) {
		if (AreNotEqual(this.fill, value)) {
			this.fill = value;
			this.requestLayout();
		}
	}

	getStroke() {
		return this.stroke;
	}

	setStroke(value) {
		if (AreNotEqual(this.stroke, value)) {
			this.stroke = value;
			this.invalidatePen();
		}
	}

	getStrokeThickness() {
		return this.strokeThickness;
	}

	setStrokeThickness(value) {
		if (this.strokeThickness != value) {
			this.strokeThickness = value;
			this.invalidatePen();
		}
	}

	getStrokeLineCap() {
		return this.strokeLineCap;
	}

	setStrokeLineCap(value) {
		if (this.strokeLineCap != value) {
			this.strokeLineCap = value;
			this.invalidatePen();
		}
	}

	getStrokeLineJoin() {
		return this.strokeLineJoin;
	}

	setStrokeLineJoin(value) {
		if (this.strokeLineJoin != value) {
			this.strokeLineJoin = value;
			this.invalidatePen();
		}
	}

	getStrokeMiterLimit() {
		return this.strokeMiterLimit;
	}

	setStrokeMiterLimit(value) {
		if (this.strokeMiterLimit != value) {
			this.strokeMiterLimit = value;
			this.invalidatePen();
		}
	}

	getStrokeDashCap() {
		return this.strokeDashCap;
	}

	setStrokeDashCap(value) {
		if (this.strokeDashCap != value) {
			this.strokeDashCap = value;
			this.invalidatePen();
		}
	}

	getStrokeDashStyle() {
		return this.strokeDashStyle;
	}

	setStrokeDashStyle(value) {
		if (this.strokeDashStyle != value) {
			this.strokeDashStyle = value;
			this.invalidatePen();
		}
	}

	getPen() {
		if (this.stroke == null || Math.abs(this.strokeThickness) == 0) {
			return null;
		}

		if (this.penCache == null) {
			this.penCache = new Pen(this.getStroke(), Math.abs(this.getStrokeThickness()));
			this.penCache.setLineCap(this.getStrokeLineCap());
			this.penCache.setLineJoin(this.getStrokeLineJoin());
			this.penCache.setMiterLimit(this.getStrokeMiterLimit());
			this.penCache.setDashStyle(this.getStrokeDashStyle());
			this.penCache.setDashCap(this.getStrokeDashCap());
		}

		return this.penCache;
	}

	invalidatePen() {
		this.penCache = null;
		this.requestMeasure();
		this.requestLayout();
	}

	getStrokeMetrics() {

		if (this.stroke == null || this.strokeThickness == 0) {
			this.strokeMetrics.x = 0;
			this.strokeMetrics.y = 0;
			this.strokeMetrics.width = 0;
			this.strokeMetrics.height = 0;
		}
		else {
			var thickness = this.strokeThickness;

			this.strokeMetrics.x = thickness * 0.5;
			this.strokeMetrics.y = thickness * 0.5;
			this.strokeMetrics.width = thickness;
			this.strokeMetrics.height = thickness;
		}

		return this.strokeMetrics;
	}

	layout(unscaledWidth, unscaledHeight) {
		super.layout(unscaledWidth, unscaledHeight);

		var gfx = this.getGraphics();
		var pen = this.getPen();

		// reset the graphics
		gfx.clear();

		// draw the shape, this should be overridden
		this.draw(gfx);

		// fill and stroke
		if (this.fill != null) {
			gfx.fill(this.fill);
		}

		if (pen != null) {
			gfx.stroke(pen);
		}
	}

	draw(gfx) {
		/** override **/
	}

	static computeLineBounds(x1, y1, x2, y2, thickness, lineCap) {
		var bounds = Rectangle.Zero();

		// vertical
		if (x1 == x2) {
			bounds.x = x1;
			bounds.y = Math.min(y1, y2) - (y1 < y2 && lineCap != PenLineCap.Flat ? thickness * 0.5 : 0) -
					(y1 >= y2 && lineCap != PenLineCap.Flat ? thickness * 0.5 : 0);
			bounds.width = thickness;
			bounds.height = Math.abs(y2 - y1) + (lineCap != PenLineCap.Flat ? thickness * 0.5 : 0) +
					(lineCap != PenLineCap.Flat ? thickness * 0.5 : 0);
		}

		// horizontal
		else if (y1 == y2) {
			bounds.x = Math.min(x1, x2) - (x1 < x2 && lineCap != PenLineCap.Flat ? thickness * 0.5 : 0) -
					(x1 >= x2 && lineCap != PenLineCap.Flat ? thickness * 0.5 : 0);
			bounds.y = y1 - thickness / 2;
			bounds.width = Math.abs(x2 - x1) + (lineCap != PenLineCap.Flat ? thickness * 0.5 : 0) +
					(lineCap != PenLineCap.Flat ? thickness * 0.5 : 0);
			bounds.height = thickness;
		}

		// diagonal
		else {
			var m = Math.abs((y1 - y2) / (x1 - x2));
			var dx = (Shape.UseExactBounds ? Math.sin(Math.atan(m)) * thickness : ((m > 1.0) ? thickness : thickness * m));
			var dy = (Shape.UseExactBounds ? Math.cos(Math.atan(m)) * thickness : ((m < 1.0) ? thickness : thickness / m));

			if (x1 < x2) {
				switch (lineCap) {
					case PenLineCap.Square:
						bounds.x = Math.min(x1, x2) - (dx + dy) * 0.5;
						break;
					case PenLineCap.Round:
						bounds.x = Math.min(x1, x2) - thickness * 0.5;
						break;
					case PenLineCap.Flat:
						bounds.x = Math.min(x1, x2) - dx * 0.5;
						break;
				}
			}
			else {
				switch (lineCap) {
					case PenLineCap.Square:
						bounds.x = Math.min(x1, x2) - (dx + dy) * 0.5;
						break;
					case PenLineCap.Round:
						bounds.x = Math.min(x1, x2) - thickness * 0.5;
						break;
					case PenLineCap.Flat:
						bounds.x = Math.min(x1, x2) - dx * 0.5;
						break;
				}
			}

			if (y1 < y2) {
				switch (lineCap) {
					case PenLineCap.Square:
						bounds.y = Math.min(y1, y2) - (dx + dy) * 0.5;
						break;
					case PenLineCap.Round:
						bounds.y = Math.min(y1, y2) - thickness * 0.5;
						break;
					case PenLineCap.Flat:
						bounds.y = Math.min(y1, y2) - dy * 0.5;
						break;
				}
			}
			else {
				switch (lineCap) {
					case PenLineCap.Square:
						bounds.y = Math.min(y1, y2) - (dx + dy) * 0.5;
						break;
					case PenLineCap.Round:
						bounds.y = Math.min(y1, y2) - thickness * 0.5;
						break;
					case PenLineCap.Flat:
						bounds.y = Math.min(y1, y2) - dy * 0.5;
						break;
				}
			}

			bounds.width = Math.abs(x2 - x1);
			bounds.height = Math.abs(y2 - y1);

			switch (lineCap) {
				case PenLineCap.Square:
					bounds.width += (dx + dy) * 0.5;
					bounds.height += (dx + dy) * 0.5;
					break;
				case PenLineCap.Round:
					bounds.width += thickness * 0.5;
					bounds.height += thickness * 0.5;
					break;
				case PenLineCap.Flat:
					bounds.width += dx * 0.5;
					bounds.height += dy * 0.5;
					break;
			}

			switch (lineCap) {
				case PenLineCap.Square:
					bounds.width += (dx + dy) * 0.5;
					bounds.height += (dx + dy) * 0.5;
					break;
				case PenLineCap.Round:
					bounds.width += thickness * 0.5;
					bounds.height += thickness * 0.5;
					break;
				case PenLineCap.Flat:
					bounds.width += dx * 0.5;
					bounds.height += dy * 0.5;
					break;
			}

		}

		return bounds;
	}
}

Shape.UseExactBounds = true;

export default Shape;

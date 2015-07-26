import Color from "./Color";
import Dictionary from "../Dictionary";
import GraphicsProcessor from "./GraphicsProcessor";
import Rectangle from "../Rectangle";
import Vector2D from "../Vector2D";
import Size from "../Size";
import ScaleTransform from "../transforms/ScaleTransform";
import Matrix2D from "../Matrix2D";
import { AreEqual, ValueOrDefault } from "../Engine";
import Pair from "../Pair";
import GraphicsOp from "./GraphicsOp";
import CompositeOperator from "./CompositeOperator";
import PathMoveSegment from "./PathMoveSegment";
import PathLineSegment from "./PathLineSegment";
import PathQuadraticBezierSegment from "./PathQuadraticBezierSegment";
import PathCubicBezierSegment from "./PathCubicBezierSegment";
import SweepDirection from "./SweepDirection";
import Graphics from "./Graphics";
import EngineMath from "../EngineMath";
import Stretch from "../ui/Stretch";
import PenLineCap from "../ui/PenLineCap";
import PenLineJoin from "../ui/PenLineJoin";

class GraphicsBaseClass {}
GraphicsBaseClass.prototype = new GraphicsNative;

var GraphicsBrushType = {
	"Unknown": 0,
	"Solid": 1,
	"Linear": 2,
	"Radial": 3,
	"Image": 4,
	"Video": 5
};

class Graphics extends GraphicsBaseClass {
	constructor(drawable) {
		this.drawable = drawable;
		this.offscreenSurface = null;
		this.offscreenStyleSurface = null;
		this.ops = [];
		this.lastOps = null;
		this.currentTextOp = null;
		this.currentPathItem = null;
		this.hasChangedSinceLastRender = true;
		this.cachedPatterns = new Dictionary();
		this.processor = new GraphicsProcessor();
		this.needsProcessing = false;
		this.tmpRect = new Rectangle(0, 0, 0, 0);
		this.tmpVect = new Vector2D(0, 0);
		this.tmpSize = new Size(0, 0);
		this.tmpScaleTransform = new ScaleTransform(0, 0);
		this.tmpTranslateTransform = new TranslateTransform(0, 0);
		this.tmpMatrix = new Matrix2D();
	}

	getHasChangedSinceLastRender() {
		// this has been cleared and since then no new operations have been added
		// so we report a change so the renderer can clear the context
		if (this.ops.length == 0 && (this.lastOps != null && this.lastOps.length > 0)) {
			return true;
		}

		return this.hasChangedSinceLastRender;
	}

	areOperationsEqual(opA, opB) {
		if (opA.getFirst() == opB.getFirst()) {
			var paramsA = opA.getSecond();
			var paramsB = opB.getSecond();

			return AreEqual(paramsA, paramsB);
		}

		return false;
	}

	pushOp(type /** ... **/) {
		var op = new Pair(type, []);

		for (var i = 1; i < arguments.length; i++) {
			op.getSecond().push(arguments[i]);
		}

		this.ops.push(op);

		// compare this op with the last operation (at the same index), if any
		// to check whether or not we have changed since the last batch. This
		// allows us to optimize bitmap caching and effects, if the user pushes
		// the exact same ops there is no need to re-render, which is generally
		// the standard way (i.e. each layout update, clear the graphics first)

		if (!this.hasChangedSinceLastRender) {
			var idx = this.ops.length - 1;
			var lastOp = null;

			if (this.lastOps != null && idx < this.lastOps.length) {
				lastOp = this.lastOps[idx];

				if (!this.areOperationsEqual(op, lastOp)) {
					this.hasChangedSinceLastRender = true;
				}
			}
			else {
				this.hasChangedSinceLastRender = true;
			}
		}

		if (this.hasChangedSinceLastRender) {
			this.needsProcessing = true;
			this.drawable.invalidate();
		}

		return this.ops.length - 1;
	}

	beginPath() {
		this.pushOp(GraphicsOp.BeginPath);
	}

	closePath() {
		this.pushOp(GraphicsOp.ClosePath);
	}

	fill(brush, compositeOp) {
		compositeOp = ValueOrDefault(compositeOp, CompositeOperator.SourceOver);

		this.drawable.registerGraphicsObject(brush);
		this.pushOp(GraphicsOp.Fill, this.createParamsFromBrush(brush), compositeOp);
	}

	stroke(pen, compositeOp) {
		compositeOp = ValueOrDefault(compositeOp, CompositeOperator.SourceOver);

		this.drawable.registerGraphicsObject(pen);
		this.pushOp(GraphicsOp.Stroke, this.createParamsFromPen(pen), compositeOp);
	}

	clear() {
		this.lastOps = this.ops;
		this.ops = [];
		this.needsProcessing = true;
		this.drawable.clearGraphicsObjects();
	}

	moveTo(x, y) {
		this.pushOp(GraphicsOp.MoveTo, new PathMoveSegment(x, y));
	}

	lineTo(x, y) {
		this.pushOp(GraphicsOp.LineTo, new PathLineSegment(x, y));
	}

	curveTo(cx, cy, x, y) {
		this.pushOp(GraphicsOp.CurveTo, new PathQuadraticBezierSegment(x, y, cx, cy));
	}

	cubicCurveTo(cx1, cy1, cx2, cy2, x, y) {
		this.pushOp(GraphicsOp.CubicCurveTo, new PathCubicBezierSegment(x, y, cx1, cy1, cx2, cy2));
	}

	arcTo(x, y, width, height, startAngle, sweepAngle, direction) {
		direction = ValueOrDefault(direction, SweepDirection.Clockwise);

		this.makeArcPath(x, y, width, height, startAngle, sweepAngle, direction, true);
	}

	drawOpenArc(x, y, width, height, startAngle, sweepAngle, direction, fromCenter) {
		direction = ValueOrDefault(direction, SweepDirection.Clockwise);
		fromCenter = ValueOrDefault(fromCenter, true);

		if (!fromCenter) {
			x += width * 0.5;
			y += height * 0.5;
		}

		this.beginPath();
		this.makeArcPath(x, y, width, height, startAngle, sweepAngle, direction, false);
	}

	drawArc(x, y, width, height, startAngle, sweepAngle, direction, fromCenter) {
		this.drawOpenArc(x, y, width, height, startAngle, sweepAngle, direction, fromCenter);
		this.closePath();
	}

	drawEllipse(x, y, width, height, isCenter) {
		isCenter = ValueOrDefault(isCenter, true);

		var radiusX = width * 0.5;
		var radiusY = height * 0.5;
		var centerX = x;
		var centerY = y;
		var kappa = Graphics.Kappa;

		if (!isCenter) {
			centerX += radiusX;
			centerY += radiusY;
		}

		this.beginPath();
		this.moveTo(centerX + radiusX, centerY);
		this.cubicCurveTo(centerX + radiusX, centerY - kappa * radiusY, centerX + kappa * radiusX, centerY -
				radiusY, centerX, centerY - radiusY);
		this.cubicCurveTo(centerX - kappa * radiusX, centerY - radiusY, centerX - radiusX, centerY -
				kappa * radiusY, centerX - radiusX, centerY);
		this.cubicCurveTo(centerX - radiusX, centerY + kappa * radiusY, centerX - kappa * radiusX, centerY +
				radiusY, centerX, centerY + radiusY);
		this.cubicCurveTo(centerX + kappa * radiusX, centerY + radiusY, centerX + radiusX, centerY +
				kappa * radiusY, centerX + radiusX, centerY);
		this.closePath();
	}

	drawCircle(x, y, radius, isCenter) {
		this.drawEllipse(x, y, radius * 2, radius * 2, isCenter);
	}

	drawImage(imageSource, x, y, width, height, repeat) {
		this.drawImageComplex(imageSource, 0, 0, imageSource.getWidth(), imageSource.getHeight(), x, y, width, height, repeat);
	}

	drawImageComplex(imageSource, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight, repeat) {
		dstX = ValueOrDefault(dstX, 0);
		dstY = ValueOrDefault(dstY, 0);
		dstWidth = ValueOrDefault(dstWidth, srcWidth);
		dstHeight = ValueOrDefault(dstHeight, srcHeight);
		repeat = ValueOrDefault(repeat, false);

		this.drawable.registerGraphicsObject(imageSource);

		if (repeat) {
			this.pushOp(GraphicsOp.TiledImage, imageSource, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight);
		}
		else {
			this.pushOp(GraphicsOp.Image, imageSource, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight);
		}
	}

	drawLine(x1, y1, x2, y2) {
		this.beginPath();
		this.moveTo(x1, y1);
		this.lineTo(x2, y2);
	}

	drawRect(x, y, width, height) {
		this.beginPath();
		this.moveTo(x, y);
		this.lineTo(x + width, y);
		this.lineTo(x + width, y + height);
		this.lineTo(x, y + height);
		this.closePath();
	}

	drawRoundRect(x, y, width, height, radius) {
		radius = ValueOrDefault(radius, 0);

		// not a rounded rectangle, just draw as a normal rectangle
		if (radius <= 0) {
			this.drawRect(x, y, width, height);
			return;
		}

		this.makeRoundRectPath(x, y, width, height, radius);
	}

	drawRoundRectComplex(x, y, width, height, cornerRadii) {
		// not a rounded rectangle, just draw as a normal rectangle
		if (cornerRadii.isSquare()) {
			this.drawRect(x, y, width, height);
			return;
		}

		this.makeRoundRectPathComplex(x, y, width, height, cornerRadii);
	}

	drawPoly(points, dontClosePath) {
		dontClosePath = ValueOrDefault(dontClosePath, false);

		var len = points.length;
		var pt = null;
		var isFirst = true;

		this.beginPath();

		for (var i = 0; i < len; ++i) {
			pt = points[i];

			if (isFirst) {
				this.moveTo(pt.x, pt.y);

				isFirst = false;
				continue;
			}

			this.lineTo(pt.x, pt.y);
		}

		if (!dontClosePath) {
			this.closePath();
		}
	}

	drawPath(path) {
		if (path == null || path.length == 0) {
			return;
		}

		var segment = null;
		var segments = path.segments;
		var len = segments.length;

		this.beginPath();

		for (var i = 0; i < len; ++i) {
			segment = segments[i];

			if (i == 0 && !(segment instanceof PathMoveSegment)) {
				this.moveTo(0, 0);
			}

			if (segment instanceof PathMoveSegment) {
				this.moveTo(segment.x, segment.y);
			}
			else if (segment instanceof PathLineSegment) {
				this.lineTo(segment.x, segment.y);
			}
			else if (segment instanceof PathQuadraticBezierSegment) {
				this.curveTo(segment.cx, segment.cy, segment.x, segment.y);
			}
			else if (segment instanceof PathCubicBezierSegment) {
				this.cubicCurveTo(segment.cx1, segment.cy1, segment.cx2, segment.cy2, segment.x, segment.y);
			}
		}
	}

	drawText(text, x, y, font) {
		this.pushOp(GraphicsOp.Text, text, x, y, font);
	}

	makeArcPath(x, y, width, height, startAngle, sweepAngle, direction, connectWithPrevOp) {
		var theta;
		var angle;
		var segmentCount;
		var angleH = 0;
		var tx = 0;
		var ty = 0;
		var cx = 0;
		var cy = 0;
		var rx = width * 0.5;
		var ry = height * 0.5;

		startAngle = EngineMath.degreesToRadians(startAngle);
		sweepAngle = EngineMath.degreesToRadians(sweepAngle);

		if (Math.abs(sweepAngle) > 2 * Math.PI) {
			sweepAngle = 2 * Math.PI;
		}

		sweepAngle *= direction;
		segmentCount = Math.ceil(Math.abs(sweepAngle) / (Math.PI * 0.25));
		theta = -(sweepAngle / segmentCount);
		angle = -startAngle;

		if (segmentCount > 0) {
			tx = x + Math.cos(startAngle) * rx;
			ty = y + Math.sin(-startAngle) * ry;

			if (connectWithPrevOp) {
				this.lineTo(tx, ty);
			}
			else {
				this.moveTo(tx, ty);
			}

			for (var i = 0; i < segmentCount; ++i) {
				angle += theta;
				angleH = angle - theta * 0.5;

				cx = x + Math.cos(angleH) * (rx / Math.cos(theta * 0.5));
				cy = y + Math.sin(angleH) * (ry / Math.cos(theta * 0.5));

				tx = x + Math.cos(angle) * rx;
				ty = y + Math.sin(angle) * ry;

				this.curveTo(cx, cy, tx, ty);
			}
		}
	}

	makeRoundRectPath(x, y, width, height, radius) {
		var arcSize = radius * 2;

		this.beginPath();
		this.arcTo(x + width - radius, y + radius, arcSize, arcSize, 90, 90);
		this.arcTo(x + width - radius, y + height - radius, arcSize, arcSize, 0, 90);
		this.arcTo(x + radius, y + height - radius, arcSize, arcSize, 270, 90);
		this.arcTo(x + radius, y + radius, arcSize, arcSize, 180, 90);
		this.closePath();
	}

	makeRoundRectPathComplex(x, y, width, height, cornerRadius) {
		var xw = x + width;
		var yh = y + height;
		var minSize = (width < height ? width * 2 : height * 2);
		var tl = cornerRadius.getTopLeft();
		var tr = cornerRadius.getTopRight();
		var bl = cornerRadius.getBottomLeft();
		var br = cornerRadius.getBottomRight();
		var a, s;
		var ac = 0.292893218813453;
		var sc = 0.585786437626905;

		tl = (tl < minSize ? tl : minSize);
		tr = (tr < minSize ? tr : minSize);
		bl = (bl < minSize ? bl : minSize);
		br = (br < minSize ? br : minSize);

		this.beginPath();

		// bottom right
		a = br * ac;
		s = br * sc;

		this.moveTo(xw, yh - br);
		this.curveTo(xw, yh - s, xw - a, yh - a);
		this.curveTo(xw - s, yh, xw - br, yh);

		// bottom left
		a = bl * ac;
		s = bl * sc;
		this.lineTo(x + bl, yh);
		this.curveTo(x + s, yh, x + a, yh - a);
		this.curveTo(x, yh - s, x, yh - bl);

		// top left
		a = tl * ac;
		s = tl * sc;
		this.lineTo(x, y + tl);
		this.curveTo(x, y + s, x + a, y + a);
		this.curveTo(x + s, y, x + tl, y);

		// top right
		a = tr * ac;
		s = tr * sc;
		this.lineTo(xw - tr, y);
		this.curveTo(xw - s, y, xw - a, y + a);
		this.curveTo(xw, y + s, xw, y + tr);
		this.lineTo(xw, yh - br);

		this.closePath();
	}

	render(ctx) {
		this.hasChangedSinceLastRender = false;
	}

	renderAlphaMask(ctx, maskBrush, width, height) {
	}

	processIfNeeded() {
	}

	getBounds() {
		return this.tmpRect;
	}

	getStrokeBounds() {
		return this.tmpRect;
	}

	beginPathImpl(ctx) {
	}

	closePathImpl(ctx) {
	}

	moveToImpl(ctx, segment) {
	}

	lineToImpl(ctx, segment) {
	}

	quadraticCurveToImpl(ctx, segment) {
	}

	bezierCurveToImpl(ctx, segment) {
	}

	drawImageImpl(ctx, imageSource, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight, repeat) {
	}

	drawTextImpl(ctx, boundsRect, fillOp, strokeOp, text, x, y, font) {
	}

	fillImpl(ctx, boundsRect, brushParams, compositeOp, forText) {
	}

	fillText(ctx) {
	}

	strokeImpl(ctx, boundsRect, penParams, compositeOp, forText) {
	}

	strokeText(ctx) {
	}

	/** Pen Parameters **/
	createParamsFromPen(pen) {
	}

	/** Brush Parameters **/
	createParamsFromBrush(brush) {
	}

	createParamsFromSolidColorBrush(brush) {
	}

	createParamsFromGradientBrush(brush) {
	}

	createParamsFromLinearGradientBrush(brush) {
	}

	createParamsFromRadialGradientBrush(brush) {
	}

	createParamsFromImageBrush(brush) {
	}

	createParamsFromVideoBrush(brush) {
	}

	/** Brush Styles **/
	createStyleFromBrush(ctx, boundsRect, brushParams, isStroking) {
	}

	createStyleFromSolidColorBrush(brushParams) {
	}

	createStyleFromLinearGradientBrush(ctx, boundsRect, brushParams, isStroking) {
	}

	// TODO : for some reason, this fails when the start/end radius and points are lowered or increased,
	//        the results fail differently in IE and FF so something is def wrong with the below
	createStyleFromRadialGradientBrush(ctx, boundsRect, brushParams, isStroking) {
	}

	//***********************************************************************************************
	// TODO : need to cache image patterns, more likely than not, these patterns will not change in
	//        subsequent renders so caching them can dramatically speed up performance, especially
	//        when animating. But, it get's a bit complex because strokes have a intermediate stage
	//        where it renders to a offscreen canvas first, which is then used to create that pattern,
	//        so if a transform changes, then the cache would be invalidated. Fills are much more easy,
	//        the pattern could just be cached based on the url because any transforms are applied
	//        directly to the source context, we don't get the wierdness with fills as we do with the
	//        strokes.
	//***********************************************************************************************
	createStyleFromImageBrush(ctx, boundsRect, brushParams, isStroking) {
	}

	createStyleFromVideoBrush(ctx, boundsRect, brushParams, isStroking) {
	}

	createFallbackStyle() {
		return Color.Transparent.toRGBAString();
	}

	createBrushStylePattern(ctx, sourceElement, brushMatrix, patternSize, isStroking) {
	}

	createBrushPatternSource(sourceElement, xform, width, height) {
	}

	/** Other **/
	makeBrushStyleMatrix(brushMatrix, patternPosition, patternSize, sourceWidth, sourceHeight, isStroking) {
	}

	computePatternSize(stretch, boundsRect, sourceWidth, sourceHeight) {
		var scaleX = boundsRect.width / sourceWidth;
		var scaleY = boundsRect.height / sourceHeight;
		var minScale = Math.min(scaleX, scaleY);
		var maxScale = Math.max(scaleX, scaleY);

		switch (stretch) {
			case Stretch.Uniform:
				scaleX = minScale;
				scaleY = minScale;
				break;
			case Stretch.UniformToFill:
				scaleX = maxScale;
				scaleY = maxScale;
				break;
			case Stretch.Fill:
				break;
			case Stretch.None:
				scaleX = scaleY = 1;
				break;
		}

		this.tmpSize.width = (sourceWidth * scaleX);
		this.tmpSize.height = (sourceHeight * scaleY);

		return this.tmpSize;
	}

	computePatternPosition(horizontalAlignment, verticalAlignment, patternSize, dstWidth, dstHeight) {
		this.tmpVect.x = (dstWidth - patternSize.width) * horizontalAlignment;
		this.tmpVect.y = (dstHeight - patternSize.height) * verticalAlignment;

		return this.tmpVect;
	}

	dashCurrentPath(ctx, dashStyle, lineWidth, dashCap, lineCap) {
		return false;
	}

	flattenCurrentPath() {
	}

	getMustSaveContextForBrush(brushParams) {
		return false;
	}

	setContextTransform(ctx, mx) {
	}

	getLineCapString(penLineCap) {
		switch (penLineCap) {
			case PenLineCap.Round:
				return "round";
			case PenLineCap.Square:
				return "square";
		}

		return "butt";
	}

	getLineJoinString(penLineJoin) {
		switch (penLineJoin) {
			case PenLineJoin.Bevel:
				return "bevel";
			case PenLineJoin.Round:
				return "round";
		}

		return "miter";
	}

	getCompositeOperatorString(compositeOp) {
		switch (compositeOp) {
			case CompositeOperator.Clear:
				return "clear";
			case CompositeOperator.SourceIn:
				return "source-in";
			case CompositeOperator.SourceOut:
				return "source-out";
			case CompositeOperator.SourceAtop:
				return "source-atop";
			case CompositeOperator.DestinationOver:
				return "destination-over";
			case CompositeOperator.DestinationIn:
				return "destination-in";
			case CompositeOperator.DestinationOut:
				return "destination-out";
			case CompositeOperator.DestinationAtop:
				return "destination-atop";
			case CompositeOperator.Xor:
				return "xor";
			case CompositeOperator.Copy:
				return "copy";
		}

		return "source-over";
	}
}

export default Graphics;

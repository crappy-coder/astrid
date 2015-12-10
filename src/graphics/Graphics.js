import GraphicsOp from "./GraphicsOp"
import GraphicsBrushType from "./GraphicsBrushType"
import GraphicsProcessor from "./GraphicsProcessor"
import CompositeOperator from "./CompositeOperator"
import SweepDirection from "./SweepDirection"
import PathMoveSegment from "./PathMoveSegment"
import PathLineSegment from "./PathLineSegment"
import PathQuadraticBezierSegment from "./PathQuadraticBezierSegment"
import PathCubicBezierSegment from "./PathCubicBezierSegment"
import Color from "./Color"
import Line from "../Line"
import Rectangle from "../Rectangle"
import Pair from "../Pair"
import Size from "../Size"
import Matrix2D from "../Matrix2D"
import Vector2D from "../Vector2D"
import SolidColorBrush from "../brushes/SolidColorBrush"
import LinearGradientBrush from "../brushes/LinearGradientBrush"
import RadialGradientBrush from "../brushes/RadialGradientBrush"
import ImageBrush from "../brushes/ImageBrush"
import VideoBrush from "../brushes/VideoBrush"
import Stretch from "../ui/Stretch"
import PenLineCap from "../ui/PenLineCap"
import PenLineJoin from "../ui/PenLineJoin"
import Debug from "../Debug"

class Graphics {
	constructor(drawable) {
		this.drawable = drawable;
		this.ops = [];
		this.lastOps = null;
		this.lastBounds = new Rectangle(0, 0, 0, 0);
		this.processor = new GraphicsProcessor();
		this.hasChangedSinceLastRender = true;
		this.needsProcessing = false;

		this.tmpRect = new Rectangle(0, 0, 0, 0);
		this.tmpVect = new Vector2D(0, 0);
		this.tmpSize = new Size(0, 0);
		this.tmpMatrix = new Matrix2D();
	}

	get bounds() {
		this.processIfNeeded();

		if (this.processor.strokedBounds !== null) {
			return this.processor.strokedBounds;
		}

		return this.processor.bounds;
	}

	pushOp(type /** [p1, [p2, [...]]] **/) {
		var op = new Pair(type, []);

		for (var i = 1; i < arguments.length; i++) {
			op.getSecond().push(arguments[i]);
		}

		this.ops.push(op);
	}

	beginPath() {
		this.pushOp(GraphicsOp.BeginPath);
	}

	closePath() {
		this.pushOp(GraphicsOp.ClosePath);
	}

	fill(brush, compositeOp) {
		compositeOp = astrid.valueOrDefault(compositeOp, CompositeOperator.SourceOver);

		this.drawable.registerGraphicsObject(brush);
		this.pushOp(GraphicsOp.Fill, this.createParamsFromBrush(brush), compositeOp);
	}

	stroke(pen, compositeOp) {
		compositeOp = astrid.valueOrDefault(compositeOp, CompositeOperator.SourceOver);

		this.drawable.registerGraphicsObject(pen);
		this.pushOp(GraphicsOp.Stroke, this.createParamsFromPen(pen), compositeOp);
	}

	clear() {
		this.lastOps = this.ops;
		this.ops = [];
		this.needsProcessing = true;
		this.hasChangedSinceLastRender = true;
		this.drawable.clearGraphicsObjects();
		this.drawable.invalidate();
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
		direction = astrid.valueOrDefault(direction, SweepDirection.Clockwise);

		this.makeArcPath(x, y, width, height, startAngle, sweepAngle, direction, true);
	}

	drawOpenArc(x, y, width, height, startAngle, sweepAngle, direction, fromCenter) {
		direction = astrid.valueOrDefault(direction, SweepDirection.Clockwise);
		fromCenter = astrid.valueOrDefault(fromCenter, true);

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
		isCenter = astrid.valueOrDefault(isCenter, true);

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

	drawImage(imageSource, x, y, width, height, repeat, matrix) {
		this.drawImageComplex(imageSource, 0, 0, imageSource.getWidth(), imageSource.getHeight(), x, y, width, height, repeat, matrix);
	}

	drawImageComplex(imageSource, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight, repeat, matrix) {
		dstX = astrid.valueOrDefault(dstX, 0);
		dstY = astrid.valueOrDefault(dstY, 0);
		dstWidth = astrid.valueOrDefault(dstWidth, srcWidth);
		dstHeight = astrid.valueOrDefault(dstHeight, srcHeight);
		repeat = astrid.valueOrDefault(repeat, false);

		// identity matrices still have an overhead of transformations
		// and state changes, so skip omit these
		if (matrix != null && matrix.isIdentity()) {
			matrix = null;
		}

		// make sure we don't use the object reference, otherwise
		// a user will need to pass in a new matrix everytime.
		if (matrix != null) {
			matrix = matrix.copy();
		}

		if (repeat) {
			this.pushOp(GraphicsOp.TiledImage, imageSource, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight, matrix);
		} else {
			this.pushOp(GraphicsOp.Image, imageSource, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight, matrix);
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
		radius = astrid.valueOrDefault(radius, 0);

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
		dontClosePath = astrid.valueOrDefault(dontClosePath, false);

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
			} else if (segment instanceof PathLineSegment) {
				this.lineTo(segment.x, segment.y);
			} else if (segment instanceof PathQuadraticBezierSegment) {
				this.curveTo(segment.cx, segment.cy, segment.x, segment.y);
			} else if (segment instanceof PathCubicBezierSegment) {
				this.cubicCurveTo(segment.cx1, segment.cy1, segment.cx2, segment.cy2, segment.x, segment.y);
			}
		}
	}

	drawText(text, x, y, font) {
		this.pushOp(GraphicsOp.Text, text, x, y, font);
	}

	makeArcPath(x, y, width, height, startAngle, sweepAngle, direction, connectWithPrevOp) {
		var theta = 0;
		var angle = 0;
		var angleH = 0;
		var segmentCount = 0;
		var tx = 0;
		var ty = 0;
		var cx = 0;
		var cy = 0;
		var rx = width * 0.5;
		var ry = height * 0.5;

		startAngle = astrid.math.degreesToRadians(startAngle);
		sweepAngle = astrid.math.degreesToRadians(sweepAngle);

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
			} else {
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

	update(ctx) {
		// process the operations if needed, this will optimize the draw operations
		// as well as compute the actual rendering bounds
		this.processIfNeeded();

		// reset dirty flag
		this.hasChangedSinceLastRender = false;

		// nothing to do
		if (this.processor.items.length == 0) {
			return;
		}

		// perform the render
		this.beginRender(ctx);
		this.render(ctx);
		this.endRender(ctx);
	}

	beginRender(ctx) {
	}

	endRender(ctx) {
	}

	render(ctx) {
	}

	renderAlphaMask(ctx, maskBrush, width, height) {
	}

	processIfNeeded() {
		if (!this.needsProcessing) {
			return;
		}

		this.processor.process(this.ops, this.drawable);
		this.needsProcessing = false;
	}

	setContextTransform(ctx, mx) {
		ctx.transform(mx.m11, mx.m12, mx.m21, mx.m22, mx.offsetX, mx.offsetY);
	}

	/** Pen Parameters **/
	createParamsFromPen(pen) {
		if (pen == null || pen.getBrush() == null) {
			return null;
		}

		return [pen.getThickness(),
						pen.getMiterLimit(),
						this.getLineJoinString(pen.getLineJoin()),
						this.getLineCapString(pen.getLineCap()),
						this.createParamsFromBrush(pen.getBrush()),
						pen.getDashStyle(),
						this.getLineCapString(pen.getDashCap())];
	}


	/** Brush Parameters **/

	createParamsFromBrush(brush) {
		if (brush == null) {
			return null;
		}

		var params = null;

		if (brush instanceof SolidColorBrush) {
			params = this.createParamsFromSolidColorBrush(brush);
		} else if (brush instanceof LinearGradientBrush) {
			params = this.createParamsFromLinearGradientBrush(brush);
		} else if (brush instanceof RadialGradientBrush) {
			params = this.createParamsFromRadialGradientBrush(brush);
		} else if (brush instanceof ImageBrush) {
			params = this.createParamsFromImageBrush(brush);
		} else if (brush instanceof VideoBrush) {
			params = this.createParamsFromVideoBrush(brush);
		} else {
			Debug.warn("DefaultGraphics.createParamsFromBrush() found an unknown brush type.");

			// the brush is unknown so just return a solid type with the fallback color
			params = [GraphicsBrushType.Solid, this.createFallbackStyle()];
			params.push(1); 	// opacity
			params.push(null); 	// matrix

			return params;
		}

		params.push(brush.getOpacity());

		if (brush.getTransform() != null) {
			params.push(brush.getTransform().getValue());
		} else {
			params.push(null);
		}

		return params;
	}

	createParamsFromSolidColorBrush(brush) {
		return [GraphicsBrushType.Solid, brush.getColor().toRGBAString()];
	}

	createParamsFromGradientBrush(brush) {
		var len = brush.getColorStopCount();
		var stop = null;
		var stops = [];

		for (var i = 0; i < len; ++i) {
			stop = brush.getColorStop(i);
			stops.push([stop.getColor().toRGBAString(), stop.getOffset()]);
		}

		return stops;
	}

	createParamsFromLinearGradientBrush(brush) {
		return [GraphicsBrushType.Linear,
						brush.getStartPoint().x,
						brush.getStartPoint().y,
						brush.getEndPoint().x,
						brush.getEndPoint().y,
						this.createParamsFromGradientBrush(brush)];
	}

	createParamsFromRadialGradientBrush(brush) {
		return [GraphicsBrushType.Radial,
						brush.getStartPoint().x,
						brush.getStartPoint().y,
						brush.getStartRadius(),
						brush.getEndPoint().x,
						brush.getEndPoint().y,
						brush.getEndRadius(),
						this.createParamsFromGradientBrush(brush)];
	}

	createParamsFromImageBrush(brush) {
		if (!brush.getIsAvailable()) {
			return [GraphicsBrushType.Solid, this.createFallbackStyle()];
		}

		return [GraphicsBrushType.Image,
						brush.texture.getSize().width,
						brush.texture.getSize().height,
						brush.texture.getNativeData(),
						brush.getSourceUrl(),
						brush.getStretch(),
						brush.getHorizontalAlignment(),
						brush.getVerticalAlignment()];
	}

	createParamsFromVideoBrush(brush) {
		if (!brush.getIsAvailable()) {
			return [GraphicsBrushType.Solid, this.createFallbackStyle()];
		}

		var naturalSize = brush.getNaturalSize();

		return [GraphicsBrushType.Video,
						naturalSize.width,
						naturalSize.height,
						brush.getSourceElement(),
						brush.getCurrentPosition(),
						brush.getStretch(),
						brush.getHorizontalAlignment(),
						brush.getVerticalAlignment()];
	}

	/** Brush Styles **/

	createStyleFromBrush(ctx, boundsRect, brushParams, isStroking) {
		var type = brushParams[0];

		switch (type) {
		case GraphicsBrushType.Solid:
			return this.createStyleFromSolidColorBrush(brushParams);
		case GraphicsBrushType.Linear:
			return this.createStyleFromLinearGradientBrush(ctx, boundsRect, brushParams, isStroking);
		case GraphicsBrushType.Radial:
			return this.createStyleFromRadialGradientBrush(ctx, boundsRect, brushParams, isStroking);
		case GraphicsBrushType.Image:
			return this.createStyleFromImageBrush(ctx, boundsRect, brushParams, isStroking);
		case GraphicsBrushType.Video:
			return this.createStyleFromVideoBrush(ctx, boundsRect, brushParams, isStroking);
		}

		Debug.warn("DefaultGraphics.fill() found an unknown brush type. " + type);

		return this.createFallbackStyle();
	}

	createStyleFromSolidColorBrush(brushParams) {
		return brushParams[1];
	}

	createStyleFromLinearGradientBrush(ctx, boundsRect, brushParams, isStroking) {
		var startX = brushParams[1];
		var startY = brushParams[2];
		var endX = brushParams[3];
		var endY = brushParams[4];
		var stops = brushParams[5];
		var xform = brushParams[7];
		var len = stops.length;
		var stop = null;
		var rect = boundsRect;

		// pre-transform start/end points
		startX = rect.x + (startX * rect.width);
		startY = rect.y + (startY * rect.height);
		endX = rect.x + (endX * rect.width);
		endY = rect.y + (endY * rect.height);

		if (xform != null) {
			// transform the start point
			this.tmpVect.x = startX;
			this.tmpVect.y = startY;
			this.tmpVect = xform.transformPoint(this.tmpVect);

			startX = this.tmpVect.x;
			startY = this.tmpVect.y;


			// transform the end point
			this.tmpVect.x = endX;
			this.tmpVect.y = endY;
			this.tmpVect = xform.transformPoint(this.tmpVect);

			endX = this.tmpVect.x;
			endY = this.tmpVect.y;
		}

		var pattern = ctx.createLinearGradient(startX, startY, endX, endY);

		for (var i = 0; i < len; ++i) {
			stop = stops[i];

			pattern.addColorStop(stop[1], stop[0]);
		}

		return pattern;
	}

	// TODO : for some reason, this fails when the start/end radius and points are lowered or increased,
	//        the results fail differently in IE and FF so something is def wrong with the below

	createStyleFromRadialGradientBrush(ctx, boundsRect, brushParams, isStroking) {
		var startX = brushParams[1];
		var startY = brushParams[2];
		var startRadius = brushParams[3];
		var endX = brushParams[4];
		var endY = brushParams[5];
		var endRadius = brushParams[6];
		var stops = brushParams[7];
		var xform = brushParams[9];
		var len = stops.length;
		var stop = null;
		var rect = boundsRect;

		if (xform != null) {
			rect = xform.transformRect(rect);
		}
		/*
		 console.log(
		 rect.x + (startX * rect.width),
		 rect.y + (startY * rect.height),
		 startRadius * Math.max(rect.width, rect.height),
		 rect.x + (endX * rect.width),
		 rect.y + (endY * rect.height),
		 endRadius * Math.max(rect.width, rect.height));
		 */
		var pattern = ctx.createRadialGradient(
			/** start point / radius **/
			rect.x + (startX * rect.width),
			rect.y + (startY * rect.height),
			startRadius * Math.max(rect.width, rect.height),

			/** end point / radius **/
			rect.x + (endX * rect.width),
			rect.y + (endY * rect.height),
			endRadius * Math.max(rect.width, rect.height));

		for (var i = 0; i < len; ++i) {
			stop = stops[i];

			pattern.addColorStop(stop[1], stop[0]);
		}

		return pattern;
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
		var sourceWidth = brushParams[1];
		var sourceHeight = brushParams[2];
		var nativeData = brushParams[3];
		var sourceUrl = brushParams[4].toLowerCase();
		var stretch = brushParams[5];
		var horizontalAlignment = brushParams[6];
		var verticalAlignment = brushParams[7];
		var xform = brushParams[9];
		var patternSize = this.computePatternSize(stretch, boundsRect, sourceWidth, sourceHeight);
		var patternPosition = this.computePatternPosition(horizontalAlignment, verticalAlignment, patternSize, boundsRect);
		var pattern = this.createBrushStylePattern(ctx, nativeData, xform, patternSize, isStroking);

		this.setContextTransform(ctx, this.makeBrushStyleMatrix(xform, patternPosition, patternSize, sourceWidth, sourceHeight, isStroking));

		return pattern;
	}

	createStyleFromVideoBrush(ctx, boundsRect, brushParams, isStroking) {
		var sourceWidth = brushParams[1];
		var sourceHeight = brushParams[2];
		var sourceElement = brushParams[3];
		var stretch = brushParams[5];
		var horizontalAlignment = brushParams[6];
		var verticalAlignment = brushParams[7];
		var xform = brushParams[9];
		var patternSize = this.computePatternSize(stretch, boundsRect, sourceWidth, sourceHeight);
		var patternPosition = this.computePatternPosition(horizontalAlignment, verticalAlignment, patternSize, boundsRect);
		var pattern = this.createBrushStylePattern(ctx, sourceElement, xform, patternSize, isStroking);

		this.setContextTransform(ctx, this.makeBrushStyleMatrix(xform, patternPosition, patternSize, sourceWidth, sourceHeight, isStroking));

		return pattern;
	}

	createFallbackStyle() {
		return Color.Transparent.toRGBAString();
	}

	createBrushStylePattern(ctx, sourceElement, brushMatrix, patternSize, isStroking) {
		// for strokes with a pattern, we must do some intermediate drawing
		if (isStroking) {
			return ctx.createPattern(this.createBrushPatternSource(sourceElement, brushMatrix, patternSize.width, patternSize.height), "no-repeat");
		}

		return ctx.createPattern(sourceElement, "no-repeat");
	}

	createBrushPatternSource(sourceElement, xform, width, height) {
		// create the offscreen surface that we will use to render the source style
		// into, strokes with a video and texture need to first be rendered into a
		// seperate surface that can then be used as the final source when creating
		// the pattern, otherwise if we scale the stroke itself it will end up looking
		// like ass, this produces a much better and accurate stroke
		if (this.offscreenStyleSurface == null) {
			this.offscreenStyleSurface = document.createElement("canvas");
		}

		var surfaceWidth = width;
		var surfaceHeight = height;
		var alignX = 0;
		var alignY = 0;

		// if the brush has a transform, we need to run that transform here
		if (xform != null) {
			this.tmpRect = xform.transformRect(new Rectangle(0, 0, width, height));

			// re-align so that the source is drawn at 0,0
			alignX = -this.tmpRect.x;
			alignY = -this.tmpRect.y;

			// get the post-transform size
			surfaceWidth = this.tmpRect.width;
			surfaceHeight = this.tmpRect.height;
		}

		// round the dimensions to whole numbers
		this.offscreenStyleSurface.width = astrid.math.round(surfaceWidth);
		this.offscreenStyleSurface.height = astrid.math.round(surfaceHeight);

		var ctx = this.offscreenStyleSurface.getContext("2d");

		if (xform != null) {
			ctx.setTransform(xform.m11, xform.m12, xform.m21, xform.m22, xform.offsetX + alignX, xform.offsetY + alignY);
		}

		ctx.drawImage(sourceElement, 0, 0, width, height);

		return this.offscreenStyleSurface;
	}

	/** Other **/

	makeBrushStyleMatrix(brushMatrix, patternPosition, patternSize, sourceWidth, sourceHeight, isStroking) {
		this.tmpMatrix.setIdentity();

		if (brushMatrix != null) {
			if (isStroking) {
				this.tmpRect = brushMatrix.transformRect(new Rectangle(patternPosition.x, patternPosition.y, patternSize.width, patternSize.height));
				this.tmpMatrix.translate(this.tmpRect.x, this.tmpRect.y);
			}
			else {
				this.tmpMatrix.scale(patternSize.width / sourceWidth, patternSize.height / sourceHeight);
				this.tmpMatrix.translate(patternPosition.x, patternPosition.y);
				this.tmpMatrix.append(brushMatrix);
			}
		}
		else {
			if (!isStroking) {
				this.tmpMatrix.scale(patternSize.width / sourceWidth, patternSize.height / sourceHeight);
			}

			this.tmpMatrix.translate(patternPosition.x, patternPosition.y);
		}

		return this.tmpMatrix;
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

	computePatternPosition(horizontalAlignment, verticalAlignment, patternSize, dstRect) {
		this.tmpVect.x = dstRect.x + ((dstRect.width - patternSize.width) * horizontalAlignment);
		this.tmpVect.y = dstRect.y + ((dstRect.height - patternSize.height) * verticalAlignment);

		return this.tmpVect;
	}

	getMustSaveContextForBrush(brushParams) {
		return (brushParams[brushParams.length - 1] !== null || brushParams[0] === GraphicsBrushType.Image || brushParams[0] === GraphicsBrushType.Video);
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
			case CompositeOperator.SourceATop:
				return "source-atop";
			case CompositeOperator.DestinationOver:
				return "destination-over";
			case CompositeOperator.DestinationIn:
				return "destination-in";
			case CompositeOperator.DestinationOut:
				return "destination-out";
			case CompositeOperator.DestinationATop:
				return "destination-atop";
			case CompositeOperator.XOr:
				return "xor";
			case CompositeOperator.Copy:
				return "copy";
		}

		return "source-over";
	}
}

Graphics.Kappa = 0.5522847498307933;
Graphics.MiterJointAccuracy = 1.0E-9;

export default Graphics;

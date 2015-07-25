import Rectangle from "./Rectangle";
import GraphicsProcessor from "./GraphicsProcessor";
import Dictionary from "./Dictionary";
import Vector2D from "./math/Vector2D";
import Size from "./Size";
import ScaleTransform from "./transforms/ScaleTransform";
import TranslateTransform from "./transforms/TranslateTransform";
import Matrix2D from "./math/Matrix2D";
import Pair from "./Pair";
import GraphicsOp from "./GraphicsOp";
import CompositeOperator from "./CompositeOperator";
import { ValueOrDefault, DebugWrite, DebugLevel } from "./Engine";
import PathMoveSegment from "./PathMoveSegment";
import PathLineSegment from "./PathLineSegment";
import PathQuadraticBezierSegment from "./PathQuadraticBezierSegment";
import PathCubicBezierSegment from "./PathCubicBezierSegment";
import SweepDirection from "./SweepDirection";
import EngineMath from "./math/EngineMath";
import { GraphicsImageItem } from "./GraphicsProcessor";
import VideoSource from "./media/VideoSource";
import DashStyle from "./DashStyle";
import SolidColorBrush from "./brushes/SolidColorBrush";
import LinearGradientBrush from "./brushes/LinearGradientBrush";
import RadialGradientBrush from "./brushes/RadialGradientBrush";
import ImageBrush from "./brushes/ImageBrush";
import VideoBrush from "./brushes/VideoBrush";
import Color from "./color/Color";
import Stretch from "./Stretch";
import Line from "./Line";
import PenLineCap from "./PenLineCap";
import PenLineJoin from "./PenLineJoin";

var GraphicsBrushType = {
	"Unknown": 0,
	"Solid": 1,
	"Linear": 2,
	"Radial": 3,
	"Image": 4,
	"Video": 5
};

class Graphics {
	constructor(drawable) {
		this.drawable = drawable;
		this.offscreenSurface = null;
		this.offscreenStyleSurface = null;
		this.ops = [];
		this.lastOps = null;
		this.lastBounds = new Rectangle(0, 0, 0, 0);
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
		return this.hasChangedSinceLastRender;
	}

	pushOp(type /** ... **/) {
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

	drawImage(imageSource, x, y, width, height, repeat, matrix) {
		this.drawImageComplex(imageSource, 0, 0, imageSource.getWidth(), imageSource.getHeight(), x, y, width, height, repeat, matrix);
	}

	drawImageComplex(imageSource, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight, repeat, matrix) {
		dstX = ValueOrDefault(dstX, 0);
		dstY = ValueOrDefault(dstY, 0);
		dstWidth = ValueOrDefault(dstWidth, srcWidth);
		dstHeight = ValueOrDefault(dstHeight, srcHeight);
		repeat = ValueOrDefault(repeat, false);

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

	render(ctx) {

		this.processIfNeeded();

		// reset dirty flag
		this.hasChangedSinceLastRender = false;

		// nothing to do
		if (this.processor.items.length == 0) {
			return;
		}

		var renderBounds = this.getStrokeBounds().toIntRect().inflate(4, 4);
		var itemCount = this.processor.items.length;
		var item = null;
		var op = null;
		var opType = null;
		var params = null;

		this.currentPathItem = null;

		// setup the render clip
		ctx.save();
		ctx.beginPath();
		ctx.rect(renderBounds.x, renderBounds.y, renderBounds.width, renderBounds.height);
		ctx.clip();

		for (var i = 0; i < itemCount; ++i) {
			item = this.processor.items[i];

			// render the item as an image
			if (item instanceof GraphicsImageItem) {
				op = item.imageOp;
				opType = op.getFirst();
				params = op.getSecond();

				switch (opType) {
				case GraphicsOp.TiledImage:
					this.drawImageImpl(ctx, params[0], params[1], params[2], params[3], params[4], params[5], params[6], params[7], params[8], true, params[9]);
					break;
				case GraphicsOp.Image:
					this.drawImageImpl(ctx, params[0], params[1], params[2], params[3], params[4], params[5], params[6], params[7], params[8], false, params[9]);
					break;
				}
			}

			// render the item as a path, or text
			else {
				if (item.ops.length == 0) {
					continue;
				}

				var len = item.ops.length;
				var bounds = (item.strokedBounds == null ? item.bounds : item.strokedBounds);

				this.currentTextOp = null;
				this.currentPathItem = item;

				// must always start off with a beginPath
				op = item.ops[0];
				opType = op.getFirst();

				if (opType != GraphicsOp.BeginPath) {
					this.beginPathImpl(ctx);
				}

				for (var j = 0; j < len; ++j) {
					op = item.ops[j];
					opType = op.getFirst();
					params = op.getSecond();

					this.currentTextOp = null;

					switch (opType) {
					case GraphicsOp.BeginPath:
						this.beginPathImpl(ctx);
						break;
					case GraphicsOp.ClosePath:
						this.closePathImpl(ctx);
						break;
					case GraphicsOp.MoveTo:
						this.moveToImpl(ctx, params[0]);
						break;
					case GraphicsOp.LineTo:
						this.lineToImpl(ctx, params[0]);
						break;
					case GraphicsOp.CurveTo:
						this.quadraticCurveToImpl(ctx, params[0]);
						break;
					case GraphicsOp.CubicCurveTo:
						this.bezierCurveToImpl(ctx, params[0]);
						break;
					case GraphicsOp.Text:
						this.currentTextOp = op;
						this.drawTextImpl(ctx, bounds, item.fillOp, item.strokeOp, params[0], params[1], params[2], params[3]);
						break;
					}
				}

				if (this.currentTextOp != null) {
					continue;
				}

				// now paint the path, fill and stroke can be in any order, should
				// only ever be two or less paint operations, but just incase
				var paintOpCount = item.paintOps.length;

				for (var j = 0; j < paintOpCount; ++j) {
					op = item.paintOps[j];
					opType = op.getFirst();
					params = op.getSecond();

					switch (opType) {
					case GraphicsOp.Fill:
						this.fillImpl(ctx, bounds, params[0], params[1], false);
						break;
					case GraphicsOp.Stroke:
						this.strokeImpl(ctx, bounds, params[0], params[1], false);
						break;
					}
				}
			}
		}

		ctx.restore();
	}

	renderAlphaMask(ctx, maskBrush, width, height) {
		// make a rect that will be filled in with our mask
		ctx.beginPath();
		ctx.rect(0, 0, width, height);

		this.tmpRect.x = this.tmpRect.y = 0;
		this.tmpRect.width = width;
		this.tmpRect.height = height;

		this.drawable.registerGraphicsObject(maskBrush);

		// fill the mask rect
		this.fillImpl(ctx, this.tmpRect, this.createParamsFromBrush(maskBrush), CompositeOperator.DestinationIn);
	}

	processIfNeeded() {
		if (!this.needsProcessing) {
			return;
		}

		this.processor.process(this.ops, this.drawable);
		this.needsProcessing = false;
	}

	getBounds() {
		this.processIfNeeded();

		return this.processor.bounds;
	}

	getStrokeBounds() {
		this.processIfNeeded();

		if (this.processor.strokedBounds != null) {
			return this.processor.strokedBounds;
		}

		return this.processor.bounds;
	}

	beginPathImpl(ctx) {
		ctx.beginPath();
	}

	closePathImpl(ctx) {
		ctx.closePath();
	}

	moveToImpl(ctx, segment) {
		ctx.moveTo(segment.x, segment.y);
	}

	lineToImpl(ctx, segment) {
		ctx.lineTo(segment.x, segment.y);
	}

	quadraticCurveToImpl(ctx, segment) {
		ctx.quadraticCurveTo(segment.cx, segment.cy, segment.x, segment.y);
	}

	bezierCurveToImpl(ctx, segment) {
		ctx.bezierCurveTo(segment.cx1, segment.cy1, segment.cx2, segment.cy2, segment.x, segment.y);
	}

	drawImageImpl(ctx, imageSource, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight, repeat, matrix) {

		if (!imageSource.getIsSourceReady()) {
			return;
		}

		var nativeData = imageSource.getNativeData();

		/** NON-REPEATING IMAGE **/
		if (!repeat) {
			// bugfix: it seems that FF will randomly throw an exception if the source rect is provided, so we omit
			//         this for the video element only, which is fine, if a user needs a specific rect from the video
			//         a VideoBrush should be used instead anyway.
			if (imageSource instanceof VideoSource) {
				ctx.drawImage(nativeData, dstX, dstY, dstWidth, dstHeight);
			} else {
				if (matrix == null) {
					ctx.drawImage(nativeData, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight);
				} else {
					ctx.save();
					ctx.transform(matrix.m11, matrix.m12, matrix.m21, matrix.m22, matrix.offsetX, matrix.offsetY);
					ctx.drawImage(nativeData, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight);
					ctx.restore();
				}
			}

			return;
		}


		/** REPEATING IMAGE **/

		// !!! TODO : need to support the matrix for repeating images... (do we apply it to the drawn image? or to the entire pattern??)

		// create the offscreen surface (if needed) that we will use
		// to render the source tile into, patterns are as-is so we
		// must draw the tile first then create the pattern from the
		// offscreen surface. most likely this surface will be used
		// multiple times, hence the reason for keeping it in memory
		if (this.offscreenSurface == null) {
			this.offscreenSurface = document.createElement("canvas");
		}

		// round the dimensions to whole numbers		
		this.offscreenSurface.width = EngineMath.round(srcWidth);
		this.offscreenSurface.height = EngineMath.round(srcHeight);

		// create and reset the offscreen context, then render the tile
		// into it at 0,0
		var offscreenContext = this.offscreenSurface.getContext("2d");

		offscreenContext.clearRect(0, 0, this.offscreenSurface.width, this.offscreenSurface.height);
		offscreenContext.beginPath();
		offscreenContext.drawImage(nativeData, srcX, srcY, srcWidth, srcHeight, 0, 0, srcWidth, srcHeight);

		// now create the pattern from our surface, repeating in both directions
		var pattern = ctx.createPattern(this.offscreenSurface, "repeat");

		// draw the final tiled image into our main context, the pattern
		// will handle tiling (i.e. via repeat), this is much faster than
		// computing the tiles ourself and rendering each one using drawImage
		//
		// NOTE : here we translate instead of passing in the dstX/dstY to
		//		  the rect method, this will actually translate the entire
		//		  pattern, the latter method would end up just clipping
		ctx.save();
		ctx.beginPath();
		ctx.translate(dstX, dstY);
		ctx.rect(0, 0, dstWidth, dstHeight);
		ctx.fillStyle = pattern;
		ctx.fill();
		ctx.restore();
	}

	drawTextImpl(ctx, boundsRect, fillOp, strokeOp, text, x, y, font) {

		if (fillOp != null) {
			this.fillImpl(ctx, boundsRect, fillOp.getSecond()[0], fillOp.getSecond()[1], true);
		}

		if (strokeOp != null) {
			this.strokeImpl(ctx, boundsRect, strokeOp.getSecond()[0], strokeOp.getSecond()[1], true);
		}
	}

	fillImpl(ctx, boundsRect, brushParams, compositeOp, forText) {

		if (brushParams == null) {
			ctx.fillStyle = this.createFallbackStyle();

			if (forText) {
				this.fillText(ctx);
			} else {
				ctx.fill();
			}

			return;
		}

		var success = true;
		var saveState = false;
		var alpha = ctx.globalAlpha;
		var currentCompositeOp = ctx.globalCompositeOperation;

		// if the brush has a transform we will need to save our current state and restore it, this adds a bit of overhead
		// so we only do this if we absolutley must (hence the saving of the alpha directly)
		if (this.getMustSaveContextForBrush(brushParams)) {
			saveState = true;
		}

		try {
			if (saveState) {
				ctx.save();
			}

			ctx.globalCompositeOperation = this.getCompositeOperatorString(compositeOp);
			ctx.fillStyle = this.createStyleFromBrush(ctx, boundsRect, brushParams, false);

			// the brush may have it's own alpha channel, so we append it to the global alpha
			// this will relieve us of some overhead of making a copy of the brushes color(s), however, the 
			// color(s) could also have their own alpha which will be in the style created
			ctx.globalAlpha *= brushParams[brushParams.length - 2];

			if (forText) {
				this.fillText(ctx);
			} else {
				ctx.fill();
			}
		}
		catch (e) {
			success = false;
			DebugWrite(e.toString(), DebugLevel.Error);
		}
		finally {
			// restore back to our previous state
			if (!saveState) {
				ctx.globalAlpha = alpha;
				ctx.globalCompositeOperation = currentCompositeOp;
			}
			else {
				ctx.restore();
			}
		}

		return success;
	}

	fillText(ctx) {
		if (this.currentTextOp == null) {
			return;
		}

		var params = this.currentTextOp.getSecond();
		var text = params[0];
		var x = params[1];
		var y = params[2];
		var font = params[3];

		ctx.font = font.toString();
		ctx.textBaseline = "top";
		ctx.fillText(text, x, y);
	}

	strokeImpl(ctx, boundsRect, penParams, compositeOp, forText) {
		if (penParams == null) {
			ctx.strokeStyle = this.createFallbackStyle();

			if (forText) {
				this.strokeText(ctx);
			} else {
				ctx.stroke();
			}

			return;
		}

		var success = true;
		var lineWidth = penParams[0];
		var lineCap = penParams[3];
		var dashCap = penParams[6];
		var dashStyle = penParams[5];
		var dashSuccess = false;
		var brushParams = penParams[4];
		var saveState = false;
		var alpha = ctx.globalAlpha;
		var currentCompositeOp = ctx.globalCompositeOperation;

		// if the brush has a transform we will need to save our current state and restore it, this adds a bit of overhead
		// so we only do this if we absolutley must (hence the saving of the alpha directly)
		if (this.getMustSaveContextForBrush(brushParams)) {
			saveState = true;
		}

		try {
			if (saveState) {
				ctx.save();
			}

			ctx.globalCompositeOperation = this.getCompositeOperatorString(compositeOp);
			ctx.strokeStyle = this.createStyleFromBrush(ctx, boundsRect, brushParams, true);

			// the brush may have it's own alpha channel, so we append it to the global alpha
			// this will relieve us of some overhead of making a copy of the brushes color(s), however, the 
			// color(s) could also have their own alpha which will be in the style created
			ctx.globalAlpha *= brushParams[brushParams.length - 2];

			ctx.lineWidth = lineWidth;
			ctx.miterLimit = penParams[1];
			ctx.lineJoin = penParams[2];

			// dashing is currently available for paths created through the Graphics class only
			// so text cannot have a dashed path since we currently use the native font rendering provided
			// by the canvas context.
			//
			// TODO : implement our own OpenType or TrueType font reader and renderer so we can use precise
			//        bounds caclulation, dashing, etc...
			//
			if (!forText && dashStyle != null && dashStyle != DashStyle.Solid && lineWidth > 0) {
				dashSuccess = this.dashCurrentPath(ctx, dashStyle, lineWidth, dashCap, lineCap);
			}

			if (!dashSuccess) {
				ctx.lineCap = lineCap;

				if (forText) {
					this.strokeText(ctx);
				} else {
					ctx.stroke();
				}
			}
		}
		catch (e) {
			success = false;
			DebugWrite(e.toString(), DebugLevel.Error);
		}
		finally {
			// restore back to our previous state
			if (!saveState) {
				ctx.globalAlpha = alpha;
				ctx.globalCompositeOperation = currentCompositeOp;
			}
			else {
				ctx.restore();
			}
		}

		return success;
	}

	strokeText(ctx) {
		if (this.currentTextOp == null) {
			return;
		}

		var params = this.currentTextOp.getSecond();
		var text = params[0];
		var x = params[1];
		var y = params[2];
		var font = params[3];

		ctx.font = font.toString();
		ctx.textBaseline = "top";
		ctx.strokeText(text, x, y);
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
			DebugWrite("Graphics.createParamsFromBrush() found an unknown brush type.", DebugLevel.Warning);

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

		DebugWrite("Graphics.fill() found an unknown brush type. " + type, DebugLevel.Warning);

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
		this.offscreenStyleSurface.width = EngineMath.round(surfaceWidth);
		this.offscreenStyleSurface.height = EngineMath.round(surfaceHeight);

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

	dashCurrentPath(ctx, dashStyle, lineWidth, dashCap, lineCap) {
		var srcDashOffset = dashStyle.getOffset();
		var srcDashes = dashStyle.getDashes();
		var srcDashCount = Math.min(srcDashes.length, 32);
		var dashes = [];
		var sumDashLength = 0;
		var sumInvDashLength = 0;

		// compute the real dash lengths based on our pen's stroke weight, we also need
		// to sum the entire set of dash lengths so we can check that we have a valid
		// set of dashes and compute the real dash offset
		for (var i = 0; i < srcDashCount; ++i) {
			// ensure we don't have negative values
			//
			// TODO : should probably limit to 1 so it is atleast a solid dash?
			//
			dashes.push(Math.max(srcDashes[i], 0) * lineWidth);

			sumDashLength += dashes[i];
		}

		// unable to actual perform an dashing
		if (Math.abs(EngineMath.toPrecision(sumDashLength, 2)) <= 0.01) {
			return false;
		}

		var dashCount = 0;
		var dashIndex = 0;
		var dashCurvePos = 0;
		var dashPos = 0;
		var dashOffset = 0;
		var dashPoint = new Vector2D(0, 0);
		var segment = null;
		var segmentLength = 0;
		var segmentCount = 0;
		var segmentStartIndex = 0;
		var segmentStopIndex = 0;
		var segmentLine = null;
		var prevSegment = null;
		var lineX = 0;
		var lineY = 0;
		var moveX = 0;
		var moveY = 0;
		var firstMoveDone = false;
		var isDashingDone = false;
		var isDashOffset = false;
		var isDashEven = false;
		var useDashCap = false;
		var flatSegments = [];

		// capping each dash is an expensive process since we have to render
		// each dash individually, so if the caps are the same we can wait
		// till the end to stroke, which will apply the same cap on all strokes
		// otherwise, instead of dashing directly to the context we builds up a
		// set of dash segments so we can handle start and ending caps
		if (dashCap != lineCap) {
			useDashCap = true;
		}

		// round down to an even number
		dashCount = EngineMath.evenRoundDown(dashes.length);

		// get the inverse of the sum of the dash lengths
		sumInvDashLength = 1 / sumDashLength;

		// compute the initial dash offset
		dashOffset -= Math.floor((srcDashOffset * lineWidth) * sumInvDashLength) * sumDashLength;

		while (dashOffset >= dashes[dashIndex]) {
			dashOffset -= dashes[dashIndex];

			if (++dashIndex >= dashCount) {
				dashIndex = 0;
			}
		}

		// now we need to flatten the current path down to something more
		// managable for high quality dashing, otherwise we wouldn't be able
		// to draw curved dashes

		flatSegments = this.flattenCurrentPath();

		if (flatSegments == null) {
			return false;
		}

		// get the new flattened segment count
		segmentCount = flatSegments.length;

		// start with the first segment
		prevSegment = flatSegments[0];
		moveX = prevSegment.x;
		moveY = prevSegment.y;

		// there will already be a path in our context from previous
		// draw operations that assumed a solid stroke, this will clear all sub-paths and
		// start a new path for us to draw into
		ctx.beginPath();

		// finally, go through all our segments and draw each dash
		for (var i = 1; i < segmentCount; ++i) {
			segment = flatSegments[i];
			segmentLine = new Line(prevSegment.x, prevSegment.y, segment.x, segment.y);
			segmentLength = segmentLine.length();
			segmentStopIndex = segmentStartIndex + segmentLength;

			isDashingDone = dashCurvePos >= segmentStopIndex;

			while (!isDashingDone) {
				dashPoint.x = 0;
				dashPoint.y = 0;
				dashPos = dashCurvePos + dashes[dashIndex] - dashOffset - segmentStartIndex;

				isDashOffset = dashOffset > 0;
				isDashEven = (dashIndex & 1) == 0;

				// unable to dash anymore, the dash extends beyond this line so we need to subtract
				// the dash part that we've already used and move to the next segment
				if (dashPos > segmentLength) {
					dashCurvePos = segmentStopIndex;
					dashOffset = dashes[dashIndex] - (dashPos - segmentLength);

					dashPoint.x = segmentLine.x2;
					dashPoint.y = segmentLine.y2;

					isDashingDone = true;
				}

				// the dash is on this line, keep dashing
				else {
					dashCurvePos = dashPos + segmentStartIndex;
					dashOffset = 0;

					dashPoint = segmentLine.pointAt(dashPos / segmentLength);

					if (++dashIndex >= dashCount) {
						dashIndex = 0;
					}

					isDashingDone = dashCurvePos >= segmentStopIndex;
				}

				if (isDashEven) {
					lineX = dashPoint.x;
					lineY = dashPoint.y;

					// we only want to start a new subpath if we have a dash offset, otherwise
					// we need to just continue dashing
					if (!isDashOffset || !firstMoveDone) {
						ctx.moveTo(moveX, moveY);
						firstMoveDone = true;
					}

					ctx.lineTo(lineX, lineY);

					moveX = lineX;
					moveY = lineY;
				}
				else {
					moveX = dashPoint.x;
					moveY = dashPoint.y;
				}
			}

			// go to the next segment
			segmentStartIndex = segmentStopIndex;
			prevSegment = segment;
		}

		// stroke the dashed path first
		ctx.lineCap = dashCap;
		ctx.stroke();

		// finally, we need to draw all the line caps, these are different than the
		// dash caps, i.e. the start and end of a non-connecting path
		if (useDashCap) {
			// TODO : need to implement different caps for non-connecting paths
		}

		return true;
	}

	flattenCurrentPath() {
		if (this.currentPathItem.segments == null || this.currentPathItem.segments.length == 0) {
			return null;
		}

		var segmentCount = this.currentPathItem.segments.length;
		var segment = null;
		var flatSegments = [];

		for (var i = 0; i < segmentCount; ++i) {
			segment = this.currentPathItem.segments[i];

			if (segment instanceof PathMoveSegment) {
				flatSegments.push(segment);
			}
			else {
				var lineSegments = segment.flattenForThreshold(2, (i > 0 ? this.currentPathItem.segments[i - 1] : null));

				for (var j = 0; j < lineSegments.length; ++j) {
					flatSegments.push(lineSegments[j]);
				}
			}
		}

		return flatSegments;
	}

	getMustSaveContextForBrush(brushParams) {
		return (brushParams[brushParams.length - 1] != null || brushParams[0] == GraphicsBrushType.Image ||
		brushParams[0] == GraphicsBrushType.Video);
	}

	setContextTransform(ctx, mx) {
		ctx.transform(mx.m11, mx.m12, mx.m21, mx.m22, mx.offsetX, mx.offsetY);
	}

	// getCurrentStrokeDashStyle : function() {
	// if(this.strokeIndex == -1)
	// return null;

	// var op = this.ops[this.strokes[this.pathIndex][this.strokeIndex]];
	// var dashStyle = op.getSecond()[0][5];

	// if(dashStyle != null && dashStyle == DashStyle.Solid)
	// return null;

	// return dashStyle;
	// },

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

Graphics.Kappa = 0.5522847498307933;
Graphics.MiterJointAccuracy = 1.0E-9;

export default Graphics;

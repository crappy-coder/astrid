import Graphics from "../Graphics"
import GraphicsOp from "../GraphicsOp"
import GraphicsItemType from "../GraphicsItemType"
import GraphicsUtil from "../GraphicsUtil"
import CompositeOperator from "../CompositeOperator"
import Line from "../../Line"
import Vector2D from "../../Vector2D"
import PathMoveSegment from "../PathMoveSegment"
import VideoSource from "../../media/VideoSource"
import DashStyle from "../../ui/DashStyle"
import Debug from "../../Debug"

class DefaultGraphics extends Graphics {
	constructor(drawable) {
		super(drawable);

		this.offscreenSurface = null;
		this.offscreenStyleSurface = null;
		this.currentTextOp = null;
		this.currentPathItem = null;
	}

	beginRender(ctx) {
		// reset the current path item
		this.currentPathItem = null;

		// setup the render clip
		var renderBounds = this.bounds.toIntRect().inflate(4, 4);

		ctx.save();
		ctx.beginPath();
		ctx.rect(renderBounds.x, renderBounds.y, renderBounds.width, renderBounds.height);
		ctx.clip();
	}

	endRender(ctx) {
		ctx.restore();
	}

	render(ctx) {
		var itemCount = this.processor.items.length;
		var item = null;
		var op = null;
		var opType = null;
		var opParams = null;

		for (var i = 0; i < itemCount; ++i) {
			item = this.processor.items[i];

			// render the item as an image
			if (item.type === GraphicsItemType.Image) {
				op = item.imageOp;
				opType = op.getFirst();
				opParams = op.getSecond();

				this.drawImageImpl(
					ctx,
					opParams.source,
					opParams.srcX,
					opParams.srcY,
					opParams.srcWidth,
					opParams.srcHeight,
					opParams.dstX,
					opParams.dstY,
					opParams.dstWidth,
					opParams.dstHeight,
					opType === GraphicsOp.TiledImage ? true : false,
					opParams.transform);
			}

			// render the item as a path, or text
			else {
				if (item.ops.length === 0) {
					continue;
				}

				var len = item.ops.length;
				var bounds = (item.strokedBounds === null ? item.bounds : item.strokedBounds);

				this.currentTextOp = null;
				this.currentPathItem = item;

				// must always start off with a beginPath
				op = item.ops[0];
				opType = op.getFirst();

				if (opType !== GraphicsOp.BeginPath) {
					this.beginPathImpl(ctx);
				}

				for (var j = 0; j < len; ++j) {
					op = item.ops[j];
					opType = op.getFirst();
					opParams = op.getSecond();

					this.currentTextOp = null;

					switch (opType) {
						case GraphicsOp.BeginPath:
							this.beginPathImpl(ctx);
							break;
						case GraphicsOp.ClosePath:
							this.closePathImpl(ctx);
							break;
						case GraphicsOp.MoveTo:
							this.moveToImpl(ctx, opParams);
							break;
						case GraphicsOp.LineTo:
							this.lineToImpl(ctx, opParams);
							break;
						case GraphicsOp.CurveTo:
							this.quadraticCurveToImpl(ctx, opParams);
							break;
						case GraphicsOp.CubicCurveTo:
							this.bezierCurveToImpl(ctx, opParams);
							break;
						case GraphicsOp.Text:
							this.currentTextOp = op;
							this.drawTextImpl(ctx, bounds, item.fillOp, item.strokeOp, opParams.text, opParams.x, opParams.y, opParams.font);
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
					opParams = op.getSecond();

					switch (opType) {
						case GraphicsOp.Fill:
							this.fillImpl(ctx, bounds, opParams, false);
							break;
						case GraphicsOp.Stroke:
							this.strokeImpl(ctx, bounds, opParams, false);
							break;
					}
				}
			}
		}
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
		this.fillImpl(ctx, this.tmpRect, this.createParamsFromBrush(maskBrush, CompositeOperator.DestinationIn));
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
				if (matrix === null) {
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
		if (this.offscreenSurface === null) {
			this.offscreenSurface = document.createElement("canvas");
		}

		// round the dimensions to whole numbers
		this.offscreenSurface.width = astrid.math.round(srcWidth);
		this.offscreenSurface.height = astrid.math.round(srcHeight);

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

		if (fillOp !== null) {
			this.fillImpl(ctx, boundsRect, fillOp.getSecond(), true);
		}

		if (strokeOp !== null) {
			this.strokeImpl(ctx, boundsRect, strokeOp.getSecond(), true);
		}
	}

	fillImpl(ctx, boundsRect, brushInfo, forText) {

		if (brushInfo === null) {
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
		if (Graphics.WillBrushRequireSavingContext(brushInfo)) {
			saveState = true;
		}

		try {
			if (saveState) {
				ctx.save();
			}

			ctx.globalCompositeOperation = GraphicsUtil.toCompositeOperatorString(brushInfo.compositeOp);
			ctx.fillStyle = this.createStyleFromBrush(ctx, boundsRect, brushInfo, false);

			// the brush may have it's own alpha channel, so we append it to the global alpha
			// this will relieve us of some overhead of making a copy of the brushes color(s), however, the
			// color(s) could also have their own alpha which will be in the style created
			ctx.globalAlpha *= brushInfo.opacity;

			if (forText) {
				this.fillText(ctx);
			} else {
				ctx.fill();
			}
		}
		catch (e) {
			success = false;
			Debug.error(e.toString());
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
		if (this.currentTextOp === null) {
			return;
		}

		var params = this.currentTextOp.getSecond();
		var text = params.text;
		var x = params.x;
		var y = params.y;
		var font = params.font;

		ctx.font = font.toString();
		ctx.textBaseline = "top";
		ctx.fillText(text, x, y);
	}

	strokeImpl(ctx, boundsRect, penInfo, forText) {
		if (penInfo === null) {
			ctx.strokeStyle = this.createFallbackStyle();

			if (forText) {
				this.strokeText(ctx);
			} else {
				ctx.stroke();
			}

			return;
		}

		var success = true;
		var lineWidth = penInfo.thickness;
		var lineCap = penInfo.lineCap;
		var dashCap = penInfo.dashCap;
		var dashStyle = penInfo.dashStyle;
		var dashSuccess = false;
		var brushInfo = penInfo.brushInfo;
		var saveState = false;
		var alpha = ctx.globalAlpha;
		var currentCompositeOp = ctx.globalCompositeOperation;

		// if the brush has a transform we will need to save our current state and restore it, this adds a bit of overhead
		// so we only do this if we absolutley must (hence the saving of the alpha directly)
		if (Graphics.WillBrushRequireSavingContext(brushInfo)) {
			saveState = true;
		}

		try {
			if (saveState) {
				ctx.save();
			}

			ctx.globalCompositeOperation = GraphicsUtil.toCompositeOperatorString(penInfo.compositeOp);
			ctx.strokeStyle = this.createStyleFromBrush(ctx, boundsRect, brushInfo, true);

			// the brush may have it's own alpha channel, so we append it to the global alpha
			// this will relieve us of some overhead of making a copy of the brushes color(s), however, the
			// color(s) could also have their own alpha which will be in the style created
			ctx.globalAlpha *= brushInfo.opacity;

			ctx.lineWidth = lineWidth;
			ctx.miterLimit = penInfo.miterLimit;
			ctx.lineJoin = penInfo.lineJoin;

			// dashing is currently available for paths created through the DefaultGraphics class only
			// so text cannot have a dashed path since we currently use the native font rendering provided
			// by the canvas context.
			//
			// TODO : implement our own OpenType or TrueType font reader and renderer so we can use precise
			//        bounds caclulation, dashing, etc...
			//
			if (!forText && dashStyle !== null && dashStyle !== DashStyle.Solid && lineWidth > 0) {
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
			Debug.error(e.toString());
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
		if (this.currentTextOp === null) {
			return;
		}

		var params = this.currentTextOp.getSecond();
		var text = params.text;
		var x = params.x;
		var y = params.y;
		var font = params.font;

		ctx.font = font.toString();
		ctx.textBaseline = "top";
		ctx.strokeText(text, x, y);
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
		if (Math.abs(astrid.math.toPrecision(sumDashLength, 2)) <= 0.01) {
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
		if (dashCap !== lineCap) {
			useDashCap = true;
		}

		// round down to an even number
		dashCount = astrid.math.evenRoundDown(dashes.length);

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

		if (flatSegments === null) {
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
		if (this.currentPathItem.segments === null || this.currentPathItem.segments.length === 0) {
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
}

export default DefaultGraphics;

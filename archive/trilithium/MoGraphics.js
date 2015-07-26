MoGraphicsBrushType = {
	"Unknown"		: 0,
	"Solid"			: 1,
	"Linear"		: 2,
	"Radial"		: 3,
	"Image"			: 4,
	"Video"			: 5
};

MoGraphics = Class.create({
	initialize : function(drawable) {
		this.drawable = drawable;
		this.offscreenSurface = null;
		this.offscreenStyleSurface = null;
		this.ops = new Array();
		this.lastOps = null;
		this.lastBounds = new MoRectangle(0, 0, 0, 0);
		this.currentTextOp = null;
		this.currentPathItem = null;
		this.hasChangedSinceLastRender = true;
		this.cachedPatterns = new MoDictionary();
		this.processor = new MoGraphicsProcessor();
		this.needsProcessing = false;
		this.tmpRect = new MoRectangle(0,0,0,0);
		this.tmpVect = new MoVector2D(0,0);
		this.tmpSize = new MoSize(0,0);
		this.tmpScaleTransform = new MoScaleTransform(0,0);
		this.tmpTranslateTransform = new MoTranslateTransform(0,0);
		this.tmpMatrix = new MoMatrix2D();
	},

	getHasChangedSinceLastRender : function() {
		return this.hasChangedSinceLastRender;
	},
	
	pushOp : function(type /** ... **/) {

	},
	
	beginPath : function() {

	},
	
	closePath : function() {

	},
	
	fill : function(brush, compositeOp) {

	},

	stroke : function(pen, compositeOp) {

	},

	clear : function() {
		this.lastOps = this.ops;
		this.ops = new Array();
		this.needsProcessing = true;
		this.hasChangedSinceLastRender = true;
		this.drawable.clearGraphicsObjects();
		this.drawable.invalidate();
	},

	moveTo : function(x, y) {

	},
	
	lineTo : function(x, y) {

	},
	
	curveTo : function(cx, cy, x, y) {		

	},
	
	cubicCurveTo : function(cx1, cy1, cx2, cy2, x, y) {

	},
	
	arcTo : function(x, y, width, height, startAngle, sweepAngle, direction) {

	},

	drawOpenArc : function(x, y, width, height, startAngle, sweepAngle, direction, fromCenter) {

	},

	drawArc : function(x, y, width, height, startAngle, sweepAngle, direction, fromCenter) {

	},
	
	drawEllipse : function(x, y, width, height, isCenter) {

	},

	drawCircle : function(x, y, radius, isCenter) {

	},

	drawImage : function(imageSource, x, y, width, height, repeat, matrix) {	

	},

	drawImageComplex : function(imageSource, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight, repeat, matrix) {

	},

	drawLine : function(x1, y1, x2, y2) {

	},

	drawRect : function(x, y, width, height) {	

	},

	drawRoundRect : function(x, y, width, height, radius) {

	},
	
	drawRoundRectComplex : function(x, y, width, height, cornerRadii) {

	},
	
	drawPoly : function(points, dontClosePath) {

	},

	drawPath : function(path) {

	},
	
	drawText : function(text, x, y, font) {

	},
	
	makeArcPath : function(x, y, width, height, startAngle, sweepAngle, direction, connectWithPrevOp) {
		var theta = 0;
		var angle = 0;
		var angleH = 0;
		var segmentCount = 0;
		var tx = 0;
		var ty = 0;
		var cx = 0;
		var cy = 0;
		var rx = width*0.5;
		var ry = height*0.5;
		
		startAngle = MoMath.degreesToRadians(startAngle);
		sweepAngle = MoMath.degreesToRadians(sweepAngle);

		if (Math.abs(sweepAngle) > 2 * Math.PI)
			sweepAngle = 2 * Math.PI;

		sweepAngle *= direction;
		segmentCount = Math.ceil(Math.abs(sweepAngle) / (Math.PI * 0.25));
		theta = -(sweepAngle / segmentCount);
		angle = -startAngle;

		if (segmentCount > 0)
		{
			tx = x + Math.cos( startAngle) * rx;
			ty = y + Math.sin(-startAngle) * ry;

			if(connectWithPrevOp)
				this.lineTo(tx, ty);
			else
				this.moveTo(tx, ty);

			for (var i = 0; i < segmentCount; ++i)
			{
				angle += theta;
				angleH = angle - theta * 0.5;
				
				cx = x + Math.cos(angleH) * (rx / Math.cos(theta * 0.5));
				cy = y + Math.sin(angleH) * (ry / Math.cos(theta * 0.5));

				tx = x + Math.cos(angle) * rx;
				ty = y + Math.sin(angle) * ry;
				
				this.curveTo(cx, cy, tx, ty);
			}
		}
	},
	
	makeRoundRectPath : function(x, y, width, height, radius) {
		var arcSize = radius * 2;

		this.beginPath();
		this.arcTo(x + width - radius, y + radius, arcSize, arcSize, 90, 90);
		this.arcTo(x + width - radius, y + height - radius, arcSize, arcSize, 0, 90);
		this.arcTo(x + radius, y + height - radius, arcSize, arcSize, 270, 90);
		this.arcTo(x + radius, y + radius, arcSize, arcSize, 180, 90);
		this.closePath();
	},
	
	makeRoundRectPathComplex : function(x, y, width, height, cornerRadius) {
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
	},

	render : function(ctx) {
		
		this.processIfNeeded();

		// reset dirty flag
		this.hasChangedSinceLastRender = false;
		
		// nothing to do
		if(this.processor.items.length == 0)
			return;
		
		var itemCount = this.processor.items.length;
		var item = null;
		var op = null;
		var opType = null;
		var params = null;
		
		this.currentPathItem = null;
		
		for(var i = 0; i < itemCount; ++i)
		{
			item = this.processor.items[i];

			// render the item as an image
			if(item instanceof MoGraphicsImageItem)
			{
				op = item.imageOp;
				opType = op.getFirst();
				params = op.getSecond();
				
				switch(opType)
				{
					case MoGraphicsOp.TiledImage:
						this.drawImageImpl(ctx, params[0], params[1], params[2], params[3], params[4], params[5], params[6], params[7], params[8], true, params[9]);
						break;
					case MoGraphicsOp.Image:
						this.drawImageImpl(ctx, params[0], params[1], params[2], params[3], params[4], params[5], params[6], params[7], params[8], false, params[9]);
						break;
				}
			}
			
			// render the item as a path, or text
			else
			{
				if(item.ops.length == 0)
					continue;

				var len = item.ops.length;
				var bounds = (item.strokedBounds == null ? item.bounds : item.strokedBounds);

				this.currentTextOp = null;
				this.currentPathItem = item;
				
				// must always start off with a beginPath
				op = item.ops[0];
				opType = op.getFirst();

				if(opType != MoGraphicsOp.BeginPath)
					this.beginPathImpl(ctx);

				for(var j = 0; j < len; ++j)
				{
					op = item.ops[j];
					opType = op.getFirst();
					params = op.getSecond();

					this.currentTextOp = null;
					
					switch(opType)
					{
						case MoGraphicsOp.BeginPath:
							this.beginPathImpl(ctx);
							break;
						case MoGraphicsOp.ClosePath:
							this.closePathImpl(ctx);
							break;
						case MoGraphicsOp.MoveTo:
							this.moveToImpl(ctx, params[0]);
							break;
						case MoGraphicsOp.LineTo:
							this.lineToImpl(ctx, params[0]);
							break;
						case MoGraphicsOp.CurveTo:
							this.quadraticCurveToImpl(ctx, params[0]);
							break;
						case MoGraphicsOp.CubicCurveTo:
							this.bezierCurveToImpl(ctx, params[0]);
							break;
						case MoGraphicsOp.Rect:
							this.rectImpl(ctx, bounds, item.fillOp, item.strokeOp, params[0], params[1], params[2], params[3]);
							break;
						case MoGraphicsOp.Line:
							this.lineImpl(ctx, bounds, item.strokeOp, params[0], params[1], params[2], params[3]);
							break;
						case MoGraphicsOp.Text:
							this.currentTextOp = op;
							this.drawTextImpl(ctx, bounds, item.fillOp, item.strokeOp, params[0], params[1], params[2], params[3]);
							break;
					}

					
				}
				
				if(this.currentTextOp != null)
					continue;
				
				// now paint the path, fill and stroke can be in any order, should
				// only ever be two or less paint operations, but just incase
/* 				var paintOpCount = item.paintOps.length;
				
				for(var j = 0; j < paintOpCount; ++j)
				{
					op = item.paintOps[j];
					opType = op.getFirst();
					params = op.getSecond();

					switch(opType)
					{
						case MoGraphicsOp.Fill:
							this.fillImpl(ctx, bounds, params[0], params[1], false);
							break;
						case MoGraphicsOp.Stroke:
							this.strokeImpl(ctx, bounds, params[0], params[1], false);
							break;
					}
				} */
			}
		}
	},
	
	renderAlphaMask : function(ctx, maskBrush, width, height) {
		// make a rect that will be filled in with our mask
		ctx.beginPath();
		ctx.rect(0, 0, width, height);

		this.tmpRect.x = this.tmpRect.y = 0;
		this.tmpRect.width = width;
		this.tmpRect.height = height;

		this.drawable.registerGraphicsObject(maskBrush);
		
		// fill the mask rect
		this.fillImpl(ctx, this.tmpRect, this.createParamsFromBrush(maskBrush), MoCompositeOperator.DestinationIn);
	},
	
	processIfNeeded : function() {
		if(!this.needsProcessing)
			return;	
		
		this.processor.process(this.ops, this.drawable);
		this.needsProcessing = false;
	},

	getBounds : function() {
		this.processIfNeeded();

		return this.processor.bounds;
	},
	
	getStrokeBounds : function() {
		this.processIfNeeded();

		if(this.processor.strokedBounds != null)
			return this.processor.strokedBounds;

		return this.processor.bounds;		
	},

	beginPathImpl : function(ctx) {
		// TODO : Implement
	},

	closePathImpl : function(ctx) {
		// TODO : Implement
	},

	moveToImpl : function(ctx, segment) {
		// TODO : Implement
	},

	lineToImpl : function(ctx, segment) {
		// TODO : Implement
	},
	
	quadraticCurveToImpl : function(ctx, segment) {
		// TODO : Implement
	},

	bezierCurveToImpl : function(ctx, segment) {
		// TODO : Implement
	},
	
	rectImpl : function(ctx, boundsRect, fillOp, strokeOp, x, y, width, height) {
		// fills are only supported...
		if(MoIsNull(fillOp))
			return;
			
		var slate = engine.createSlate();
		slate.x = x;
		slate.y = y;
		slate.width = width;
		slate.height = height;
		
		var shader = this.createStyleFromBrush(ctx, boundsRect, fillOp.getSecond()[0], false);

		if(!MoIsNull(shader))
		{
			slate.shader = shader;
			ctx.addChild(slate);
		}
	},
	
	lineImpl : function(ctx, boundsRect, strokeOp, x1, y1, x2, y2) {
		// TODO : implement
	},

	drawImageImpl : function(ctx, imageSource, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight, repeat, matrix) {

		if(!imageSource.getIsSourceReady())
			return;

		var nativeData = imageSource.getNativeData();
		var actualWidth = nativeData.naturalWidth;
		var actualHeight = nativeData.naturalHeight;

		// apply a poly texture shader to the image to render the source region
		if(actualWidth != srcWidth || actualHeight != srcHeight || srcX != 0 || srcY != 0)
		{
			var shader = engine.createShader("Shaders/vpBasic.cg", "Shaders/mo_fpPolyTexture.cg");
			
			var left = srcX / actualWidth;
			var right = (srcX + srcWidth) / actualWidth;
			var top = srcY / actualHeight;
			var bottom = (srcY + srcHeight) / actualHeight;
			
			shader.p1 = [left, top, 0, 0];
			shader.p2 = [right, top, 0, 0];
			shader.p3 = [right, bottom, 0, 0];
			shader.p4 = [left, bottom, 0, 0];
			
			nativeData.shader = shader;
		}
		
		// update the destination
		nativeData.x = dstX;
		nativeData.y = dstY;
		nativeData.width = dstWidth;
		nativeData.height = dstHeight;

		ctx.addChild(nativeData);
	},
	
	drawTextImpl : function(ctx, boundsRect, fillOp, strokeOp, text, x, y, font) {
		if(MoIsNull(fillOp))
			return;

		var brushParams = fillOp.getSecond()[0];
		var textBlock = engine.createTextBlock(text, font.toTextFormat(brushParams[1]), boundsRect.width);
		textBlock.x = x;
		textBlock.y = y;

		ctx.addChild(textBlock);
	},
	
	fillImpl : function(ctx, boundsRect, brushParams, compositeOp, forText) {
		// TODO : Implement
		return true;
	},

	fillText : function(ctx) {
		// TODO : Implement
	},

	strokeImpl : function(ctx, boundsRect, penParams, compositeOp, forText) {
		// TODO : Implement
		
		return true;
	},
	
	strokeText : function(ctx) {
		// TODO : Implement
	},
	
	/** Pen Parameters **/
	createParamsFromPen : function(pen) {
		if(pen == null || pen.getBrush() == null)
			return null;
	
		return [pen.getThickness(),
				pen.getMiterLimit(),
				this.getLineJoinString(pen.getLineJoin()),
				this.getLineCapString(pen.getLineCap()),
				this.createParamsFromBrush(pen.getBrush()),
				pen.getDashStyle(),
				this.getLineCapString(pen.getDashCap())];
	},
	
	
	/** Brush Parameters **/
	
	createParamsFromBrush : function(brush) {
		if(brush == null)
			return null;

		var params = null;
		
		if(brush instanceof MoSolidColorBrush)
			params = this.createParamsFromSolidColorBrush(brush);
		else if(brush instanceof MoLinearGradientBrush)
			params = this.createParamsFromLinearGradientBrush(brush);
		else if(brush instanceof MoRadialGradientBrush)
			params = this.createParamsFromRadialGradientBrush(brush);
		else if(brush instanceof MoImageBrush)
			params = this.createParamsFromImageBrush(brush);
		else if(brush instanceof MoVideoBrush)
			params = this.createParamsFromVideoBrush(brush);
		else
		{
			MoDebugWrite("Graphics.createParamsFromBrush() found an unknown brush type.", MoDebugLevel.Warning);
			
			// the brush is unknown so just return a solid type with the fallback color
			params = [MoGraphicsBrushType.Solid, this.createFallbackStyle()];
			params.push(1); 	// opacity
			params.push(null); 	// matrix

			return params;
		}

		params.push(brush.getOpacity());

		if(brush.getTransform() != null)
			params.push(brush.getTransform().getValue());
		else
			params.push(null);

		return params;
	},
	
	createParamsFromSolidColorBrush : function(brush) {
		var color = brush.getColor();

		return [MoGraphicsBrushType.Solid, [color.r, color.g, color.b, color.a]];
	},
	
	createParamsFromGradientBrush : function(brush) {
		// currently, we can only support two color stops, so use the first
		// and last stop as our two colors, if either one or both does not
		// exist (very unlikely) then fill in that stop with a a transparent
		// color at the minimum / maximum offset
		var count = brush.getColorStopCount();
		var stopA = (count > 0 ? brush.getColorStop(0) : null);
		var stopB = (count > 1 ? brush.getColorStop(count-1) : null);
		var stops = [];
		
		if(MoIsNull(stopA))
			stops.push([MoColor.transparent(), 0]);
		else
			stops.push([stopA.getColor(), stopA.getOffset()]);

		if(MoIsNull(stopB))
			stops.push([MoColor.transparent(), 1]);
		else
			stops.push([stopB.getColor(), stopB.getOffset()]);

		return stops;
	},

	createParamsFromLinearGradientBrush : function(brush) {	
		return [MoGraphicsBrushType.Linear,
				brush.getStartPoint().x, 
				brush.getStartPoint().y,
				brush.getEndPoint().x, 
				brush.getEndPoint().y,
				this.createParamsFromGradientBrush(brush)];
	},

	createParamsFromRadialGradientBrush : function(brush) {	
		return [MoGraphicsBrushType.Radial,
				brush.getStartPoint().x, 
				brush.getStartPoint().y,
				brush.getStartRadius(),
				brush.getEndPoint().x, 
				brush.getEndPoint().y,
				brush.getEndRadius(),
				this.createParamsFromGradientBrush(brush)];
	},
	
	createParamsFromImageBrush : function(brush) {
		if(!brush.getIsAvailable())
			return [MoGraphicsBrushType.Solid, this.createFallbackStyle()];

		return [MoGraphicsBrushType.Image,
				brush.texture.getSize().width,
				brush.texture.getSize().height,
				brush.texture.getNativeData(),
				brush.getSourceUrl(),
				brush.getStretch(),
				brush.getHorizontalAlignment(),
				brush.getVerticalAlignment()];
	},

	createParamsFromVideoBrush : function(brush) {
		if(!brush.getIsAvailable())
			return [MoGraphicsBrushType.Solid, this.createFallbackStyle()];
	
		var naturalSize = brush.getNaturalSize();
		
		return [MoGraphicsBrushType.Video,
				naturalSize.width,
				naturalSize.height,
				brush.getSourceElement(),
				brush.getCurrentPosition(),
				brush.getStretch(),
				brush.getHorizontalAlignment(),
				brush.getVerticalAlignment()];
	},

	/** Brush Styles **/
	
	createStyleFromBrush : function(ctx, boundsRect, brushParams, isStroking) {
		var type = brushParams[0];
		
		switch(type)
		{
			case MoGraphicsBrushType.Solid:
				return this.createStyleFromSolidColorBrush(brushParams);
			case MoGraphicsBrushType.Linear:
				return this.createStyleFromLinearGradientBrush(ctx, boundsRect, brushParams, isStroking);
			case MoGraphicsBrushType.Radial:
				return this.createStyleFromRadialGradientBrush(ctx, boundsRect, brushParams, isStroking);
			case MoGraphicsBrushType.Image:
				return this.createStyleFromImageBrush(ctx, boundsRect, brushParams, isStroking);
			case MoGraphicsBrushType.Video:
				return this.createStyleFromVideoBrush(ctx, boundsRect, brushParams, isStroking);
		}

		MoDebugWrite("Graphics.fill() found an unknown brush type. " + type, MoDebugLevel.Warning);
		
		return this.createFallbackStyle();
	},

	createStyleFromSolidColorBrush : function(brushParams) {
		var shader = engine.createShader("Shaders/vpBasic.cg", "Shaders/fpSolidColor.cg");
		shader.fillColor = brushParams[1];

		return shader;
	},

	createStyleFromLinearGradientBrush : function(ctx, boundsRect, brushParams, isStroking) {
		var startX = brushParams[1];
		var startY = brushParams[2];
		var endX = brushParams[3];
		var endY = brushParams[4];
		var stops = brushParams[5];
		var brushOpacity = brushParams[brushParams.length-2];
		var startColor = stops[0][0];
		var startOffset = stops[0][1];
		var endColor = stops[1][0];
		var endOffset = stops[1][1];
		
		var shader = engine.createShader("Shaders/vpBasic.cg", "Shaders/mo_fpLinearGradient.cg");
		shader.startPosition = [startX, startY, 0, 0];
		shader.endPosition = [endX, endY, 0, 0];
		shader.startColor = startColor.toArray();
		shader.endColor = endColor.toArray();
		shader.startOffset = [startOffset, 0, 0, 0];
		shader.endOffset = [endOffset, 0, 0, 0];
		shader.opacity = [brushOpacity, 0, 0, 0];

		return shader;
	},
	
	createStyleFromRadialGradientBrush : function(ctx, boundsRect, brushParams, isStroking) {
		var startX = brushParams[1];
		var startY = brushParams[2];
		var startRadius = brushParams[3];
		var endX = brushParams[4];
		var endY = brushParams[5];
		var endRadius = brushParams[6];
		var stops = brushParams[7];
		var brushOpacity = brushParams[brushParams.length-2];
		var startColor = stops[0][0];
		var startOffset = stops[0][1];
		var endColor = stops[1][0];
		var endOffset = stops[1][1];

		var shader = engine.createShader("Shaders/vpBasic.cg", "Shaders/mo_fpRadialGradient.cg");
		shader.startPosition = [startX, startY, 0, 0];
		shader.endPosition = [endX, endY, 0, 0];
		shader.startRadius = [startRadius, 0, 0, 0];
		shader.endRadius = [endRadius, 0, 0, 0];
		shader.startColor = startColor.toArray();
		shader.endColor = endColor.toArray();
		shader.startOffset = [startOffset, 0, 0, 0];
		shader.endOffset = [endOffset, 0, 0, 0];
		shader.opacity = [brushOpacity, 0, 0, 0];
		
		return shader;
	},
	
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
	
	createStyleFromImageBrush : function(ctx, boundsRect, brushParams, isStroking) {
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
	},

	createStyleFromVideoBrush : function(ctx, boundsRect, brushParams, isStroking) {
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
	},

	createFallbackStyle : function() {
		return MoColor.Transparent.toRGBAString();
	},

	createBrushStylePattern : function(ctx, sourceElement, brushMatrix, patternSize, isStroking) {
/* 		// for strokes with a pattern, we must do some intermediate drawing
		if(isStroking)
			return ctx.createPattern(this.createBrushPatternSource(sourceElement, brushMatrix, patternSize.width, patternSize.height), "no-repeat");

		return ctx.createPattern(sourceElement, "no-repeat"); */
		
		// TODO : Implement
		return null;
	},

	createBrushPatternSource : function(sourceElement, xform, width, height) {
		// TODO : Implement
		return null;
	
		// create the offscreen surface that we will use to render the source style
		// into, strokes with a video and texture need to first be rendered into a 
		// seperate surface that can then be used as the final source when creating
		// the pattern, otherwise if we scale the stroke itself it will end up looking
		// like ass, this produces a much better and accurate stroke
		if(this.offscreenStyleSurface == null)
			this.offscreenStyleSurface = document.createElement("canvas");

		var surfaceWidth = width;
		var surfaceHeight = height;
		var alignX = 0;
		var alignY = 0;

		// if the brush has a transform, we need to run that transform here
		if(xform != null)
		{
			this.tmpRect = xform.transformRect(new MoRectangle(0, 0, width, height));

			// re-align so that the source is drawn at 0,0
			alignX = -this.tmpRect.x;
			alignY = -this.tmpRect.y;

			// get the post-transform size
			surfaceWidth = this.tmpRect.width;
			surfaceHeight = this.tmpRect.height;
		}

		// round the dimensions to whole numbers		
		this.offscreenStyleSurface.width = MoMath.round(surfaceWidth);
		this.offscreenStyleSurface.height = MoMath.round(surfaceHeight);

		var ctx = this.offscreenStyleSurface.getContext("2d");

		if(xform != null)
			ctx.setTransform(xform.m11, xform.m12, xform.m21, xform.m22, xform.offsetX + alignX, xform.offsetY + alignY);

		ctx.drawImage(sourceElement, 0, 0, width, height);
		
		return this.offscreenStyleSurface;
	},
	
	/** Other **/
	
	makeBrushStyleMatrix : function(brushMatrix, patternPosition, patternSize, sourceWidth, sourceHeight, isStroking) {
		this.tmpMatrix.setIdentity();

		if(brushMatrix != null)
		{
			if(isStroking)
			{
				this.tmpRect = brushMatrix.transformRect(new MoRectangle(patternPosition.x, patternPosition.y, patternSize.width, patternSize.height));
				this.tmpMatrix.translate(this.tmpRect.x, this.tmpRect.y);
			}
			else
			{
				this.tmpMatrix.scale(patternSize.width / sourceWidth, patternSize.height / sourceHeight);
				this.tmpMatrix.translate(patternPosition.x, patternPosition.y);
				this.tmpMatrix.append(brushMatrix);
			}
		}
		else
		{
			if(!isStroking)
				this.tmpMatrix.scale(patternSize.width / sourceWidth, patternSize.height / sourceHeight);
		
			this.tmpMatrix.translate(patternPosition.x, patternPosition.y);
		}

		return this.tmpMatrix;
	},
	
	computePatternSize : function(stretch, boundsRect, sourceWidth, sourceHeight) {
		var scaleX = boundsRect.width / sourceWidth;
		var scaleY = boundsRect.height / sourceHeight;
		var minScale = Math.min(scaleX, scaleY);
		var maxScale = Math.max(scaleX, scaleY);
	
		switch(stretch)
		{
			case MoStretch.Uniform:
				scaleX = minScale;
				scaleY = minScale;
				break;
			case MoStretch.UniformToFill:
				scaleX = maxScale;
				scaleY = maxScale;
				break;
			case MoStretch.Fill:
				break;
			case MoStretch.None:
				scaleX = scaleY = 1;
				break;
		}

		this.tmpSize.width = (sourceWidth * scaleX);
		this.tmpSize.height = (sourceHeight * scaleY);

		return this.tmpSize;
	},

	computePatternPosition : function(horizontalAlignment, verticalAlignment, patternSize, dstRect) {
		this.tmpVect.x = dstRect.x + ((dstRect.width - patternSize.width) * horizontalAlignment);
		this.tmpVect.y = dstRect.y + ((dstRect.height - patternSize.height) * verticalAlignment);
		
		return this.tmpVect;
	},
	
	dashCurrentPath : function(ctx, dashStyle, lineWidth, dashCap, lineCap) {
		var srcDashOffset = dashStyle.getOffset();
		var srcDashes = dashStyle.getDashes();
		var srcDashCount = Math.min(srcDashes.length, 32);
		var dashes = [];
		var sumDashLength = 0;
		var sumInvDashLength = 0;
		
		// compute the real dash lengths based on our pen's stroke weight, we also need
		// to sum the entire set of dash lengths so we can check that we have a valid
		// set of dashes and compute the real dash offset
		for(var i = 0; i < srcDashCount; ++i)
		{
			// ensure we don't have negative values
			//
			// TODO : should probably limit to 1 so it is atleast a solid dash?
			//
			dashes.push(Math.max(srcDashes[i], 0) * lineWidth);
			
			sumDashLength += dashes[i];
		}

		// unable to actual perform an dashing
		if(Math.abs(MoMath.toPrecision(sumDashLength, 2)) <= 0.01)
			return false;

		var dashCount = 0;
		var dashIndex = 0;
		var dashCurvePos = 0;
		var dashPos = 0;
		var dashOffset = 0;
		var dashPoint = new MoVector2D(0, 0);
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
		if(dashCap != lineCap)
			useDashCap = true;

		// round down to an even number
		dashCount = MoMath.evenRoundDown(dashes.length);
		
		// get the inverse of the sum of the dash lengths
		sumInvDashLength = 1 / sumDashLength;
		
		// compute the initial dash offset
		dashOffset -= Math.floor((srcDashOffset * lineWidth) * sumInvDashLength) * sumDashLength;

		while(dashOffset >= dashes[dashIndex])
		{
			dashOffset -= dashes[dashIndex];
			
			if(++dashIndex >= dashCount)
				dashIndex = 0;
		}
		
		// now we need to flatten the current path down to something more
		// managable for high quality dashing, otherwise we wouldn't be able
		// to draw curved dashes
		
		flatSegments = this.flattenCurrentPath();
		
		if(flatSegments == null)
			return false;
		
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
		for(var i = 1; i < segmentCount; ++i)
		{
			segment = flatSegments[i];
			segmentLine = new MoLine(prevSegment.x, prevSegment.y, segment.x, segment.y);
			segmentLength = segmentLine.length();
			segmentStopIndex = segmentStartIndex + segmentLength;
			
			isDashingDone = dashCurvePos >= segmentStopIndex;
			
			while(!isDashingDone)
			{
				dashPoint.x = 0;
				dashPoint.y = 0;
				dashPos = dashCurvePos + dashes[dashIndex] - dashOffset - segmentStartIndex;
				
				isDashOffset = dashOffset > 0;
				isDashEven = (dashIndex & 1) == 0;

				// unable to dash anymore, the dash extends beyond this line so we need to subtract
				// the dash part that we've already used and move to the next segment
				if(dashPos > segmentLength)
				{
					dashCurvePos = segmentStopIndex;
					dashOffset = dashes[dashIndex] - (dashPos - segmentLength);
					
					dashPoint.x = segmentLine.x2;
					dashPoint.y = segmentLine.y2;

					isDashingDone = true;
				}
				
				// the dash is on this line, keep dashing
				else
				{
					dashCurvePos = dashPos + segmentStartIndex;
					dashOffset = 0;
					
					dashPoint = segmentLine.pointAt(dashPos/segmentLength);
					
					if(++dashIndex >= dashCount)
						dashIndex = 0;
					
					isDashingDone = dashCurvePos >= segmentStopIndex;
				}

				if(isDashEven)
				{
					lineX = dashPoint.x;
					lineY = dashPoint.y;
					
					// we only want to start a new subpath if we have a dash offset, otherwise
					// we need to just continue dashing
					if(!isDashOffset || !firstMoveDone)
					{
						ctx.moveTo(moveX, moveY);
						firstMoveDone = true;
					}

					ctx.lineTo(lineX, lineY);
					
					moveX = lineX;
					moveY = lineY;
				}
				else
				{
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
		if(useDashCap)
		{
			// TODO : need to implement different caps for non-connecting paths
		}

		return true;
	},

	flattenCurrentPath : function() {
		if(this.currentPathItem.segments == null || this.currentPathItem.segments.length == 0)
			return null;

		var segmentCount = this.currentPathItem.segments.length;
		var segment = null;
		var flatSegments = [];

		for(var i = 0; i < segmentCount; ++i)
		{
			segment = this.currentPathItem.segments[i];

			if(segment instanceof MoPathMoveSegment)
			{
				flatSegments.push(segment);
			}
			else
			{
				var lineSegments = segment.flattenForThreshold(2, (i > 0 ? this.currentPathItem.segments[i-1] : null));

				for(var j = 0; j < lineSegments.length; ++j)
				{
					flatSegments.push(lineSegments[j]);
				}
			}
		}

		return flatSegments;
	},

	getMustSaveContextForBrush : function(brushParams) {
		return (brushParams[brushParams.length-1] != null || brushParams[0] == MoGraphicsBrushType.Image || brushParams[0] == MoGraphicsBrushType.Video);
	},

	setContextTransform : function(ctx, mx) {
		// TODO : Implement
	},
	
	getLineCapString : function(penLineCap) {
		switch(penLineCap)
		{
			case MoPenLineCap.Round:
				return "round";
			case MoPenLineCap.Square:
				return "square";
		}
		
		return "butt";
	},
	
	getLineJoinString : function(penLineJoin) {
		switch(penLineJoin)
		{
			case MoPenLineJoin.Bevel:
				return "bevel";
			case MoPenLineJoin.Round:
				return "round";
		}
		
		return "miter";
	},
	
	getCompositeOperatorString : function(compositeOp) {
		switch(compositeOp)
		{
			case MoCompositeOperator.Clear:
				return "clear";
			case MoCompositeOperator.SourceIn:
				return "source-in";
			case MoCompositeOperator.SourceOut:
				return "source-out";
			case MoCompositeOperator.SourceAtop:
				return "source-atop";
			case MoCompositeOperator.DestinationOver:
				return "destination-over";
			case MoCompositeOperator.DestinationIn:
				return "destination-in";
			case MoCompositeOperator.DestinationOut:
				return "destination-out";
			case MoCompositeOperator.DestinationAtop:
				return "destination-atop";
			case MoCompositeOperator.Xor:
				return "xor";
			case MoCompositeOperator.Copy:
				return "copy";
		}
		
		return "source-over";
	}
});

Object.extend(MoGraphics, {
	Kappa : 0.5522847498307933,
	MiterJointAccuracy : 1.0E-9
});
MoGraphicsBaseClass = Class.create();
MoGraphicsBaseClass.prototype = new MoGraphicsNative;

MoGraphicsBrushType = {
	"Unknown"		: 0,
	"Solid"			: 1,
	"Linear"		: 2,
	"Radial"		: 3,
	"Image"			: 4,
	"Video"			: 5
};

MoGraphics = Class.create(MoGraphicsBaseClass, {
	initialize : function(drawable) {
		this.drawable = drawable;
		this.offscreenSurface = null;
		this.offscreenStyleSurface = null;
		this.ops = new Array();
		this.lastOps = null;
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
		// this has been cleared and since then no new operations have been added
		// so we report a change so the renderer can clear the context
		if(this.ops.length == 0 && (this.lastOps != null && this.lastOps.length > 0))
			return true;

		return this.hasChangedSinceLastRender;
	},

	areOperationsEqual : function(opA, opB) {
		if(opA.getFirst() == opB.getFirst())
		{
			var paramsA = opA.getSecond();
			var paramsB = opB.getSecond();
			
			return MoAreEqual(paramsA, paramsB);
		}

		return false;
	},
	
	pushOp : function(type /** ... **/) {
		var op = new MoPair(type, new Array());
		
		for(var i = 1; i < arguments.length; i++)
			op.getSecond().push(arguments[i]);

		this.ops.push(op);

		// compare this op with the last operation (at the same index), if any
		// to check whether or not we have changed since the last batch. This
		// allows us to optimize bitmap caching and effects, if the user pushes
		// the exact same ops there is no need to re-render, which is generally
		// the standard way (i.e. each layout update, clear the graphics first)
		
		if(!this.hasChangedSinceLastRender)
		{
			var idx = this.ops.length-1;
			var lastOp = null;

			if(this.lastOps != null && idx < this.lastOps.length)
			{
				lastOp = this.lastOps[idx];
				
				if(!this.areOperationsEqual(op, lastOp))
					this.hasChangedSinceLastRender = true;
			}
			else
			{
				this.hasChangedSinceLastRender = true;
			}
		}

		if(this.hasChangedSinceLastRender)
		{
			this.needsProcessing = true;
			this.drawable.invalidate();
		}

		return this.ops.length-1;
	},
	
	beginPath : function() {
		this.pushOp(MoGraphicsOp.BeginPath);
	},
	
	closePath : function() {
		this.pushOp(MoGraphicsOp.ClosePath);
	},
	
	fill : function(brush, compositeOp) {
		compositeOp = MoValueOrDefault(compositeOp, MoCompositeOperator.SourceOver);

		this.drawable.registerGraphicsObject(brush);
		this.pushOp(MoGraphicsOp.Fill, this.createParamsFromBrush(brush), compositeOp);
	},

	stroke : function(pen, compositeOp) {
		compositeOp = MoValueOrDefault(compositeOp, MoCompositeOperator.SourceOver);

		this.drawable.registerGraphicsObject(pen);
		this.pushOp(MoGraphicsOp.Stroke, this.createParamsFromPen(pen), compositeOp);
	},

	clear : function() {
		this.lastOps = this.ops;
		this.ops = new Array();
		this.needsProcessing = true;
		this.drawable.clearGraphicsObjects();
	},

	moveTo : function(x, y) {
		this.pushOp(MoGraphicsOp.MoveTo, new MoPathMoveSegment(x, y));
	},
	
	lineTo : function(x, y) {
		this.pushOp(MoGraphicsOp.LineTo, new MoPathLineSegment(x, y));
	},
	
	curveTo : function(cx, cy, x, y) {
		this.pushOp(MoGraphicsOp.CurveTo, new MoPathQuadraticBezierSegment(x, y, cx, cy));
	},
	
	cubicCurveTo : function(cx1, cy1, cx2, cy2, x, y) {
		this.pushOp(MoGraphicsOp.CubicCurveTo, new MoPathCubicBezierSegment(x, y, cx1, cy1, cx2, cy2));
	},
	
	arcTo : function(x, y, width, height, startAngle, sweepAngle, direction) {
		direction = MoValueOrDefault(direction, MoSweepDirection.Clockwise);
		
		this.makeArcPath(x, y, width, height, startAngle, sweepAngle, direction, true);
	},

	drawOpenArc : function(x, y, width, height, startAngle, sweepAngle, direction, fromCenter) {
		direction = MoValueOrDefault(direction, MoSweepDirection.Clockwise);
		fromCenter = MoValueOrDefault(fromCenter, true);
		
		if(!fromCenter)
		{
			x += width * 0.5;
			y += height * 0.5;
		}
		
		this.beginPath();
		this.makeArcPath(x, y, width, height, startAngle, sweepAngle, direction, false);
	},

	drawArc : function(x, y, width, height, startAngle, sweepAngle, direction, fromCenter) {
		this.drawOpenArc(x, y, width, height, startAngle, sweepAngle, direction, fromCenter);
		this.closePath();
	},
	
	drawEllipse : function(x, y, width, height, isCenter) {
		isCenter = MoValueOrDefault(isCenter, true);
	
		var radiusX = width * 0.5;
		var radiusY = height * 0.5;
		var centerX = x;
		var centerY = y;
		var kappa = MoGraphics.Kappa;

		if(!isCenter)
		{
			centerX += radiusX;
			centerY += radiusY;
		}

		this.beginPath();
		this.moveTo(centerX + radiusX, centerY);
		this.cubicCurveTo(centerX + radiusX, centerY - kappa * radiusY, centerX + kappa * radiusX, centerY - radiusY, centerX, centerY - radiusY);
		this.cubicCurveTo(centerX - kappa * radiusX, centerY - radiusY, centerX - radiusX, centerY - kappa * radiusY, centerX - radiusX, centerY);
		this.cubicCurveTo(centerX - radiusX, centerY + kappa * radiusY, centerX - kappa * radiusX, centerY + radiusY, centerX, centerY + radiusY);
		this.cubicCurveTo(centerX + kappa * radiusX, centerY + radiusY, centerX + radiusX, centerY + kappa * radiusY, centerX + radiusX, centerY);
		this.closePath();
	},

	drawCircle : function(x, y, radius, isCenter) {
		this.drawEllipse(x, y, radius * 2, radius * 2, isCenter);
	},

	drawImage : function(imageSource, x, y, width, height, repeat) {	
		this.drawImageComplex(imageSource, 0, 0, imageSource.getWidth(), imageSource.getHeight(), x, y, width, height, repeat);
	},

	drawImageComplex : function(imageSource, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight, repeat) {
		dstX = MoValueOrDefault(dstX, 0);
		dstY = MoValueOrDefault(dstY, 0);
		dstWidth = MoValueOrDefault(dstWidth, srcWidth);
		dstHeight = MoValueOrDefault(dstHeight, srcHeight);
		repeat = MoValueOrDefault(repeat, false);

		this.drawable.registerGraphicsObject(imageSource);
		
		if(repeat)
		{
			this.pushOp(MoGraphicsOp.TiledImage, imageSource, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight);
		}
		else
		{
			this.pushOp(MoGraphicsOp.Image, imageSource, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight);
		}
	},

	drawLine : function(x1, y1, x2, y2) {
		this.beginPath();
		this.moveTo(x1, y1);
		this.lineTo(x2, y2);
	},
	
	drawRect : function(x, y, width, height) {	
		this.beginPath();
		this.moveTo(x, y);
		this.lineTo(x + width, y);
		this.lineTo(x + width, y + height);
		this.lineTo(x, y + height);
		this.closePath();
	},

	drawRoundRect : function(x, y, width, height, radius) {
		radius = MoValueOrDefault(radius, 0);
		
		// not a rounded rectangle, just draw as a normal rectangle
		if(radius <= 0)
		{
			this.drawRect(x, y, width, height);
			return;
		}
		
		this.makeRoundRectPath(x, y, width, height, radius);
	},
	
	drawRoundRectComplex : function(x, y, width, height, cornerRadii) {
		// not a rounded rectangle, just draw as a normal rectangle
		if(cornerRadii.isSquare())
		{
			this.drawRect(x, y, width, height);
			return;
		}

		this.makeRoundRectPathComplex(x, y, width, height, cornerRadii);
	},
	
	drawPoly : function(points, dontClosePath) {
		dontClosePath = MoValueOrDefault(dontClosePath, false);

		var len = points.length;
		var pt = null;
		var isFirst = true;
		
		this.beginPath();
		
		for(var i = 0; i < len; ++i)
		{
			pt = points[i];
			
			if(isFirst)
			{
				this.moveTo(pt.x, pt.y);
				
				isFirst = false;
				continue;
			}
			
			this.lineTo(pt.x, pt.y);
		}

		if(!dontClosePath)
			this.closePath();
	},

	drawPath : function(path) {
		if(path == null || path.length == 0)
			return;

		var segment = null;
		var segments = path.segments;
		var len = segments.length;

		this.beginPath();

		for(var i = 0; i < len; ++i)
		{
			segment = segments[i];
			
			if(i == 0 && !(segment instanceof MoPathMoveSegment))
				this.moveTo(0, 0);
			
			if(segment instanceof MoPathMoveSegment)
				this.moveTo(segment.x, segment.y);
			else if(segment instanceof MoPathLineSegment)
				this.lineTo(segment.x, segment.y);
			else if(segment instanceof MoPathQuadraticBezierSegment)
				this.curveTo(segment.cx, segment.cy, segment.x, segment.y);
			else if(segment instanceof MoPathCubicBezierSegment)
				this.cubicCurveTo(segment.cx1, segment.cy1, segment.cx2, segment.cy2, segment.x, segment.y);
		}
	},
	
	drawText : function(text, x, y, font) {
		this.pushOp(MoGraphicsOp.Text, text, x, y, font);
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
		this.hasChangedSinceLastRender = false;
	},
	
	renderAlphaMask : function(ctx, maskBrush, width, height) {

	},
	
	processIfNeeded : function() {

	},

	getBounds : function() {
		return this.tmpRect;
	},
	
	getStrokeBounds : function() {
		return this.tmpRect;
	},

	beginPathImpl : function(ctx) {
		
	},

	closePathImpl : function(ctx) {
		
	},

	moveToImpl : function(ctx, segment) {
		
	},

	lineToImpl : function(ctx, segment) {
		
	},
	
	quadraticCurveToImpl : function(ctx, segment) {
		
	},

	bezierCurveToImpl : function(ctx, segment) {
		
	},

	drawImageImpl : function(ctx, imageSource, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight, repeat) {
		
	},
	
	drawTextImpl : function(ctx, boundsRect, fillOp, strokeOp, text, x, y, font) {
	
	},
	
	fillImpl : function(ctx, boundsRect, brushParams, compositeOp, forText) {

	},

	fillText : function(ctx) {

	},

	strokeImpl : function(ctx, boundsRect, penParams, compositeOp, forText) {

	},
	
	strokeText : function(ctx) {

	},
	
	/** Pen Parameters **/
	createParamsFromPen : function(pen) {
		return null;
	},
	
	
	/** Brush Parameters **/
	
	createParamsFromBrush : function(brush) {
		return null;
	},
	
	createParamsFromSolidColorBrush : function(brush) {
		return null;
	},
	
	createParamsFromGradientBrush : function(brush) {
		return null;
	},

	createParamsFromLinearGradientBrush : function(brush) {	
		return null;
	},

	createParamsFromRadialGradientBrush : function(brush) {	
		return null;
	},
	
	createParamsFromImageBrush : function(brush) {
		return null;
	},

	createParamsFromVideoBrush : function(brush) {
		return null;
	},
	
	/** Brush Styles **/
	
	createStyleFromBrush : function(ctx, boundsRect, brushParams, isStroking) {
		return null;
	},

	createStyleFromSolidColorBrush : function(brushParams) {
		return null;
	},

	createStyleFromLinearGradientBrush : function(ctx, boundsRect, brushParams, isStroking) {
		return null;
	},
	
	// TODO : for some reason, this fails when the start/end radius and points are lowered or increased,
	//        the results fail differently in IE and FF so something is def wrong with the below
	
	createStyleFromRadialGradientBrush : function(ctx, boundsRect, brushParams, isStroking) {
		return null;
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
		return null;
	},

	createStyleFromVideoBrush : function(ctx, boundsRect, brushParams, isStroking) {
		return null;
	},

	createFallbackStyle : function() {
		return MoColor.Transparent.toRGBAString();
	},

	createBrushStylePattern : function(ctx, sourceElement, brushMatrix, patternSize, isStroking) {
		return null;
	},

	createBrushPatternSource : function(sourceElement, xform, width, height) {
		return null;
	},
	
	/** Other **/
	
	makeBrushStyleMatrix : function(brushMatrix, patternPosition, patternSize, sourceWidth, sourceHeight, isStroking) {
		return null;
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

	computePatternPosition : function(horizontalAlignment, verticalAlignment, patternSize, dstWidth, dstHeight) {		
		this.tmpVect.x = (dstWidth - patternSize.width) * horizontalAlignment;
		this.tmpVect.y = (dstHeight - patternSize.height) * verticalAlignment;

		return this.tmpVect;
	},
	
	dashCurrentPath : function(ctx, dashStyle, lineWidth, dashCap, lineCap) {
		return false;
	},

	flattenCurrentPath : function() {
		return null;
	},

	getMustSaveContextForBrush : function(brushParams) {
		return false;
	},

	setContextTransform : function(ctx, mx) {
		
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
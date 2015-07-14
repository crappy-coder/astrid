MoLabel = Class.create(MoControl, {
	initialize : function($super, name) {
		$super(name);

		this.text = "";
		this.textAlign = MoTextAlignment.Left;
		this.textTrimming = MoTextTrimming.None;
		this.maxWidth = NaN;
		this.wordWrap = false;
		this.lineHeight = NaN;
		this.font = new MoFont();
		this.stroke = null;
		this.strokeThickness = 0;
		this.strokePen = null;
		this.actualTextBounds = MoRectangle.Zero();
		this.needsComposition = true;

		this.textBlock = null;
		this.textLines = [];
	},

	getText : function() {
		return this.text;
	},

	setText : function(value) {
		if(this.text != value)
		{
			this.text = MoIsNull(value) ? "" : value.replace("\r\n", "\n").replace("\r", "\n");

			this.invalidateText();
			this.requestMeasure();
			this.requestLayout();
		}
	},
	
	getTextAlignment : function() {
		return this.textAlign;
	},
	
	setTextAlignment : function(value) {
		if(this.textAlign != value)
		{
			this.textAlign = value;
			
			this.invalidateText();
			this.requestMeasure();
			this.requestLayout();
		}
	},
	
	getTextTrimming : function() {
		return this.textTrimming;
	},
	
	setTextTrimming : function(value) {
		if(this.textTrimming != value)
		{
			this.textTrimming = value;
			
			this.invalidateText();
			this.requestMeasure();
			this.requestLayout();
		}
	},
	
	getWordWrap : function() {
		return this.wordWrap;
	},
	
	setWordWrap : function(value) {		
		if(this.wordWrap != value)
		{
			this.wordWrap = value;
			
			this.invalidateText();
			this.requestMeasure();
			this.requestLayout();
		}
	},
	
	getLineHeight : function() {
		return this.lineHeight;
	},

	setLineHeight : function(value) {		
		if(this.lineHeight != value)
		{
			this.lineHeight = value;
			
			this.invalidateText();
			this.requestMeasure();
			this.requestLayout();
		}
	},
	
	getFontName : function() {
		return this.font.getFontName();
	},
	
	setFontName : function(value) {		
		if(this.font.getFontName() != value)
		{
			this.font.setFontName(value);
			
			this.invalidateText();
			this.requestMeasure();
			this.requestLayout();
		}
	},
	
	getFontSize : function() {
		return this.font.getFontSize();
	},
	
	setFontSize : function(value) {		
		if(this.font.getFontSize() != value)
		{
			this.font.setFontSize(value);
			
			this.invalidateText();
			this.requestMeasure();
			this.requestLayout();
		}
	},
	
	getFontStretch : function() {
		return this.font.getFontStretch();
	},
	
	setFontStretch : function(value) {
		if(this.font.getFontStretch() != value)
		{
			this.font.setFontStretch(value);
			
			this.invalidateText();
			this.requestMeasure();
			this.requestLayout();
		}
	},
	
	getFontStyle : function() {
		return this.font.getFontStyle();
	},
	
	setFontStyle : function(value) {
		if(this.font.getFontStyle() != value)
		{
			this.font.setFontStyle(value);
			
			this.invalidateText();
			this.requestMeasure();
			this.requestLayout();
		}
	},
	
	getFontWeight : function() {
		return this.font.getFontWeight();
	},
	
	setFontWeight : function(value) {
		if(this.font.getFontWeight() != value)
		{
			this.font.setFontWeight(value);
			
			this.invalidateText();
			this.requestMeasure();
			this.requestLayout();
		}
	},
	
	getStroke : function() {
		return this.stroke;
	},
	
	setStroke : function(value) {
		if(MoAreNotEqual(this.stroke, value))
		{
			this.stroke = value;
			
			this.invalidateProperties();
			this.requestLayout();
		}
	},

	getStrokeThickness : function() {
		return this.strokeThickness;
	},

	setStrokeThickness : function(value) {
		if(this.strokeThickness != value)
		{
			this.strokeThickness = value;
			
			this.invalidateProperties();
			this.requestLayout();
		}
	},
	
	getMaxWidth : function() {
		return this.maxWidth;
	},
	
	setMaxWidth : function(value) {
		if(this.maxWidth != value)
		{
			this.maxWidth = value;
			
			this.invalidateText();
			this.requestMeasure();
			this.requestLayout();
		}
	},
	
	getTruncationIndicator : function() {
		return (this.textTrimming == MoTextTrimming.None ? "" : "...");
	},
	
	invalidateText : function() {
		this.needsComposition = true;
	},
	
	commitProperties : function($super) {
		$super();
		
		if(this.stroke != null)
		{
			if(this.strokePen == null)
			{
				this.strokePen = new MoPen(this.stroke, this.strokeThickness);
			}
			else
			{
				this.strokePen.setBrush(this.stroke);
				this.strokePen.setThickness(this.strokeThickness);
			}
		}
		else
		{
			this.strokePen = null;
		}
	},
	
	measure : function($super) {
		$super();
		
		var exactWidth = this.getExactWidth();
		var exactHeight = this.getExactHeight();
		
		this.generateLines(Math.max(exactWidth, this.getFontSize()), Math.max(exactHeight, this.getFontSize()));
		this.requestLayout();

		if(!isNaN(this.maxWidth) && this.actualTextBounds.right() > this.maxWidth)
			this.setMeasuredWidth(this.maxWidth);
		else
			this.setMeasuredWidth(this.actualTextBounds.right());

		this.setMeasuredHeight(this.actualTextBounds.bottom());
	},

	layout : function($super, unscaledWidth, unscaledHeight) {
		$super(unscaledWidth, unscaledHeight);
		
		if(this.needsComposition)
			this.generateLines(unscaledWidth, unscaledHeight);
		
		this.graphics.beginPath();
		
		for(var i = 0, len = this.textLines.length; i < len; ++i)
		{
			var line = this.textLines[i];
			
			this.graphics.drawText(line.getString(this.text), line.x, line.y, this.font);
		}		
		
		if(this.getForeground() != null)
			this.graphics.fill(this.getForeground());

		if(this.strokePen != null)
			this.graphics.stroke(this.strokePen);
	},
	
	needsTruncation : function(height, width) {
		// don't exceed the maximum width (if supplied)
		if(!isNaN(this.maxWidth) && (this.actualTextBounds.right() > this.maxWidth || (!isNaN(width) && width > this.maxWidth)))
			return true;
	
		// when we are not word wrapping and the text bounds exceeds
		// our available width, truncation is needed
		if(!isNaN(width) && !this.wordWrap && this.actualTextBounds.right() > width)
			return true;

		// there is only one (or none) line or the height is indeterminate
		// so no truncation is needed
		if(this.textLines.length <= 1 || isNaN(height))
			return false;

		// finally, when the last line exceeds our height, truncation
		// is needed
		var lastLine = this.textLines[this.textLines.length-1];

		return ((lastLine.y + lastLine.height) > height);
	},
	
	truncateText : function(width, height) {
		var somethingFit = false;
		var truncLineIndex = 0;
		
		if(!this.wordWrap)
		{
			this.truncateLines(width, height, false);
			return;
		}
		
		this.truncateLines(width, height, true);
	},
	
	truncateLines : function(width, height, vertical) {
		var indicator =  this.getTruncationIndicator();
		var indicatorLines = [];
		var indicatorBounds = new MoRectangle(0, 0, width, NaN);
		var indicatorTextBlock = new MoTextBlock(indicator, this.font);

 		if(!isNaN(this.maxWidth) || isNaN(width))
			width = this.maxWidth;

		this.createLinesFromTextBlock(indicatorTextBlock, indicatorLines, indicatorBounds);
		
		var maxWidth = width - indicatorBounds.width;
		var previousLine = null;
		
		for(var i = 0, len = this.textLines.length; i < len; ++i)
		{
			var line = this.textLines[i];
			
			if(vertical)
			{
				// this line exceeds our available height
				if(!isNaN(height) && (line.y + line.height) > height)
				{
					// resize our lines down so they all fit
					this.textLines.length = i;

					// now we can just truncate the last line
					var newLine = this.textBlock.createLine(this.textLines[Math.max(this.textLines.length-2, 0)], maxWidth, this.textTrimming);
					
					// make sure the line created actually fits (just in case)
					if((newLine.x + newLine.width) <= width)
					{
						// we don't ever want the truncation indicator to come after a space
						// so we move backwards to make sure we are at a char boundary
						// (i.e. instead of "dog ..." it should be "dog...")
						while(this.text[newLine.startIndex+newLine.length-1] == " "  && newLine.length > 0)
							newLine.length--;

						// copy only what we need over to our original line
						line = this.textLines[this.textLines.length-1];
						line.width = newLine.width;
						line.height = newLine.height;
						line.length = newLine.length;
						line.truncationIndicator = indicator;
					}

					break;
				}
			}
			else
			{
				// truncate the line when it exceeds our available width
				if(!isNaN(width) && (line.x + line.width) > width)
				{
					// create a new text line to fit within our width
					var newLine = this.textBlock.createLine(previousLine, maxWidth, this.textTrimming);

					// make sure the line created actually fits (just in case)
					if((newLine.x + newLine.width) <= width)
					{
						// we don't ever want the truncation indicator to come after a space
						// so we move backwards to make sure we are at a char boundary
						// (i.e. instead of "dog ..." it should be "dog...")
						while(this.text[newLine.startIndex+newLine.length-1] == " " && newLine.length > 0)
							newLine.length--;

						// copy only what we need over to our original line
						line.width = newLine.width;
						line.height = newLine.height;
						line.length = newLine.length;
						line.truncationIndicator = indicator;

						// no need to continue
						//
						// TODO : not sure this is actually true, how to handle the case
						//        when there are multiple lines in a text block
						//        (i.e. separated with a newline) that exceed our bounds?
						//
						break;
					}
				}
			}
			
			previousLine = line;
		}
	},
	
	generateLines : function(width, height) {
		var allLinesCreated = false;
		
		// reset text bounds
		this.actualTextBounds.x = 0;
		this.actualTextBounds.y = 0;
		this.actualTextBounds.width = width;
		this.actualTextBounds.height = height;
		
		// create the lines
		allLinesCreated = this.createLines();
		
		// see if we need to truncate the text
		if(!MoStringIsNullOrEmpty(this.text) && (!allLinesCreated || this.needsTruncation(height, width)))
			this.truncateText(width, height);

		this.needsComposition = false;
	},
	
	createLines : function() {
		this.textLines.length = 0;
		this.textBlock = new MoTextBlock(this.text, this.font);

		return this.createLinesFromTextBlock(this.textBlock, this.textLines, this.actualTextBounds);
	},

	createLinesFromTextBlock : function(textBlock, textLines, bounds) {
		var innerWidth = bounds.width;
		var innerHeight = bounds.height;
		var measureWidth = isNaN(innerWidth);
		var measureHeight = isNaN(innerHeight);

		// don't have a width yet so just use the maximum width (if specified), otherwise
		// just fallback to the user's width, regardless if set or not
		if(measureWidth)
			innerWidth = (!isNaN(this.maxWidth) ? this.maxWidth : this.getWidth());

		var fontSize = this.getFontSize();
		var actualLineHeight = isNaN(this.lineHeight) ? 1.2 * fontSize : this.lineHeight;
		var maxTextWidth = 0;
		var maxLineWidth = this.wordWrap ? innerWidth : 100000;
		var totalTextHeight = 0;
		var n = 0;
		var nextTextLine = null;
		var nextY = 0;
		var textLine = null;
		var allLinesCreated = false;
		var extraLine = false;
		
		// create and calculate each line in the text block
		while(true)
		{
			nextTextLine = textBlock.createLine(textLine, maxLineWidth);
			
			// line could not be created
			if(MoIsNull(nextTextLine))
			{
				allLinesCreated = !extraLine;
				break;
			}

			// increment the vertical position
			nextY += (n == 0 ? 0 : actualLineHeight);
			
			// if we don't need to measure the height, check whether or
			// not this line has exceeded our available height and allow
			// it to be added so we can figure out how much has overflowed
			if(!measureHeight && nextY > innerHeight)
			{
				if(extraLine)
					break;

				extraLine = true;
			}
			
			textLine = nextTextLine;
			textLine.y = nextY;
			maxTextWidth = Math.max(maxTextWidth, textLine.width);
			totalTextHeight += textLine.height;

			textLines[n++] = textLine;
		}
		
		// no lines were created
		if(n == 0)
		{
			bounds.width = 0;
			bounds.height = 0;
			
			return false;
		}
		
		// update sizes
		if(measureWidth)
			innerWidth = maxTextWidth;
		
		if(measureHeight)
			innerHeight = textLine.y + textLine.height;

		innerWidth = Math.ceil(innerWidth);
		innerHeight = Math.ceil(innerHeight);
		
		// compute the alignment positions
		var offsetTop = bounds.y;
		var offsetLeft = bounds.x;
		var offsetCenter = offsetLeft + (innerWidth * 0.5);
		var offsetRight = offsetLeft + innerWidth;
		var leading = (innerHeight - totalTextHeight) / (n - 1);
		var minX = innerWidth;
		var minY = innerHeight;
		var maxX = 0;
		var maxY = 0;

		for(var i = 0; i < n; ++i)
		{
			textLine = textLines[i];
			
			switch(this.textAlign)
			{
				case MoTextAlignment.Left:
					textLine.x = offsetLeft;
					break;
				case MoTextAlignment.Center:
					textLine.x = offsetCenter - (textLine.width * 0.5);
					break;
				case MoTextAlignment.Right:
					textLine.x = offsetRight - textLine.width;
					break;
			}
			
			textLine.y += offsetTop;

			minX = Math.min(minX, textLine.x);
			minY = Math.min(minY, textLine.y);
			maxX = Math.max(maxX, textLine.x + textLine.width);
			maxY = Math.max(maxY, textLine.y + textLine.height);
		}

		// update the bounds
		bounds.x = minX;
		bounds.y = minY;
		bounds.width = maxX - minX;
		bounds.height = maxY - minY;
		
		return allLinesCreated;
	}
});

//
// TODO : put these in separate class files...
//

MoTextLine = Class.create({
	initialize : function(startIndex, length, width, height) {
		this.startIndex = startIndex;
		this.length = length;
		this.y = 0;
		this.x = 0;
		this.width = width;
		this.height = height;
		this.truncationIndicator = "";
	},
	
	getIsTruncated : function() {
		return !MoStringIsNullOrEmpty(this.truncationIndicator);
	},

	getString : function(text) {
		return text.substr(this.startIndex, this.length) + this.truncationIndicator;
	},
	
	getEndIndex : function() {
		return this.startIndex + this.length;
	}
});

MoTextBlock = Class.create({
	initialize : function(text, font) {
		this.text = text;
		this.font = font;
		this.nativeCanvas = this.getFirstAvailableNativeCanvas();
	},

	// TODO : update the use of this so that the MoFont.getStringWidth creates a new canvas
	//        for measuring, this would break if multiple display surfaces are used with fonts
	//        that are different.
	getFirstAvailableNativeCanvas : function() {
		if(MoApplication.getInstance().getDisplaySurfaceCount() > 0)
			return MoApplication.getInstance().getDisplaySurfaceAt(0).getNativeCanvas();

		return null;
	},

	createLine : function(previousLine, width, trimStyle) {
		trimStyle = MoValueOrDefault(trimStyle, MoTextTrimming.Word);
		previousLine = MoValueOrDefault(previousLine, null);
		width = MoValueOrDefault(width, 100000);
		
		// won't be able to measure anything without a native canvas
		if(MoIsNull(this.nativeCanvas))
			return null;

		var startIndex = (MoIsNull(previousLine) ? 0 : previousLine.getEndIndex());
		var widths = [];
		var ch = "";
		var line = "";
		var lineWidth = 0;
		var measuredWidth = 0;
		var measuredHeight = 0;
		var length = 0;
		var lastSpaceIndex = -1;

		if(startIndex >= this.text.length)
			return null;
		
		for(var i = startIndex, len = this.text.length; i < len; ++i)
		{
			ch = this.text[i];
			
			// skip spaces at start
			if(ch == " " && length == 0)
			{
				startIndex++;
				continue;
			}
			
			// compute the width of the line with the new character
			lineWidth = this.font.getStringWidth(this.nativeCanvas, line + ch);
			
			// stop when we've exceeded the available width
			if(lineWidth > width)
				break;

			// save the width of the line at this character so we can
			// quickly look it up later
			widths.push(lineWidth);

			// stop when we hit a newline
			if(ch == "\n")
			{
				length++;
				lastSpaceIndex = -1;
				break;
			}

			// save the last index of a space so we can
			// move back to it quickly
			if(ch == " ")
				lastSpaceIndex = i;

			line += ch;
			length++;
		}

 		// when it's not the last line (or only line) and there was a previous 
		// space character, then we need to move backward to that space so our
		// line ends on a word boundary
		if(trimStyle == MoTextTrimming.Word)
		{
			// compute the new length so we are on a space
			if((startIndex + (length-1)) < this.text.length-1 && lastSpaceIndex != -1)
				length = (lastSpaceIndex - startIndex)+1;
		}

		// update our measurements
		measuredWidth = widths[length-1];
		measuredHeight = this.font.measureString(this.text.substr(startIndex, length), null).height;

		// return a new line structure to use for rendering
		return new MoTextLine(startIndex, length, measuredWidth, measuredHeight);
	}
});
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
		this.needsComposition = true;

		this.nativeTextBlock = null;
	},
	
	setForeground : function(value) {
		if(MoAreNotEqual(this.foreground, value))
		{
			this.foreground = value;
			
			this.invalidateText();
			this.requestMeasure();
			this.requestLayout();
		}
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
		}
	},
	
	getTextAlignment : function() {
		return this.textAlign;
	},
	
	setTextAlignment : function(value) {
		if(this.textAlign != value)
		{
			this.textAlign = value;
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

	measure : function($super) {
		$super();

		var exactWidth = this.getExactWidth();
		var exactHeight = this.getExactHeight();

		this.generateTextBlock(Math.max(exactWidth, this.getFontSize()), Math.max(exactHeight, this.getFontSize()));
		this.requestLayout();

		if(!MoIsNull(this.nativeTextBlock))
		{
			if(!isNaN(this.maxWidth) && this.nativeTextBlock.naturalWidth > this.maxWidth)
				this.setMeasuredWidth(this.maxWidth);
			else
				this.setMeasuredWidth(this.nativeTextBlock.naturalWidth);
		
			this.setMeasuredHeight(this.nativeTextBlock.naturalHeight);
		}
	},

	layout : function($super, unscaledWidth, unscaledHeight) {
		$super(unscaledWidth, unscaledHeight);

		this.removeTextBlock();

		if(this.needsComposition)
			this.generateTextBlock(unscaledWidth, unscaledHeight);

		if(!MoIsNull(this.nativeTextBlock))
			this.nativeContainer.addChild(this.nativeTextBlock);
	},

	removeTextBlock : function() {
		if(!MoIsNull(this.nativeTextBlock) && this.nativeContainer.contains(this.nativeTextBlock))
		{
			this.nativeContainer.removeChild(this.nativeTextBlock);
			this.nativeTextBlock.unload();
			this.nativeTextBlock = null;
		}
	},
	
	generateTextBlock : function(width, height) {
		this.removeTextBlock();
		
		if(MoStringIsNullOrEmpty(this.text))
			return;

		var innerWidth = width;
		var innerHeight = height;
		var measureWidth = isNaN(innerWidth);
		var measureHeight = isNaN(innerHeight);

		if(measureWidth)
			innerWidth = this.getWidth();

		if(measureHeight)
			innerHeight = this.getHeight();

		var fontSize = this.getFontSize();
		var actualLineHeight = isNaN(this.lineHeight) ? 1.2 * fontSize : this.lineHeight;
		var maxLineWidth = this.wordWrap ? innerWidth : (isNaN(this.maxWidth) ? 100000 : this.maxWidth);
		var maxLineCount = (actualLineHeight <= 0 ? 0 : Math.round(innerHeight / actualLineHeight));
		var textFormat = {
			alignment : this.getTextAlignmentString(),
			color : this.getTextColor(),
			continueMark : this.getTruncationIndicator(),
			font : this.getFontName(),
			lineSpacing : actualLineHeight - (1.2 * fontSize),
			maxLines : maxLineCount,
			preserveSpaces : true,
			size : fontSize
		};

		this.nativeTextBlock = engine.createTextBlock(this.text, textFormat, maxLineWidth);
		this.needsComposition = false;
	},
	
	getTextAlignmentString : function() {
		switch(this.textAlign)
		{
			case MoTextAlignment.Center:
				return "center";
			case MoTextAlignment.Right:
				return "right";
		}

		return "left";
	},
	
	getTextColor : function() {
		var color = [0, 0, 0, 1];
		
		if(!MoIsNull(this.foreground) && (this.foreground instanceof MoSolidColorBrush))
			color = this.foreground.getColor().toArray();
		
		return color;
	}
});
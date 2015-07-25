import Control from "./Control";
import TextAlignment from "./../text/TextAlignment";
import TextTrimming from "./../text/TextTrimming";
import Font from "./../text/Font";
import Rectangle from "./../Rectangle";
import Pen from "./Pen";
import { AreNotEqual, ValueOrDefault } from "./../Engine";
import Application from "./../Application";

class Label extends Control {
	constructor(name) {
		super(name);

		this.text = "";
		this.textAlign = TextAlignment.Left;
		this.textTrimming = TextTrimming.None;
		this.maxWidth = NaN;
		this.wordWrap = false;
		this.lineHeight = NaN;
		this.font = new Font();
		this.stroke = null;
		this.strokeThickness = 0;
		this.strokePen = null;
		this.actualTextBounds = Rectangle.Zero();
		this.needsComposition = true;

		this.textBlock = null;
		this.textLines = [];
	}

	getText() {
		return this.text;
	}

	setText(value) {
		if (this.text != value) {
			this.text = value == null ? "" : value.replace("\r\n", "\n").replace("\r", "\n");

			this.invalidateText();
			this.requestMeasure();
			this.requestLayout();
		}
	}

	getTextAlignment() {
		return this.textAlign;
	}

	setTextAlignment(value) {
		if (this.textAlign != value) {
			this.textAlign = value;

			this.invalidateText();
			this.requestMeasure();
			this.requestLayout();
		}
	}

	getTextTrimming() {
		return this.textTrimming;
	}

	setTextTrimming(value) {
		if (this.textTrimming != value) {
			this.textTrimming = value;

			this.invalidateText();
			this.requestMeasure();
			this.requestLayout();
		}
	}

	getWordWrap() {
		return this.wordWrap;
	}

	setWordWrap(value) {
		if (this.wordWrap != value) {
			this.wordWrap = value;

			this.invalidateText();
			this.requestMeasure();
			this.requestLayout();
		}
	}

	getLineHeight() {
		return this.lineHeight;
	}

	setLineHeight(value) {
		if (this.lineHeight != value) {
			this.lineHeight = value;

			this.invalidateText();
			this.requestMeasure();
			this.requestLayout();
		}
	}

	getFontName() {
		return this.font.getFontName();
	}

	setFontName(value) {
		if (this.font.getFontName() != value) {
			this.font.setFontName(value);

			this.invalidateText();
			this.requestMeasure();
			this.requestLayout();
		}
	}

	getFontSize() {
		return this.font.getFontSize();
	}

	setFontSize(value) {
		if (this.font.getFontSize() != value) {
			this.font.setFontSize(value);

			this.invalidateText();
			this.requestMeasure();
			this.requestLayout();
		}
	}

	getFontStretch() {
		return this.font.getFontStretch();
	}

	setFontStretch(value) {
		if (this.font.getFontStretch() != value) {
			this.font.setFontStretch(value);

			this.invalidateText();
			this.requestMeasure();
			this.requestLayout();
		}
	}

	getFontStyle() {
		return this.font.getFontStyle();
	}

	setFontStyle(value) {
		if (this.font.getFontStyle() != value) {
			this.font.setFontStyle(value);

			this.invalidateText();
			this.requestMeasure();
			this.requestLayout();
		}
	}

	getFontWeight() {
		return this.font.getFontWeight();
	}

	setFontWeight(value) {
		if (this.font.getFontWeight() != value) {
			this.font.setFontWeight(value);

			this.invalidateText();
			this.requestMeasure();
			this.requestLayout();
		}
	}

	getStroke() {
		return this.stroke;
	}

	setStroke(value) {
		if (AreNotEqual(this.stroke, value)) {
			this.stroke = value;

			this.invalidateProperties();
			this.requestLayout();
		}
	}

	getStrokeThickness() {
		return this.strokeThickness;
	}

	setStrokeThickness(value) {
		if (this.strokeThickness != value) {
			this.strokeThickness = value;

			this.invalidateProperties();
			this.requestLayout();
		}
	}

	getMaxWidth() {
		return this.maxWidth;
	}

	setMaxWidth(value) {
		if (this.maxWidth != value) {
			this.maxWidth = value;

			this.invalidateText();
			this.requestMeasure();
			this.requestLayout();
		}
	}

	getTruncationIndicator() {
		return (this.textTrimming == TextTrimming.None ? "" : "...");
	}

	invalidateText() {
		this.needsComposition = true;
	}

	commitProperties() {
		super.commitProperties();

		if (this.stroke != null) {
			if (this.strokePen == null) {
				this.strokePen = new Pen(this.stroke, this.strokeThickness);
			}
			else {
				this.strokePen.setBrush(this.stroke);
				this.strokePen.setThickness(this.strokeThickness);
			}
		}
		else {
			this.strokePen = null;
		}
	}

	measure() {
		super.measure();

		var exactWidth = this.getExactWidth();
		var exactHeight = this.getExactHeight();

		this.generateLines(Math.max(exactWidth, this.getFontSize()), Math.max(exactHeight, this.getFontSize()));
		this.requestLayout();

		if (!isNaN(this.maxWidth) && this.actualTextBounds.right() > this.maxWidth) {
			this.setMeasuredWidth(this.maxWidth);
		}
		else {
			this.setMeasuredWidth(this.actualTextBounds.right());
		}

		this.setMeasuredHeight(this.actualTextBounds.bottom());
	}

	layout(unscaledWidth, unscaledHeight) {
		super.layout(unscaledWidth, unscaledHeight);

		if (this.needsComposition) {
			this.generateLines(unscaledWidth, unscaledHeight);
		}

		this.graphics.beginPath();

		for (var i = 0, len = this.textLines.length; i < len; ++i) {
			var line = this.textLines[i];

			this.graphics.drawText(line.getString(this.text), line.x, line.y, this.font);
		}

		if (this.getForeground() != null) {
			this.graphics.fill(this.getForeground());
		}

		if (this.strokePen != null) {
			this.graphics.stroke(this.strokePen);
		}
	}

	needsTruncation(height, width) {
		// don't exceed the maximum width (if supplied)
		if (!isNaN(this.maxWidth) &&
				(this.actualTextBounds.right() > this.maxWidth || (!isNaN(width) && width > this.maxWidth))) {
			return true;
		}

		// when we are not word wrapping and the text bounds exceeds
		// our available width, truncation is needed
		if (!isNaN(width) && !this.wordWrap && this.actualTextBounds.right() > width) {
			return true;
		}

		// there is only one (or none) line or the height is indeterminate
		// so no truncation is needed
		if (this.textLines.length <= 1 || isNaN(height)) {
			return false;
		}

		// finally, when the last line exceeds our height, truncation
		// is needed
		var lastLine = this.textLines[this.textLines.length - 1];

		return ((lastLine.y + lastLine.height) > height);
	}

	truncateText(width, height) {
		if (!this.wordWrap) {
			this.truncateLines(width, height, false);
			return;
		}

		this.truncateLines(width, height, true);
	}

	truncateLines(width, height, vertical) {
		var indicator = this.getTruncationIndicator();
		var indicatorLines = [];
		var indicatorBounds = new Rectangle(0, 0, width, NaN);
		var indicatorTextBlock = new TextBlock(indicator, this.font);

		if (!isNaN(this.maxWidth) || isNaN(width)) {
			width = this.maxWidth;
		}

		this.createLinesFromTextBlock(indicatorTextBlock, indicatorLines, indicatorBounds);

		var maxWidth = width - indicatorBounds.width;
		var previousLine = null;
		var newLine;

		for (var i = 0, len = this.textLines.length; i < len; ++i) {
			var line = this.textLines[i];

			if (vertical) {
				// this line exceeds our available height
				if (!isNaN(height) && (line.y + line.height) > height) {
					// resize our lines down so they all fit
					this.textLines.length = i;

					// now we can just truncate the last line
					newLine = this.textBlock.createLine(this.textLines[Math.max(this.textLines.length -
							2, 0)], maxWidth, this.textTrimming);

					// make sure the line created actually fits (just in case)
					if ((newLine.x + newLine.width) <= width) {
						// we don't ever want the truncation indicator to come after a space
						// so we move backwards to make sure we are at a char boundary
						// (i.e. instead of "dog ..." it should be "dog...")
						while (this.text[newLine.startIndex + newLine.length - 1] == " " && newLine.length > 0) {
							newLine.length--;
						}

						// copy only what we need over to our original line
						line = this.textLines[this.textLines.length - 1];
						line.width = newLine.width;
						line.height = newLine.height;
						line.length = newLine.length;
						line.truncationIndicator = indicator;
					}

					break;
				}
			}
			else {
				// truncate the line when it exceeds our available width
				if (!isNaN(width) && (line.x + line.width) > width) {
					// create a new text line to fit within our width
					newLine = this.textBlock.createLine(previousLine, maxWidth, this.textTrimming);

					// make sure the line created actually fits (just in case)
					if ((newLine.x + newLine.width) <= width) {
						// we don't ever want the truncation indicator to come after a space
						// so we move backwards to make sure we are at a char boundary
						// (i.e. instead of "dog ..." it should be "dog...")
						while (this.text[newLine.startIndex + newLine.length - 1] == " " && newLine.length > 0) {
							newLine.length--;
						}

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
	}

	generateLines(width, height) {

		// reset text bounds
		this.actualTextBounds.x = 0;
		this.actualTextBounds.y = 0;
		this.actualTextBounds.width = width;
		this.actualTextBounds.height = height;

		// create the lines
		var allLinesCreated = this.createLines();

		// see if we need to truncate the text
		if (this.text && (!allLinesCreated || this.needsTruncation(height, width))) {
			this.truncateText(width, height);
		}

		this.needsComposition = false;
	}

	createLines() {
		this.textLines.length = 0;
		this.textBlock = new TextBlock(this.text, this.font);

		return this.createLinesFromTextBlock(this.textBlock, this.textLines, this.actualTextBounds);
	}

	createLinesFromTextBlock(textBlock, textLines, bounds) {
		var innerWidth = bounds.width;
		var innerHeight = bounds.height;
		var measureWidth = isNaN(innerWidth);
		var measureHeight = isNaN(innerHeight);

		// don't have a width yet so just use the maximum width (if specified), otherwise
		// just fallback to the user's width, regardless if set or not
		if (measureWidth) {
			innerWidth = (!isNaN(this.maxWidth) ? this.maxWidth : this.getWidth());
		}

		var fontSize = this.getFontSize();
		var actualLineHeight = isNaN(this.lineHeight) ? 1.2 * fontSize : this.lineHeight;
		var maxTextWidth = 0;
		var maxLineWidth = this.wordWrap ? innerWidth : 100000;
		var totalTextHeight = 0;
		var n = 0;
		var nextTextLine;
		var nextY = 0;
		var textLine = null;
		var allLinesCreated = false;
		var extraLine = false;

		// create and calculate each line in the text block
		while (true) {
			nextTextLine = textBlock.createLine(textLine, maxLineWidth);

			// line could not be created
			if (nextTextLine == null) {
				allLinesCreated = !extraLine;
				break;
			}

			// increment the vertical position
			nextY += (n == 0 ? 0 : actualLineHeight);

			// if we don't need to measure the height, check whether or
			// not this line has exceeded our available height and allow
			// it to be added so we can figure out how much has overflowed
			if (!measureHeight && nextY > innerHeight) {
				if (extraLine) {
					break;
				}

				extraLine = true;
			}

			textLine = nextTextLine;
			textLine.y = nextY;
			maxTextWidth = Math.max(maxTextWidth, textLine.width);
			totalTextHeight += textLine.height;

			textLines[n++] = textLine;
		}

		// no lines were created
		if (n == 0) {
			bounds.width = 0;
			bounds.height = 0;

			return false;
		}

		// update sizes
		if (measureWidth) {
			innerWidth = maxTextWidth;
		}

		if (measureHeight) {
			innerHeight = textLine.y + textLine.height;
		}

		innerWidth = Math.ceil(innerWidth);
		innerHeight = Math.ceil(innerHeight);

		// compute the alignment positions
		var offsetTop = bounds.y;
		var offsetLeft = bounds.x;
		var offsetCenter = offsetLeft + (innerWidth * 0.5);
		var offsetRight = offsetLeft + innerWidth;
		var minX = innerWidth;
		var minY = innerHeight;
		var maxX = 0;
		var maxY = 0;

		for (var i = 0; i < n; ++i) {
			textLine = textLines[i];

			switch (this.textAlign) {
				case TextAlignment.Left:
					textLine.x = offsetLeft;
					break;
				case TextAlignment.Center:
					textLine.x = offsetCenter - (textLine.width * 0.5);
					break;
				case TextAlignment.Right:
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
}

//
// TODO : put these in separate class files...
//

class TextLine {
	constructor(startIndex, length, width, height) {
		this.startIndex = startIndex;
		this.length = length;
		this.y = 0;
		this.x = 0;
		this.width = width;
		this.height = height;
		this.truncationIndicator = "";
	}

	getIsTruncated() {
		return !!this.truncationIndicator;
	}

	getString(text) {
		return text.substr(this.startIndex, this.length) + this.truncationIndicator;
	}

	getEndIndex() {
		return this.startIndex + this.length;
	}
}

class TextBlock {
	constructor(text, font) {
		this.text = text;
		this.font = font;
		this.nativeCanvas = this.getFirstAvailableNativeCanvas();
	}

	// TODO : update the use of this so that the Font.getStringWidth creates a new canvas
	//        for measuring, this would break if multiple display surfaces are used with fonts
	//        that are different.
	getFirstAvailableNativeCanvas() {
		if (Application.getInstance().getDisplaySurfaceCount() > 0) {
			return Application.getInstance().getDisplaySurfaceAt(0).getNativeCanvas();
		}

		return null;
	}

	createLine(previousLine, width, trimStyle) {
		trimStyle = ValueOrDefault(trimStyle, TextTrimming.Word);
		previousLine = ValueOrDefault(previousLine, null);
		width = ValueOrDefault(width, 100000);

		// won't be able to measure anything without a native canvas
		if (this.nativeCanvas == null) {
			return null;
		}

		var startIndex = (previousLine == null ? 0 : previousLine.getEndIndex());
		var widths = [];
		var ch = "";
		var line = "";
		var lineWidth = 0;
		var measuredWidth, measuredHeight;
		var length = 0;
		var lastSpaceIndex = -1;

		if (startIndex >= this.text.length) {
			return null;
		}

		for (var i = startIndex, len = this.text.length; i < len; ++i) {
			ch = this.text[i];

			// skip spaces at start
			if (ch == " " && length == 0) {
				startIndex++;
				continue;
			}

			// compute the width of the line with the new character
			lineWidth = this.font.getStringWidth(this.nativeCanvas, line + ch);

			// stop when we've exceeded the available width
			if (lineWidth > width) {
				break;
			}

			// save the width of the line at this character so we can
			// quickly look it up later
			widths.push(lineWidth);

			// stop when we hit a newline
			if (ch == "\n") {
				length++;
				lastSpaceIndex = -1;
				break;
			}

			// save the last index of a space so we can
			// move back to it quickly
			if (ch == " ") {
				lastSpaceIndex = i;
			}

			line += ch;
			length++;
		}

		// when it's not the last line (or only line) and there was a previous
		// space character, then we need to move backward to that space so our
		// line ends on a word boundary
		if (trimStyle == TextTrimming.Word) {
			// compute the new length so we are on a space
			if ((startIndex + (length - 1)) < this.text.length - 1 && lastSpaceIndex != -1) {
				length = (lastSpaceIndex - startIndex) + 1;
			}
		}

		// update our measurements
		measuredWidth = widths[length - 1];
		measuredHeight = this.font.measureString(this.text.substr(startIndex, length), null).height;

		// return a new line structure to use for rendering
		return new TextLine(startIndex, length, measuredWidth, measuredHeight);
	}
}

export default Label;

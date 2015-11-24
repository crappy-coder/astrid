import EventDispatcher from "../../../src/EventDispatcher"
import { ValueOrDefault, IsNull } from "../../../src/Engine"
import Pair from "../../../src/Pair"
import Font from "../../../src/text/Font"
import FontStyle from "../../../src/text/FontStyle"
import FontStretch from "../../../src/text/FontStretch"
import FontWeight from "../../../src/text/FontWeight"
import LoadEvent from "../../../src/LoadEvent"

class FontLoader extends EventDispatcher {
	constructor(showRenderTests) {
		super();

		this.fonts = [];
		this.fontSurface = document.createElement("canvas");
		this.showRenderTests = ValueOrDefault(showRenderTests, false);
		this.currentLoadCount = 0;
	}

	getCount() {
		return this.fonts.length;
	}

	getCurrentLoadCount() {
		return this.currentLoadCount;
	}

	add(name, srcOrDataUri) {
		this.fonts.push(new Pair(name, srcOrDataUri));
	}

	load() {
		var styleSheet = document.styleSheets && document.styleSheets[0];

		if(IsNull(styleSheet))
			throw new Error("Unable to load fonts, the document has not finished loading. Load can only be called when the document is in a readyState of 'complete'.");


		var docWidth = document.body.offsetWidth;
		var docHeight = document.body.offsetHeight;

		this.fontSurface.width = 400;
		this.fontSurface.height = 40;
		this.clearFontSurface();

		if(this.showRenderTests)
		{
			this.fontSurface.style.position = "absolute";
			this.fontSurface.style.zIndex = "99";
			this.fontSurface.style.left = ((docWidth - 400) * 0.5) + "px";
			this.fontSurface.style.top = ((docHeight - 40) * 0.5) + "px";

			document.body.insertBefore(this.fontSurface, document.body.firstElementChild);
		}

		this.currentLoadCount = 0;
		this.loadNext(styleSheet);
	}

	loadNext(styleSheet) {
		if(this.currentLoadCount < this.getCount())
		{
			var me = this;
			setTimeout(function() {
				me.loadNextImpl(styleSheet);
			}, (this.showRenderTests ? 500 : 1));
		}
		else
		{
			if(document.body.contains(this.fontSurface))
				document.body.removeChild(this.fontSurface);

			this.dispatchEvent(new LoadEvent(LoadEvent.SUCCESS));
		}
	}

	loadNextImpl(styleSheet) {
		var font = this.fonts[this.currentLoadCount];
		var fontStyle = Font.create(font.getFirst(), FontStyle.Normal, FontWeight.Normal, FontStretch.Normal, 20);

		styleSheet.insertRule(fontStyle.toCSSFontRule(font.getSecond()), styleSheet.cssRules.length);

		this.renderFont(fontStyle);

		this.currentLoadCount++;
		this.loadNext(styleSheet);
	}

	renderFont(fontStyle) {
		this.clearFontSurface();

		var ctx = this.fontSurface.getContext("2d");
		ctx.save();
		ctx.fillStyle = "#fff";
		ctx.textBaseline = "top";
		ctx.font = fontStyle.toString();
		ctx.fillText(fontStyle.getFontName(), (400 - ctx.measureText(fontStyle.getFontName()).width) * 0.5, (0.7 * 20) * 0.5);
		ctx.restore();
	}

	clearFontSurface() {
		var ctx = this.fontSurface.getContext("2d");
		ctx.save();
		ctx.clearRect(0, 0, 400, 40);
		ctx.rect(0, 0, 400, 40);
		ctx.fillStyle = "#000";
		ctx.fill();
		ctx.restore();
	}
}

export default FontLoader;
import Rectangle from "./../Rectangle";

class Screen {
	constructor(screen) {
		this.pixelScale = (window.devicePixelRatio == null ? 1 : window.devicePixelRatio);
		this.colorDepth = screen.colorDepth;
		this.bounds = new Rectangle(screen.left, screen.top, screen.width, screen.height);
		this.visibleBounds = new Rectangle(screen.availLeft, screen.availTop, screen.availWidth, screen.availHeight);
	}

	getColorDepth() {
		return this.colorDepth;
	}

	getPixelScale() {
		return this.pixelScale;
	}

	getBounds() {
		return this.bounds;
	}

	getVisibleBounds() {
		return this.visibleBounds;
	}

	static getCurrent() {
		if (Screen.Instance == null) {
			Screen.Instance = new Screen(window.screen);
		}

		return Screen.Instance;
	}
}

export default Screen;

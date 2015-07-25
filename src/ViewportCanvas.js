import Canvas from "./Canvas";
import MouseEvent from "./input/useEvent";
import Vector2D from "./math/Vector2D";

class ViewportCanvas extends Canvas {
	constructor(name) {
		super(name);

		this.viewportContent = new Canvas(name + "_content");
		this.viewportContent.setPercentWidth(100);
		this.viewportContent.setPercentHeight(100);
		this.isPanning = false;
		this.originX = 0;
		this.originY = 0;
		this.autoPan = true;

		this.setIsHitTestChildrenEnabled(false);
		this.add(this.viewportContent);

		this.addEventHandler(MouseEvent.MOUSE_DOWN, this.handleMouseDownEvent.asDelegate(this));
		this.addEventHandler(MouseEvent.MOUSE_UP, this.handleMouseUpEvent.asDelegate(this));
		this.addEventHandler(MouseEvent.MOUSE_UP_OUTSIDE, this.handleMouseUpOutsideEvent.asDelegate(this));
		this.addEventHandler(MouseEvent.MOUSE_LEAVE, this.handleMouseLeaveEvent.asDelegate(this));
		this.addEventHandler(MouseEvent.MOUSE_MOVE, this.handleMouseMoveEvent.asDelegate(this));
	}

	addContent(content) {
		this.viewportContent.add(content);
	}

	addContentAt(content, idx) {
		this.viewportContent.addAt(content, idx);
	}

	removeContent(content) {
		return this.viewportContent.remove(content);
	}

	removeContentAt(idx) {
		return this.viewportContent.removeAt(idx);
	}

	removeContentByName(name) {
		return this.viewportContent.removeByName(name);
	}

	getContentAt(idx) {
		return this.viewportContent.getAt(idx);
	}

	getContentByName(name) {
		return this.viewportContent.getByName(name);
	}

	indexOfContent(content) {
		return this.viewportContent.indexOf(content);
	}

	clearContent() {
		this.viewportContent.clear();
	}

	isContentEmpty() {
		return this.viewportContent.isEmpty();
	}

	contentExists(content) {
		return this.viewportContent.exists(content);
	}

	getContentCount() {
		return this.viewportContent.getCount();
	}

	getAutoPan() {
		return this.autoPan;
	}

	setAutoPan(value) {
		this.autoPan = value;
	}

	getContent() {
		return this.viewportContent;
	}

	setContentOffset(x, y) {
		this.viewportContent.setX(x);
		this.viewportContent.setY(y);
	}

	getContentOffset() {
		return new Vector2D(this.viewportContent.getX(), this.viewportContent.getY());
	}

	handleMouseDownEvent(event) {
		if (!this.getAutoPan()) {
			return;
		}

		var offset = this.getContentOffset();

		this.isPanning = true;
		this.originX = event.x - offset.x;
		this.originY = event.y - offset.y;
	}

	handleMouseUpEvent(event) {
		this.isPanning = false;
	}

	handleMouseUpOutsideEvent(event) {
		this.isPanning = false;
	}

	handleMouseLeaveEvent(event) {
		this.isPanning = false;
	}

	handleMouseMoveEvent(event) {
		if (this.getAutoPan() && this.isPanning) {
			var x = event.x - this.originX;
			var y = event.y - this.originY;

			this.setContentOffset(x, y);
		}
	}
}

export default ViewportCanvas;

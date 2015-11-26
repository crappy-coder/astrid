import Application from "../../../src/Application";
import Event from "../../../src/Event";
import LoadEvent from "../../../src/LoadEvent"
import Canvas from "../../../src/ui/Canvas";
import StackPanel from "../../../src/ui/StackPanel";
import Color from "../../../src/graphics/Color"
import SolidColorBrush from "../../../src/brushes/SolidColorBrush"
import ShapeRectangle from "../../../src/shapes/ShapeRectangle"
import Vector2D from "../../../src/Vector2D"
import DebugFlags from "../../../src/DebugFlags"

class MainApplication extends Application {
	constructor(width, height) {
		super(width, height);

		this.surface = null;
		this.mainContent = null;
		this.setEnableKeyboardEvents(true);
		this.setEnableMouseEvents(true);
		this.setEnableTouchEvents(false);
		this.setEnableGestureEvents(false);
		this.setEnableGamepadEvents(false);
		this.setAutoScaleDisplaySurface(false);

		this.addEventHandler(Event.APPLICATION_START, this.onApplicationStart.d(this));
	}

	onApplicationStart() {
		this.setBackgroundColor(Color.black());
		this.setup();
	}

	setup() {
		this.surface = this.getDisplaySurface();
		this.surface.setPercentWidth(100);
		this.surface.setPercentHeight(100);

		this.mainContent = new Canvas("main-content");
		this.mainContent.setWidth(this.surface.getWidth());
		this.mainContent.setHeight(this.surface.getHeight());
		this.surface.setChild(this.mainContent);

		var rect = new ShapeRectangle("rect");
		rect.setX(20);
		rect.setY(20);
		rect.setWidth(300);
		rect.setHeight(200)
		rect.setRadius(8);
		rect.setStroke(SolidColorBrush.white());
		rect.setStrokeThickness(3);
		rect.setFill(SolidColorBrush.blue());

		this.mainContent.add(rect);
	}
}

export default MainApplication;
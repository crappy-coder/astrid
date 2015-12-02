import Application from "../../../src/Application";
import Event from "../../../src/Event";
import LoadEvent from "../../../src/LoadEvent"
import Canvas from "../../../src/ui/Canvas";
import StackPanel from "../../../src/ui/StackPanel";
import RadialGradientBrush from "../../../src/brushes/RadialGradientBrush";
import Color from "../../../src/graphics/Color"
import Vector2D from "../../../src/Vector2D"
import DebugFlags from "../../../src/DebugFlags"
import Gamepad from "../../../src/input/Gamepad";
import GamepadEvent from "../../../src/input/GamepadEvent";
import GamepadButtonMap from "../../../src/input/GamepadButtonMap";
import GamepadAxesMap from "../../../src/input/GamepadAxesMap";
import ScreenNavigator from "./ScreenNavigator"
import FontLoader from "./FontLoader"
import { FontSources } from "./Fonts"

class MainApplication extends Application {
	constructor(width, height) {
		super(width, height);

		if(grandCentralDevice)
		{
			this.sys = grandCentralDevice.makeService('system');
			this.sys.init();
		}

		this.surface = null;
		this.mainContent = null;
		this.setEnableGamepadEvents(true);
		this.setEnableKeyboardEvents(true);
		this.setEnableMouseEvents(false);
		this.setEnableTouchEvents(false);
		this.setEnableGestureEvents(false);
		this.setAutoScaleDisplaySurface(true);
		this.setGamepadButtonMap(GamepadButtonMap.PS4);
		this.setGamepadAxesMap(GamepadAxesMap.PS4);
		this.addEventHandler(Event.APPLICATION_START, this.onApplicationStart.d(this));

		this.fontLoader = new FontLoader();
		this.fontLoader.addEventHandler(LoadEvent.SUCCESS, this.onFontsLoaded.d(this));

		for(var i = 0; i < FontSources.length; ++i)
			this.fontLoader.add(FontSources[i].getFirst(), FontSources[i].getSecond());

		Gamepad.getInstance().addEventHandler(GamepadEvent.CONNECTED, this.onGamepadConnected.d(this));
		Gamepad.getInstance().addEventHandler(GamepadEvent.DISCONNECTED, this.onGamepadDisconnected.d(this));
	}

	onFontsLoaded() {
		this.fontLoader.removeEventHandler(LoadEvent.SUCCESS, this.onFontsLoaded.d(this));
		this.setup();
	}

	onApplicationStart() {
		this.setBackgroundColor(Color.black());
		this.fontLoader.load();
	}

	onGamepadConnected(e) {
		var state = Gamepad.getState(e.getIndex());

		if(state)
			Gamepad.setInputIndex(e.getIndex());
	}

	onGamepadDisconnected(e) {
		if(e.getIndex() === Gamepad.getInputIndex())
			Gamepad.setInputIndex(0);
	}

	setup() {
		this.surface = this.getDisplaySurface();
		this.surface.setPercentWidth(100);
		this.surface.setPercentHeight(100);

		this.mainContent = new ScreenNavigator("screen-navigator");
		this.mainContent.setWidth(this.surface.getWidth());
		this.mainContent.setHeight(this.surface.getHeight());
		this.mainContent.backgroundImageUrl = "images/mock/bg-main.jpg";
		this.mainContent.focus();

		this.surface.setChild(this.mainContent);

		if(grandCentralDevice)
			this.sys.ready();
	}
}

export default MainApplication;
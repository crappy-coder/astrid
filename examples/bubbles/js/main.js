import Application from "../../../src/Application";
import DisplaySurface from "../../../src/ui/DisplaySurface";
import SolidColorBrush from "../../../src/brushes/SolidColorBrush";
import Canvas from "../../../src/ui/Canvas";
import Event from "../../../src/Event";
import Bubble from "./bubble";

document.addEventListener("DOMContentLoaded", setup);

function setup() {
	var app = new Application();
	app.setEnableStatsGraph(true);

	var surface = DisplaySurface.fromCanvas(document.getElementById("main"));

	var content = new Canvas("mainContent");
	content.setPercentWidth(100);
	content.setPercentHeight(100);
	content.setBackground(SolidColorBrush.fromColorHex("#000000"));

	surface.setChild(content);

	app.setDisplaySurface(surface);

	app.addEventHandler(Event.UI_ORIENTATION_CHANGE, handleOrientationChange);

	initBubbles(content);
}

function handleOrientationChange(event) {
	console.log(Application.getInstance().getOrientation());
}

function initBubbles(content) {
	var bubble = new Bubble("bubble01");
	bubble.setWidth(300);
	bubble.setHeight(100);
	bubble.setStartX(400);
	bubble.setStartY(400);
	bubble.setGravity(-0.0008);
	content.add(bubble);

	bubble = new Bubble("bubble02");
	bubble.setWidth(300);
	bubble.setHeight(1);
	bubble.setRadius(75);
	bubble.setStartX(100);
	bubble.setStartY(500);
	bubble.setGravity(-0.00035);
	content.add(bubble);

	bubble = new Bubble("bubble03");
	bubble.setWidth(300);
	bubble.setHeight(1);
	bubble.setRadius(25);
	bubble.setStartX(250);
	bubble.setStartY(450);
	bubble.setGravity(-0.0005);
	content.add(bubble);
}

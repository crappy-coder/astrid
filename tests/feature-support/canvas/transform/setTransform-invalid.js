var CANVAS_WIDTH 	= 300;
var CANVAS_HEIGHT 	= 300;
var SPEED 			=  25; // ms

var gCanvas = null;

window.addEventListener("load", function() {
	setup();

	var ctx = gCanvas.getContext("2d");
	
	// no args
	try
	{
		ctx.setTransform();
	} catch(e) { console.log(e); }
	
	// too many args
	try
	{
		ctx.setTransform(1,2,3,4,5,6,7);
	} catch(e) { console.log(e); }
});

function setup() {
	gCanvas = document.createElement("canvas");
	gCanvas.width = CANVAS_WIDTH;
	gCanvas.height = CANVAS_HEIGHT;

	document.body.appendChild(gCanvas);
	document.body.style.backgroundColor = "#ffffff";

	var ctx = gCanvas.getContext("2d");
	ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}
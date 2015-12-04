var CANVAS_WIDTH = 256;
var CANVAS_HEIGHT = 256;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();
	
	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {

	var errorThrown = false;
	
	try
	{
		// !!
		// TODO : the spec says this is supposed to fail, however, I think the moEnjin
		//        runtime should actually allow this as a convienence.
		// !!
		ctx.createPattern("../../../resources/color-grid.png", "repeat");
	}
	catch(e)
	{
		if(e.code != DOMException.TYPE_MISMATCH_ERR)
			console.log("Expected exception of type TYPE_MISMATCH_ERR, got: " + e.message);

		errorThrown = true;
	}
	finally
	{
		if(!errorThrown)
			console.log("Expected an exception (TYPE_MISMATCH_ERR) to be thrown.");
	}

}

function setup() {
	gCanvas = document.createElement("canvas");
	gCanvas.width = CANVAS_WIDTH;
	gCanvas.height = CANVAS_HEIGHT;

	document.body.appendChild(gCanvas);
	document.body.style.backgroundColor = "#ffffff";

	var ctx = gCanvas.getContext("2d");
	ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}
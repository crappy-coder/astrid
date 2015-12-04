var CANVAS_WIDTH = 256;
var CANVAS_HEIGHT = 256;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();
	
	var ctx = gCanvas.getContext("2d");

	draw(ctx);
});

function draw(ctx) {
	
	ctx.fillStyle = "#0f0";
	ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

	var n = 0;
	var img = new Image();
	img.addEventListener("load", function() {
		
		if(n == 0)
		{
			ctx.drawImage(img, 0, 0, 1, 1, 0, 0, 256, 256);
			n++;
			img.src = "../../resources/bwgrid.png";
			return;
		}
		
		ctx.drawImage(img, 0, 0, 256, 256, 128, -128, 128, 128);
		ctx.drawImage(img, 0, 0, 256, 256, 256, 0, 128, 256);
		ctx.drawImage(img, 0, 0, 256, 256, 0, -128, 256, 128);
		ctx.drawImage(img, 0, 0, 256, 256, 0, 256, 256, 128);
	});
	img.src = "../../resources/green1x1.png";
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
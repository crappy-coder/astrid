var CANVAS_WIDTH = 320;
var CANVAS_HEIGHT = 300;

var gCanvas = null;

window.addEventListener("load", function() {
	setup();

	var ctx = gCanvas.getContext("2d");
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	
	draw(ctx);
});

function draw(ctx) {
	ctx.strokeStyle = "#0f0";
	
	var y = 4.5;
	
	// default (butt)
	for(var i = 1; i <= 20; i++)
	{	
		ctx.lineWidth = i;
		ctx.lineCap = "butt";
		ctx.beginPath();
		ctx.moveTo(10, y);
		ctx.lineTo(90, y);
		ctx.stroke();
		
		y += i + 4.5;
	}

	// round
	y = 4.5;
	
	for(var i = 1; i <= 20; i++)
	{	
		ctx.lineWidth = i;
		ctx.lineCap = "round";
		ctx.beginPath();
		ctx.moveTo(110, y);
		ctx.lineTo(190, y);
		ctx.stroke();
		
		y += i + 4.5;
	}
	
	// square
	y = 4.5;
	
	for(var i = 1; i <= 20; i++)
	{	
		ctx.lineWidth = i;
		ctx.lineCap = "square";
		ctx.beginPath();
		ctx.moveTo(220, y);
		ctx.lineTo(300, y);
		ctx.stroke();
		
		y += i + 4.5;
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
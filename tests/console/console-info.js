
window.addEventListener("load", function() {
	// basic
	console.info("The green frog jumped on the green lilypad.");
	
	// concat
	console.info("The", "green", "frog", "jumped", "on", "the", "green", "lilypad.");
	
	// string subtitution
	var str = "green";
	console.info("The %s frog jumped on the %s lilypad.", str, str);
	
	// integer subtitution
	var a = 8; var b = 18; var c = 1981;
	console.info("My birthday is %d/%i/%d.", a, b, c);
	
	// float subtitution
	var f = Math.exp(1);
	console.info("Math.E = %f", f);
	
	// object hyperlink
	var obj = {one:1, two:"2"};
	console.info("Object: %o", obj);
	
	// style
	console.info("%cGreen on black... With %cBOLD TEXT", "color:green; background-color:black", "color:green; background-color:black;font-weight:bold");
	
	// vars
	console.info(str);
	console.info(a, b, c);
	console.info(f);
	console.info(obj);
	
	// other
	console.info(1 / 0);
	console.info(-1 / 0);
	console.info(1 / "one");
});
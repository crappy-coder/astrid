
window.addEventListener("load", function() {
	// basic
	console.debug("The green frog jumped on the green lilypad.");
	
	// concat
	console.debug("The", "green", "frog", "jumped", "on", "the", "green", "lilypad.");
	
	// string subtitution
	var str = "green";
	console.debug("The %s frog jumped on the %s lilypad.", str, str);
	
	// integer subtitution
	var a = 8; var b = 18; var c = 1981;
	console.debug("My birthday is %d/%i/%d.", a, b, c);
	
	// float subtitution
	var f = Math.exp(1);
	console.debug("Math.E = %f", f);
	
	// object hyperlink
	var obj = {one:1, two:"2"};
	console.debug("Object: %o", obj);
	
	// style
	console.debug("%cGreen on black... With %cBOLD TEXT", "color:green; background-color:black", "color:green; background-color:black;font-weight:bold");
	
	// vars
	console.debug(str);
	console.debug(a, b, c);
	console.debug(f);
	console.debug(obj);
	
	// other
	console.debug(1 / 0);
	console.debug(-1 / 0);
	console.debug(1 / "one");
});
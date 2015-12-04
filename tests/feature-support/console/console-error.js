
window.addEventListener("load", function() {
	// basic
	console.error("The green frog jumped on the green lilypad.");
	
	// concat
	console.error("The", "green", "frog", "jumped", "on", "the", "green", "lilypad.");
	
	// string subtitution
	var str = "green";
	console.error("The %s frog jumped on the %s lilypad.", str, str);
	
	// integer subtitution
	var a = 8; var b = 18; var c = 1981;
	console.error("My birthday is %d/%i/%d.", a, b, c);
	
	// float subtitution
	var f = Math.exp(1);
	console.error("Math.E = %f", f);
	
	// object hyperlink
	var obj = {one:1, two:"2"};
	console.error("Object: %o", obj);
	
	// style
	console.error("%cGreen on black... With %cBOLD TEXT", "color:green; background-color:black", "color:green; background-color:black;font-weight:bold");
	
	// vars
	console.error(str);
	console.error(a, b, c);
	console.error(f);
	console.error(obj);
	
	// other
	console.error(1 / 0);
	console.error(-1 / 0);
	console.error(1 / "one");
});
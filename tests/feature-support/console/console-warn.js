
window.addEventListener("load", function() {
	// basic
	console.warn("The green frog jumped on the green lilypad.");
	
	// concat
	console.warn("The", "green", "frog", "jumped", "on", "the", "green", "lilypad.");
	
	// string subtitution
	var str = "green";
	console.warn("The %s frog jumped on the %s lilypad.", str, str);
	
	// integer subtitution
	var a = 8; var b = 18; var c = 1981;
	console.warn("My birthday is %d/%i/%d.", a, b, c);
	
	// float subtitution
	var f = Math.exp(1);
	console.warn("Math.E = %f", f);
	
	// object hyperlink
	var obj = {one:1, two:"2"};
	console.warn("Object: %o", obj);
	
	// style
	console.warn("%cGreen on black... With %cBOLD TEXT", "color:green; background-color:black", "color:green; background-color:black;font-weight:bold");
	
	// vars
	console.warn(str);
	console.warn(a, b, c);
	console.warn(f);
	console.warn(obj);
	
	// other
	console.warn(1 / 0);
	console.warn(-1 / 0);
	console.warn(1 / "one");
});
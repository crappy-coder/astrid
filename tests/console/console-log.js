
window.addEventListener("load", function() {
	// basic
	console.log("The green frog jumped on the green lilypad.");
	
	// concat
	console.log("The", "green", "frog", "jumped", "on", "the", "green", "lilypad.");
	
	// string subtitution
	var str = "green";
	console.log("The %s frog jumped on the %s lilypad.", str, str);
	
	// integer subtitution
	var a = 8; var b = 18; var c = 1981;
	console.log("My birthday is %d/%i/%d.", a, b, c);
	
	// float subtitution
	var f = Math.exp(1);
	console.log("Math.E = %f", f);
	
	// object hyperlink
	var obj = {one:1, two:"2"};
	console.log("Object: %o", obj);
	
	// style
	console.log("%cGreen on black... With %cBOLD TEXT", "color:green; background-color:black", "color:green; background-color:black;font-weight:bold");
	
	// vars
	console.log(str);
	console.log(a, b, c);
	console.log(f);
	console.log(obj);
	
	// other
	console.log(1 / 0);
	console.log(-1 / 0);
	console.log(1 / "one");
});
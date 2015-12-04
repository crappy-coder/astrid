
window.addEventListener("load", function() {
	console.count();
	console.count("One");
	
	for(var i = 0; i < 10; ++i)
		console.count("Ten:");
});